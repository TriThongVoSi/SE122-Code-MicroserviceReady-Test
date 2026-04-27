import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:5173";
const TEST_TIMEOUT_MS = 25_000;

const ACCOUNTS = {
  farmer: {
    label: "farmer",
    email: "farmer@acm.local",
    password: "12345678",
  },
  farmer2: {
    label: "farmer2",
    email: "farmer2@acm.local",
    password: "12345678",
  },
};

function nowIso() {
  return new Date().toISOString();
}

function serializeError(error) {
  if (!error) {
    return "Unknown error";
  }
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

function createAccountReport(label) {
  return {
    label,
    login: {
      success: false,
      redirectUrl: null,
      error: null,
    },
    chat: {
      opened: false,
      currentUserIdLabel: null,
      bootstrapErrorText: null,
      uiErrorText: null,
      conversationOpened: false,
      sentMessages: [],
      receivedMessages: [],
    },
    consoleErrors: [],
    pageErrors: [],
    requestFailures: [],
    httpEvents: [],
  };
}

function addHttpEvent(report, type, url, statusOrError) {
  if (!url.includes("/api/v1/firebase/chat-token") && !url.includes("firestore.googleapis.com")) {
    return;
  }
  if (report.httpEvents.length >= 120) {
    return;
  }
  report.httpEvents.push({
    at: nowIso(),
    type,
    url,
    value: statusOrError,
  });
}

async function attachTelemetry(page, report) {
  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }
    if (report.consoleErrors.length >= 80) {
      return;
    }
    report.consoleErrors.push({
      at: nowIso(),
      text: message.text(),
      location: message.location(),
    });
  });

  page.on("pageerror", (error) => {
    if (report.pageErrors.length >= 80) {
      return;
    }
    report.pageErrors.push({
      at: nowIso(),
      error: serializeError(error),
    });
  });

  page.on("requestfailed", (request) => {
    if (report.requestFailures.length >= 80) {
      return;
    }
    report.requestFailures.push({
      at: nowIso(),
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText ?? "UNKNOWN",
    });
  });

  page.on("response", (response) => {
    addHttpEvent(report, "response", response.url(), response.status());
  });
}

async function waitForPostLoginRedirect(page) {
  await page.waitForURL(/\/(farmer|admin|employee|marketplace)(\/|$)/, {
    timeout: TEST_TIMEOUT_MS,
  });
}

async function login(page, account, report) {
  try {
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "domcontentloaded" });
    await page.locator("#email").fill(account.email);
    await page.locator("#password").fill(account.password);
    await page.locator('button[type="submit"]').first().click();
    await waitForPostLoginRedirect(page);
    report.login.success = true;
    report.login.redirectUrl = page.url();
  } catch (error) {
    report.login.success = false;
    report.login.error = serializeError(error);
    throw error;
  }
}

async function openChatPage(page, report) {
  await page.goto(`${BASE_URL}/chat`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  const bootstrapFailed = page.getByText("Chat bootstrap failed", { exact: false });
  if ((await bootstrapFailed.count()) > 0 && (await bootstrapFailed.first().isVisible())) {
    report.chat.bootstrapErrorText = await page.locator("section").first().innerText();
    return;
  }

  await page.getByText("Direct conversations", { exact: false }).first().waitFor({
    state: "visible",
    timeout: TEST_TIMEOUT_MS,
  });
  report.chat.opened = true;

  const idLabelLocator = page.getByText("Your user ID:", { exact: false }).first();
  if ((await idLabelLocator.count()) > 0) {
    report.chat.currentUserIdLabel = (await idLabelLocator.innerText()).trim();
  }

  const uiErrorLocator = page.locator("p.text-xs.text-red-600").first();
  if ((await uiErrorLocator.count()) > 0 && (await uiErrorLocator.isVisible())) {
    report.chat.uiErrorText = (await uiErrorLocator.innerText()).trim();
  }
}

async function startDirectConversation(page, targetUserId, report) {
  const chatListPanel = page.locator("aside").filter({ hasText: "Direct conversations" }).first();
  const peerInput = chatListPanel.locator("input").first();
  const startBtn = chatListPanel.getByRole("button", { name: "Start", exact: true });

  await peerInput.fill(String(targetUserId));
  await startBtn.click();

  const threadHeader = page.getByText("Thread:", { exact: false }).first();
  await threadHeader.waitFor({ state: "visible", timeout: TEST_TIMEOUT_MS });
  report.chat.conversationOpened = true;
}

async function sendMessage(page, message, report) {
  const composer = page.locator("textarea").first();
  await composer.waitFor({ state: "visible", timeout: TEST_TIMEOUT_MS });
  await composer.fill(message);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.getByText(message, { exact: false }).first().waitFor({
    state: "visible",
    timeout: TEST_TIMEOUT_MS,
  });
  report.chat.sentMessages.push(message);
}

async function waitForMessage(page, message, report) {
  await page.getByText(message, { exact: false }).first().waitFor({
    state: "visible",
    timeout: TEST_TIMEOUT_MS,
  });
  report.chat.receivedMessages.push(message);
}

async function captureScreenshot(page, fileName) {
  await page.screenshot({
    path: `d:/SE122-Code-MicroserviceReady/tmp-${fileName}.png`,
    fullPage: true,
  });
}

async function run() {
  const report = {
    startedAt: nowIso(),
    baseUrl: BASE_URL,
    accounts: {
      farmer: createAccountReport("farmer"),
      farmer2: createAccountReport("farmer2"),
    },
    flow: {
      step: "init",
      success: false,
      error: null,
    },
    finishedAt: null,
  };

  const browser = await chromium.launch({ headless: true });
  const farmerContext = await browser.newContext();
  const farmer2Context = await browser.newContext();
  const farmerPage = await farmerContext.newPage();
  const farmer2Page = await farmer2Context.newPage();

  await attachTelemetry(farmerPage, report.accounts.farmer);
  await attachTelemetry(farmer2Page, report.accounts.farmer2);

  try {
    report.flow.step = "login";
    await Promise.all([
      login(farmerPage, ACCOUNTS.farmer, report.accounts.farmer),
      login(farmer2Page, ACCOUNTS.farmer2, report.accounts.farmer2),
    ]);

    report.flow.step = "open_chat";
    await Promise.all([
      openChatPage(farmerPage, report.accounts.farmer),
      openChatPage(farmer2Page, report.accounts.farmer2),
    ]);

    report.flow.step = "start_conversation";
    await startDirectConversation(farmer2Page, 2, report.accounts.farmer2);
    await waitForMessage(farmerPage, "No messages yet", report.accounts.farmer);
    await farmerPage.getByText("User 4", { exact: false }).first().click();
    report.accounts.farmer.chat.conversationOpened = true;

    const testId = Date.now();
    const messageFromFarmer2 = `E2E test from farmer2 ${testId}`;
    const messageFromFarmer = `Reply from farmer ${testId}`;

    report.flow.step = "exchange_messages";
    await sendMessage(farmer2Page, messageFromFarmer2, report.accounts.farmer2);
    await waitForMessage(farmerPage, messageFromFarmer2, report.accounts.farmer);

    await sendMessage(farmerPage, messageFromFarmer, report.accounts.farmer);
    await waitForMessage(farmer2Page, messageFromFarmer, report.accounts.farmer2);

    report.flow.step = "screenshots";
    await Promise.all([
      captureScreenshot(farmerPage, "chat-farmer"),
      captureScreenshot(farmer2Page, "chat-farmer2"),
    ]);

    report.flow.success = true;
  } catch (error) {
    report.flow.error = serializeError(error);
    try {
      await captureScreenshot(farmerPage, "chat-farmer-error");
    } catch {}
    try {
      await captureScreenshot(farmer2Page, "chat-farmer2-error");
    } catch {}
  } finally {
    report.finishedAt = nowIso();
    await farmerContext.close();
    await farmer2Context.close();
    await browser.close();
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.flow.success) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  process.stdout.write(
    JSON.stringify(
      {
        fatal: true,
        error: serializeError(error),
      },
      null,
      2
    ) + "\n"
  );
  process.exit(1);
});
