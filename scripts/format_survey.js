const fs = require('fs');
const path = require('path');

const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'SURVEY_RESULTS.md'), 'utf-8'));

let report = `# ACM Backend Architecture Survey

## 1. Controllers & API Endpoints

Below is a complete list of all \`/api/v1/...\` controllers and their endpoints, categorized by module:

`;

// Group controllers by module
const controllersByModule = {};
rawData.controllers.forEach(c => {
    if (!controllersByModule[c.module]) {
        controllersByModule[c.module] = [];
    }
    controllersByModule[c.module].push(c);
});

Object.keys(controllersByModule).sort().forEach(mod => {
    report += `### Module: \`${mod}\`\n\n`;
    controllersByModule[mod].forEach(c => {
        report += `#### \`${c.className}\` (Base path: \`${c.basePath}\`)\n`;
        report += `| Method | Route | Java Method |\n`;
        report += `|---|---|---|\n`;
        c.mappings.forEach(m => {
            report += `| **${m.method}** | \`${m.path}\` | \`${m.methodName}\` |\n`;
        });
        report += `\n`;
    });
});

report += `\n## 2. Entities, Repositories, and Tables

Below are the JPA Entities, their corresponding database tables, and repositories organized by module/domain:

`;

// Group entities by module
const entitiesByModule = {};
rawData.entities.forEach(e => {
    if (!entitiesByModule[e.module]) {
        entitiesByModule[e.module] = [];
    }
    entitiesByModule[e.module].push(e);
});

// Group repositories by module
const reposByModule = {};
rawData.repositories.forEach(r => {
    if (!reposByModule[r.module]) {
        reposByModule[r.module] = [];
    }
    reposByModule[r.module].push(r);
});

const allModules = new Set([...Object.keys(entitiesByModule), ...Object.keys(reposByModule)]);

Array.from(allModules).sort().forEach(mod => {
    report += `### Module/Domain: \`${mod}\`\n\n`;
    
    report += `#### Entities & Tables:\n`;
    if (entitiesByModule[mod]) {
        report += `| Entity Class | DB Table Name | JPA Relationships |\n`;
        report += `|---|---|---|\n`;
        entitiesByModule[mod].forEach(e => {
            const rels = e.relationships.map(r => `\`@${r.type}\` target: \`${r.targetType}\` (\`${r.fieldName}\`)`).join('<br>');
            report += `| \`${e.className}\` | \`${e.tableName}\` | ${rels || 'None'} |\n`;
        });
    } else {
        report += `*No entities found.*\n`;
    }
    report += `\n`;

    report += `#### Repositories:\n`;
    if (reposByModule[mod]) {
        reposByModule[mod].forEach(r => {
            report += `- \`${r.className}\`\n`;
        });
    } else {
        report += `*No repositories found.*\n`;
    }
    report += `\n`;
});

report += `\n## 3. Cross-Module JPA & Code Dependencies

To make the codebase microservice-ready, we must identify and freeze cross-module dependencies. These show where modules call other modules' entities, repositories, or services directly.

### Inter-Module Code References:
`;

if (rawData.crossModuleDependencies.length > 0) {
    report += `| Source Module | Source Class | Target Module | Target Class | Dependency Type |\n`;
    report += `|---|---|---|---|---|\n`;
    
    // Sort dependencies by fromModule, toModule
    rawData.crossModuleDependencies.sort((a, b) => {
        if (a.fromModule !== b.fromModule) return a.fromModule.localeCompare(b.fromModule);
        return a.toModule.localeCompare(b.toModule);
    }).forEach(dep => {
        report += `| \`${dep.fromModule}\` | \`${dep.fromClass}\` | \`${dep.toModule}\` | \`${dep.toClass}\` | **${dep.type}** |\n`;
    });
} else {
    report += `*No cross-module dependencies found in import statements (modules are isolated or communicate cleanly).* \n`;
}

fs.writeFileSync(path.join(__dirname, '..', 'docs', 'SURVEY_RESULTS_REPORT.md'), report);
console.log('Formatted and wrote SURVEY_RESULTS_REPORT.md');
