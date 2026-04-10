const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const FRONTEND_ROOT = path.resolve(
  REPO_ROOT,
  "agricultural-crop-management-frontend",
  "src",
);
const BACKEND_ROOT = path.resolve(
  REPO_ROOT,
  "agricultural-crop-management-backend",
  "src",
  "main",
  "java",
  "org",
  "example",
  "QuanLyMuaVu",
);
const OUTPUT_PATH = path.resolve(REPO_ROOT, "api-route-audit.json");
const CONFIG_PATH = path.resolve(REPO_ROOT, "scripts", "route-audit.config.json");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function normalizePath(raw) {
  if (!raw) return "/";
  let value = String(raw).trim().replace(/^[`"' ]+|[`"' ]+$/g, "");
  value = value.replace(/\$\{[^}]+\}/g, "{var}");
  value = value.split("?")[0];
  if (!value.startsWith("/")) value = `/${value}`;
  value = value.replace(/\/+/g, "/");
  if (value.length > 1 && value.endsWith("/")) value = value.slice(0, -1);
  return value;
}

function segments(routePath) {
  return normalizePath(routePath).split("/").filter(Boolean);
}

function isPathMatch(frontPath, backPath) {
  const a = segments(frontPath);
  const b = segments(backPath);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const af = a[i];
    const bb = b[i];
    if (/^\{.+\}$/.test(af) || /^\{.+\}$/.test(bb)) continue;
    if (af !== bb) return false;
  }
  return true;
}

function dedupeByMethodPath(rows) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const key = `${row.method} ${row.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(row);
    }
  }
  return out;
}

function toRepoRelativePath(absolutePath) {
  return path.relative(REPO_ROOT, absolutePath).replace(/\\/g, "/");
}

function parseArgs(argv) {
  const options = {
    failOnDrift: false,
    outputPath: OUTPUT_PATH,
  };

  for (const arg of argv) {
    if (arg === "--fail-on-drift") {
      options.failOnDrift = true;
      continue;
    }
    if (arg.startsWith("--output=")) {
      const out = arg.split("=", 2)[1];
      options.outputPath = path.resolve(REPO_ROOT, out);
      continue;
    }
  }

  return options;
}

function extractStringLiterals(input) {
  if (!input) return [];
  const values = [];
  const regex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    values.push(match[1]);
  }
  return values;
}

function extractMappingPaths(annotationArgs) {
  if (!annotationArgs || !annotationArgs.trim()) {
    return [""];
  }

  const args = annotationArgs.trim();
  const namedValues = [];
  const namedRegex =
    /(?:path|value)\s*=\s*(\{[\s\S]*?\}|"(?:\\.|[^"\\])*")/g;
  let namedMatch;
  while ((namedMatch = namedRegex.exec(args)) !== null) {
    namedValues.push(...extractStringLiterals(namedMatch[1]));
  }
  if (namedValues.length > 0) {
    return namedValues;
  }

  const positionalMatch = args.match(
    /^\s*(\{[\s\S]*?\}|"(?:\\.|[^"\\])*")/,
  );
  if (positionalMatch) {
    const positionalValues = extractStringLiterals(positionalMatch[1]);
    if (positionalValues.length > 0) {
      return positionalValues;
    }
  }

  return [""];
}

function extractRequestMethods(annotationArgs) {
  if (!annotationArgs) return [];
  const methods = [];
  const regex = /RequestMethod\.(GET|POST|PUT|PATCH|DELETE)/g;
  let match;
  while ((match = regex.exec(annotationArgs)) !== null) {
    methods.push(match[1]);
  }
  return [...new Set(methods)];
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { ignoreRules: [] };
  }

  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const ignoreRules = Array.isArray(parsed.ignoreRules)
    ? parsed.ignoreRules
    : [];

  return {
    ignoreRules: ignoreRules
      .map((rule) => {
        if (!rule || typeof rule !== "object") return null;
        const method = (rule.method || "*").toUpperCase();
        const pathRegex = String(rule.pathRegex || "").trim();
        if (!pathRegex) return null;

        return {
          method,
          pathRegex,
          reason: String(rule.reason || "ignored-by-config"),
          matcher: new RegExp(pathRegex),
        };
      })
      .filter(Boolean),
  };
}

function classifyWithIgnore(rows, rules, kind) {
  const unresolved = [];
  const ignored = [];

  for (const row of rows) {
    const matchedRule = rules.find((rule) => {
      const methodMatched = rule.method === "*" || rule.method === row.method;
      return methodMatched && rule.matcher.test(row.path);
    });

    if (!matchedRule) {
      unresolved.push(row);
      continue;
    }

    ignored.push({
      ...row,
      kind,
      reason: matchedRule.reason,
      rule: {
        method: matchedRule.method,
        pathRegex: matchedRule.pathRegex,
      },
    });
  }

  return { unresolved, ignored };
}

function extractFrontendCalls() {
  const files = walk(FRONTEND_ROOT).filter((file) =>
    /\.(ts|tsx|js|jsx)$/i.test(file),
  );

  const callRegex =
    /httpClient\.(get|post|put|patch|delete)\(\s*(["'`])([^"'`]+)\2/gi;
  const calls = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    let match;
    while ((match = callRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const routePath = normalizePath(match[3]);
      if (routePath.startsWith("/api/")) {
        calls.push({ method, path: routePath, file: toRepoRelativePath(file) });
      }
    }
  }

  return dedupeByMethodPath(
    calls.sort((a, b) =>
      `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`),
    ),
  );
}

function extractBackendRoutes() {
  const files = walk(BACKEND_ROOT).filter((file) => {
    if (!/\.java$/i.test(file)) return false;
    const normalized = file.replace(/\\/g, "/");
    return (
      /\/controller\//i.test(normalized) ||
      /\/Controller\//.test(normalized) ||
      /HealthController\.java$/.test(normalized)
    );
  });
  const classRegex = /@RequestMapping(?:\s*\(([\s\S]*?)\))?/g;
  const methodRegex = /@(Get|Post|Put|Patch|Delete|Request)Mapping(?:\s*\(([\s\S]*?)\))?/g;
  const routes = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const classIndex = Math.max(content.indexOf(" class "), 0);
    const classHeader = content.slice(0, classIndex);
    const classAnnotationMatches = [...classHeader.matchAll(classRegex)];
    const classArgs =
      classAnnotationMatches.length > 0
        ? classAnnotationMatches[classAnnotationMatches.length - 1][1] || ""
        : "";
    const classPaths = extractMappingPaths(classArgs);
    const body = content.slice(classIndex);

    let mappingMatch;
    while ((mappingMatch = methodRegex.exec(body)) !== null) {
      const mappingType = mappingMatch[1];
      const args = mappingMatch[2] || "";
      const methods =
        mappingType === "Request"
          ? extractRequestMethods(args)
          : [mappingType.toUpperCase()];
      if (methods.length === 0) {
        continue;
      }

      const subPaths = extractMappingPaths(args);
      for (const method of methods) {
        for (const classPath of classPaths) {
          for (const subPath of subPaths) {
            routes.push({
              method,
              path: normalizePath(`${classPath}/${subPath}`),
              file: toRepoRelativePath(file),
            });
          }
        }
      }
    }
  }

  return dedupeByMethodPath(
    routes.sort((a, b) =>
      `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`),
    ),
  );
}

function bucket(pathValue) {
  if (pathValue.startsWith("/api/v1/admin/")) return "admin";
  if (pathValue.startsWith("/api/v1/farmer/")) return "farmer";
  if (pathValue.startsWith("/api/v1/buyer/")) return "buyer";
  return "shared";
}

function run() {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const frontendCalls = extractFrontendCalls();
  const backendRoutes = extractBackendRoutes();
  const rawMissing = [];
  const rawMethodMismatch = [];

  for (const front of frontendCalls) {
    const sameMethodMatched = backendRoutes.some(
      (route) =>
        route.method === front.method && isPathMatch(front.path, route.path),
    );
    if (sameMethodMatched) continue;

    const anyMethodMatches = backendRoutes.filter((route) =>
      isPathMatch(front.path, route.path),
    );

    if (anyMethodMatches.length > 0) {
      rawMethodMismatch.push({
        method: front.method,
        path: front.path,
        availableMethods: [...new Set(anyMethodMatches.map((x) => x.method))],
        file: front.file,
      });
    } else {
      rawMissing.push(front);
    }
  }

  const missingClassification = classifyWithIgnore(
    rawMissing,
    config.ignoreRules,
    "missing",
  );
  const mismatchClassification = classifyWithIgnore(
    rawMethodMismatch,
    config.ignoreRules,
    "methodMismatch",
  );
  const missing = missingClassification.unresolved;
  const methodMismatch = mismatchClassification.unresolved;
  const ignored = [
    ...missingClassification.ignored,
    ...mismatchClassification.ignored,
  ].sort((a, b) =>
    `${a.kind} ${a.method} ${a.path}`.localeCompare(
      `${b.kind} ${b.method} ${b.path}`,
    ),
  );

  const missingByBucket = {};
  for (const item of missing) {
    const key = bucket(item.path);
    missingByBucket[key] = (missingByBucket[key] || 0) + 1;
  }

  const rawMissingByBucket = {};
  for (const item of rawMissing) {
    const key = bucket(item.path);
    rawMissingByBucket[key] = (rawMissingByBucket[key] || 0) + 1;
  }

  const ignoredByReason = {};
  for (const item of ignored) {
    ignoredByReason[item.reason] = (ignoredByReason[item.reason] || 0) + 1;
  }

  const driftCount = missing.length + methodMismatch.length;

  const report = {
    generatedAt: new Date().toISOString(),
    frontendCalls: frontendCalls.length,
    backendRoutes: backendRoutes.length,
    rawMissingCount: rawMissing.length,
    rawMethodMismatchCount: rawMethodMismatch.length,
    rawMissingByBucket,
    ignoredCount: ignored.length,
    ignoredByReason,
    driftCount,
    missingCount: missing.length,
    methodMismatchCount: methodMismatch.length,
    missingByBucket,
    ignored,
    missing,
    methodMismatch,
  };

  fs.writeFileSync(options.outputPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`Report written: ${options.outputPath}`);
  console.log(
    JSON.stringify(
      {
        driftCount: report.driftCount,
        rawMissingCount: report.rawMissingCount,
        rawMethodMismatchCount: report.rawMethodMismatchCount,
        ignoredCount: report.ignoredCount,
        missingCount: report.missingCount,
        methodMismatchCount: report.methodMismatchCount,
        missingByBucket: report.missingByBucket,
      },
      null,
      2,
    ),
  );

  if (options.failOnDrift && driftCount > 0) {
    process.exitCode = 1;
  }
}

run();
