import fs from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const OUTPUT_REPORT_FILE = "d:/SE122-Code-MicroserviceReady/tmp-chat-browser-report.json";
const SCREENSHOT_FARMER = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer.png";
const SCREENSHOT_FARMER2 = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer2.png";
const SCREENSHOT_ERROR_FARMER = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer-error.png";
const SCREENSHOT_ERROR_FARMER2 = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer2-error.png";

const ACCOUNTS = {
  farmer: {
    email: "farmer@acm.local",
    password: "12345678",
    expectedPeerLabel: /User 4/i,
  },
  farmer2: {
    email: "farmer2@acm.local",
    password: "12345678",
    expectedPeerLabel: /User 2/i,
  },
} as const;

function nowIso() {
  return new Date().toISOString();
}

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

function createAccountReport(label: string) {
  return {
    label,
    login: {
      success: false,
      redirectUrl: null as string | null,
      error: null as string | null,
    },
    chat: {
      opened: false,
      currentUserIdLabel: null as string | null,
      bootstrapErrorText: null as string | null,
      uiErrorText: null as string | null,
      conversationOpened: false,
      sentMessages: [] as string[],
      receivedMessages: [] as string[],
    },
    consoleErrors: [] as Array<{
      at: string;
      text: string;
      location: { url?: string; lineNumber?: number; columnNumber?: number };
    }>,
    pageErrors: [] as Array<{ at: string; error: string }>,
    requestFailures: [] as Array<{
      at: string;
      url: string;
      method: string;
      failure: string;
    }>,
    httpEvents: [] as Array<{
      at: string;
      type: "request" | "response";
      url: string;
      value: string | number;
    }>,
  };
}

function trackHttpEvent(
  accountReport: ReturnType<typeof createAccountReport>,
  type: "request" | "response",
  url: string,
  value: string | number
) {
  if (!url.includes("/api/v1/firebase/chat-token") && !url.includes("firestore.googleapis.com")) {
    return;
  }
  if (accountReport.httpEvents.length >= 200) {
    return;
  }
  accountReport.httpEvents.push({
    at: nowIso(),
    type,
    url,
    value,
  });
}

function attachTelemetry(page: Page, accountReport: ReturnType<typeof createAccountReport>) {
  page.on("request", (request) => {
    trackHttpEvent(accountReport, "request", request.url(), request.method());
  });

  page.on("response", (response) => {
    trackHttpEvent(accountReport, "response", response.url(), response.status());
  });

  page.on("console", (message) => {
    if (message.type() !== "error" || accountReport.consoleErrors.length >= 120) {
      return;
    }
    accountReport.consoleErrors.push({
      at: nowIso(),
      text: message.text(),
      location: message.location(),
    });
  });

  page.on("pageerror", (error) => {
    if (accountReport.pageErrors.length >= 120) {
      return;
    }
    accountReport.pageErrors.push({
      at: nowIso(),
      error: serializeError(error),
    });
  });

  page.on("requestfailed", (request) => {
    if (accountReport.requestFailures.length >= 120) {
      return;
    }
    accountReport.requestFailures.push({
      at: nowIso(),
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText ?? "UNKNOWN",
    });
  });
}

async function login(page: Page, email: string, password: string, accountReport: ReturnType<typeof createAccountReport>) {
  try {
    await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/(farmer|admin|employee|marketplace)(\/|$)/, { timeout: 30_000 });
    accountReport.login.success = true;
    accountReport.login.redirectUrl = page.url();
  } catch (error) {
    accountReport.login.success = false;
    accountReport.login.error = serializeError(error);
    throw error;
  }
}

async function openChat(page: Page, accountReport: ReturnType<typeof createAccountReport>) {
  await page.goto("/chat", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");

  const bootstrapFailed = page.getByText("Chat bootstrap failed", { exact: false });
  if ((await bootstrapFailed.count()) > 0 && (await bootstrapFailed.first().isVisible())) {
    accountReport.chat.bootstrapErrorText = await page.locator("section").first().innerText();
    return;
  }

  await page.getByText("Direct conversations", { exact: false }).first().waitFor({
    state: "visible",
    timeout: 30_000,
  });
  accountReport.chat.opened = true;

  const uidLabel = page.getByText("Your user ID:", { exact: false }).first();
  if ((await uidLabel.count()) > 0) {
    accountReport.chat.currentUserIdLabel = (await uidLabel.innerText()).trim();
  }

  const errorText = page.locator("p.text-xs.text-red-600").first();
  if ((await errorText.count()) > 0 && (await errorText.isVisible())) {
    accountReport.chat.uiErrorText = (await errorText.innerText()).trim();
  }
}

async function startConversation(page: Page, peerId: string | number, accountReport: ReturnType<typeof createAccountReport>) {
  const panel = page.locator("aside").filter({ hasText: "Direct conversations" }).first();
  await panel.locator("input").first().fill(String(peerId));
  await panel.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByText("Thread:", { exact: false }).first().waitFor({ state: "visible", timeout: 20_000 });
  accountReport.chat.conversationOpened = true;
}

async function sendMessage(page: Page, message: string, accountReport: ReturnType<typeof createAccountReport>) {
  const composer = page.locator("textarea").first();
  await composer.waitFor({ state: "visible", timeout: 20_000 });
  await composer.fill(message);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(message, { exact: false }).first()).toBeVisible({ timeout: 20_000 });
  accountReport.chat.sentMessages.push(message);
}

async function waitForMessage(page: Page, message: string, accountReport: ReturnType<typeof createAccountReport>) {
  await expect(page.getByText(message, { exact: false }).first()).toBeVisible({ timeout: 20_000 });
  accountReport.chat.receivedMessages.push(message);
}

test("chat E2E between farmer and farmer2", async ({ browser }) => {
  const report = {
    startedAt: nowIso(),
    accounts: {
      farmer: createAccountReport("farmer"),
      farmer2: createAccountReport("farmer2"),
    },
    flow: {
      success: false,
      step: "init",
      error: null as string | null,
    },
    finishedAt: null as string | null,
  };

  const farmerContext = await browser.newContext();
  const farmer2Context = await browser.newContext();
  const farmerPage = await farmerContext.newPage();
  const farmer2Page = await farmer2Context.newPage();

  attachTelemetry(farmerPage, report.accounts.farmer);
  attachTelemetry(farmer2Page, report.accounts.farmer2);

  try {
    report.flow.step = "login";
    await Promise.all([
      login(farmerPage, ACCOUNTS.farmer.email, ACCOUNTS.farmer.password, report.accounts.farmer),
      login(farmer2Page, ACCOUNTS.farmer2.email, ACCOUNTS.farmer2.password, report.accounts.farmer2),
    ]);

    report.flow.step = "open_chat";
    await Promise.all([
      openChat(farmerPage, report.accounts.farmer),
      openChat(farmer2Page, report.accounts.farmer2),
    ]);

    report.flow.step = "start_conversation";
    await startConversation(farmer2Page, 2, report.accounts.farmer2);
    await expect(farmerPage.getByRole("button", { name: ACCOUNTS.farmer.expectedPeerLabel }).first()).toBeVisible({
      timeout: 20_000,
    });
    await farmerPage.getByRole("button", { name: ACCOUNTS.farmer.expectedPeerLabel }).first().click();
    report.accounts.farmer.chat.conversationOpened = true;

    const runId = Date.now();
    const messageFromFarmer2 = `E2E: farmer2 -> farmer (${runId})`;
    const messageFromFarmer = `E2E: farmer -> farmer2 (${runId})`;

    report.flow.step = "exchange_messages";
    await sendMessage(farmer2Page, messageFromFarmer2, report.accounts.farmer2);
    await waitForMessage(farmerPage, messageFromFarmer2, report.accounts.farmer);

    await sendMessage(farmerPage, messageFromFarmer, report.accounts.farmer);
    await waitForMessage(farmer2Page, messageFromFarmer, report.accounts.farmer2);

    report.flow.step = "snapshot";
    await farmerPage.screenshot({ path: SCREENSHOT_FARMER, fullPage: true });
    await farmer2Page.screenshot({ path: SCREENSHOT_FARMER2, fullPage: true });

    report.flow.success = true;
  } catch (error) {
    report.flow.error = serializeError(error);
    try {
      await farmerPage.screenshot({ path: SCREENSHOT_ERROR_FARMER, fullPage: true });
    } catch {}
    try {
      await farmer2Page.screenshot({ path: SCREENSHOT_ERROR_FARMER2, fullPage: true });
    } catch {}
  } finally {
    report.finishedAt = nowIso();
    fs.writeFileSync(OUTPUT_REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
    await farmerContext.close();
    await farmer2Context.close();
  }

  expect(report.flow.success, report.flow.error ?? "Unknown flow error").toBe(true);
});
