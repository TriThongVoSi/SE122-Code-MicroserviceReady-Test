import fs from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const OUTPUT_REPORT_FILE = "d:/SE122-Code-MicroserviceReady/tmp-chat-browser-report.json";
const SCREENSHOT_FARMER = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer.png";
const SCREENSHOT_FARMER2 = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer2.png";
const SCREENSHOT_ERROR_FARMER = "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer-error.png";
const SCREENSHOT_ERROR_FARMER2 =
  "d:/SE122-Code-MicroserviceReady/tmp-chat-farmer2-error.png";

const ACCOUNTS = {
  farmer: {
    email: "farmer@acm.local",
    password: "12345678",
  },
  farmer2: {
    email: "farmer2@acm.local",
    password: "12345678",
  },
} as const;

type StepStatus = "pass" | "fail";

type AccountReport = ReturnType<typeof createAccountReport>;

function nowIso() {
  return new Date().toISOString();
}

function serializeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

function isPermissionDeniedText(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("permission-denied") ||
    normalized.includes("missing or insufficient permissions") ||
    normalized.includes("permission_denied") ||
    normalized.includes("\"code\":7")
  );
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
      bootstrapErrorText: null as string | null,
      uiErrorText: null as string | null,
      firebaseUid: null as string | null,
      selectedConversationId: null as string | null,
      conversationsCount: 0,
      messagesCount: 0,
      conversationOpened: false,
      sentMessages: [] as string[],
      receivedMessages: [] as string[],
    },
    consoleErrors: [] as Array<{
      at: string;
      text: string;
      location: { url?: string; lineNumber?: number; columnNumber?: number };
    }>,
    networkErrors: [] as Array<{
      at: string;
      url: string;
      method?: string;
      status?: number;
      error?: string;
      source: "requestfailed" | "http-response";
    }>,
    firestorePermissionErrors: [] as Array<{
      at: string;
      source: "console" | "http-response";
      url?: string;
      detail: string;
    }>,
  };
}

function appendFirestorePermissionError(
  accountReport: AccountReport,
  payload: {
    source: "console" | "http-response";
    detail: string;
    url?: string;
  }
) {
  if (accountReport.firestorePermissionErrors.length >= 120) {
    return;
  }
  accountReport.firestorePermissionErrors.push({
    at: nowIso(),
    source: payload.source,
    url: payload.url,
    detail: payload.detail.slice(0, 700),
  });
}

function attachTelemetry(page: Page, accountReport: AccountReport) {
  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }

    if (accountReport.consoleErrors.length < 120) {
      accountReport.consoleErrors.push({
        at: nowIso(),
        text: message.text(),
        location: message.location(),
      });
    }

    if (isPermissionDeniedText(message.text())) {
      appendFirestorePermissionError(accountReport, {
        source: "console",
        detail: message.text(),
      });
    }
  });

  page.on("requestfailed", (request) => {
    if (accountReport.networkErrors.length >= 120) {
      return;
    }
    accountReport.networkErrors.push({
      at: nowIso(),
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText ?? "UNKNOWN",
      source: "requestfailed",
    });
  });

  page.on("response", (response) => {
    const url = response.url();
    const status = response.status();
    const isTrackedRequest =
      url.includes("/api/v1/firebase/chat-token") || url.includes("firestore.googleapis.com");

    if (isTrackedRequest && status >= 400 && accountReport.networkErrors.length < 120) {
      accountReport.networkErrors.push({
        at: nowIso(),
        url,
        status,
        source: "http-response",
      });
    }

    if (!url.includes("firestore.googleapis.com")) {
      return;
    }

    void (async () => {
      try {
        const bodyText = await response.text();
        if (isPermissionDeniedText(bodyText)) {
          appendFirestorePermissionError(accountReport, {
            source: "http-response",
            detail: bodyText,
            url,
          });
        }
      } catch {
        // Ignore streaming body read errors.
      }
    })();
  });
}

function toNullableValue(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSafeInteger(value: string, fallback = 0): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function captureChatState(page: Page, accountReport: AccountReport) {
  const root = page.locator("section[data-chat-current-uid]").first();
  if ((await root.count()) > 0) {
    const state = await root.evaluate((node) => {
      const element = node as HTMLElement;
      return {
        firebaseUid: element.dataset.chatCurrentUid ?? "",
        selectedConversationId: element.dataset.chatSelectedConversationId ?? "",
        conversationsCount: element.dataset.chatConversationsCount ?? "0",
        messagesCount: element.dataset.chatMessagesCount ?? "0",
      };
    });

    accountReport.chat.firebaseUid = toNullableValue(state.firebaseUid);
    accountReport.chat.selectedConversationId = toNullableValue(state.selectedConversationId);
    accountReport.chat.conversationsCount = toSafeInteger(state.conversationsCount, 0);
    accountReport.chat.messagesCount = toSafeInteger(state.messagesCount, 0);
  } else {
    const selectedConversation = page
      .locator("[data-conversation-id][data-selected='true']")
      .first();
    const selectedConversationId = await selectedConversation.getAttribute("data-conversation-id");

    accountReport.chat.selectedConversationId = toNullableValue(selectedConversationId ?? "");
    accountReport.chat.conversationsCount = await page
      .locator("[data-conversation-id]")
      .count();
    accountReport.chat.messagesCount = await page.locator("[data-message-id]").count();
  }

  const uiErrorLocator = page.locator("p.text-xs.text-red-600");
  if ((await uiErrorLocator.count()) > 0) {
    const errorTexts = await uiErrorLocator.allInnerTexts();
    const mergedError = errorTexts.join(" | ").trim();
    accountReport.chat.uiErrorText = mergedError.length > 0 ? mergedError : null;
  } else {
    accountReport.chat.uiErrorText = null;
  }
}

async function login(
  page: Page,
  email: string,
  password: string,
  accountReport: AccountReport
) {
  try {
    await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/(farmer|admin|employee|marketplace)(\/|$)/, {
      timeout: 30_000,
    });

    accountReport.login.success = true;
    accountReport.login.redirectUrl = page.url();
  } catch (error) {
    accountReport.login.success = false;
    accountReport.login.error = serializeError(error);
    throw error;
  }
}

async function openChat(page: Page, accountReport: AccountReport) {
  await page.goto("/chat", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  const bootstrapFailed = page.getByText("Chat bootstrap failed", { exact: false });
  if ((await bootstrapFailed.count()) > 0 && (await bootstrapFailed.first().isVisible())) {
    accountReport.chat.bootstrapErrorText = await page.locator("section").first().innerText();
    await captureChatState(page, accountReport);
    return;
  }

  await page.getByText("Direct conversations", { exact: false }).first().waitFor({
    state: "visible",
    timeout: 30_000,
  });

  accountReport.chat.opened = true;
  accountReport.chat.bootstrapErrorText = null;
  await captureChatState(page, accountReport);
}

async function startConversation(
  page: Page,
  peerInternalUserId: number,
  expectedConversationId: string,
  accountReport: AccountReport
) {
  const panel = page.locator("[data-chat-panel='conversation-list']").first();
  await panel.locator("input").first().fill(String(peerInternalUserId));
  await panel.getByRole("button", { name: "Start", exact: true }).click();

  await expect
    .poll(
      async () => {
        await captureChatState(page, accountReport);
        return accountReport.chat.selectedConversationId;
      },
      {
        timeout: 20_000,
      }
    )
    .toBe(expectedConversationId);

  accountReport.chat.conversationOpened = true;
  await captureChatState(page, accountReport);
}

async function openConversation(page: Page, conversationId: string, accountReport: AccountReport) {
  await expect
    .poll(
      async () => {
        await captureChatState(page, accountReport);
        if (accountReport.chat.selectedConversationId === conversationId) {
          return "selected";
        }

        const conversationButton = page
          .locator(`[data-conversation-id="${conversationId}"]`)
          .first();
        return (await conversationButton.count()) > 0 ? "listed" : "none";
      },
      { timeout: 30_000 }
    )
    .not.toBe("none");

  if (accountReport.chat.selectedConversationId !== conversationId) {
    const conversationButton = page
      .locator(`[data-conversation-id="${conversationId}"]`)
      .first();
    await expect(conversationButton).toBeVisible({ timeout: 30_000 });
    await conversationButton.click();
  }

  await expect
    .poll(
      async () => {
        await captureChatState(page, accountReport);
        return accountReport.chat.selectedConversationId;
      },
      { timeout: 20_000 }
    )
    .toBe(conversationId);

  accountReport.chat.conversationOpened = true;
}

async function sendMessage(page: Page, message: string, accountReport: AccountReport) {
  const composer = page.locator("textarea").first();
  await composer.waitFor({ state: "visible", timeout: 20_000 });
  await composer.fill(message);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(message, { exact: false }).first()).toBeVisible({
    timeout: 20_000,
  });
  accountReport.chat.sentMessages.push(message);
  await captureChatState(page, accountReport);
}

async function waitForMessage(page: Page, message: string, accountReport: AccountReport) {
  await expect(page.getByText(message, { exact: false }).first()).toBeVisible({
    timeout: 20_000,
  });
  accountReport.chat.receivedMessages.push(message);
  await captureChatState(page, accountReport);
}

test("chat E2E between farmer and farmer2", async ({ browser }) => {
  const report = {
    startedAt: nowIso(),
    runId: Date.now().toString(),
    flow: {
      success: false,
      step: "init",
      error: null as string | null,
      expectedConversationId: null as string | null,
    },
    stepStatus: {} as Record<string, StepStatus>,
    accounts: {
      farmer: createAccountReport("farmer"),
      farmer2: createAccountReport("farmer2"),
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
      login(
        farmerPage,
        ACCOUNTS.farmer.email,
        ACCOUNTS.farmer.password,
        report.accounts.farmer
      ),
      login(
        farmer2Page,
        ACCOUNTS.farmer2.email,
        ACCOUNTS.farmer2.password,
        report.accounts.farmer2
      ),
    ]);
    report.stepStatus.login_farmer = "pass";
    report.stepStatus.login_farmer2 = "pass";

    report.flow.step = "open_chat";
    await Promise.all([
      openChat(farmerPage, report.accounts.farmer),
      openChat(farmer2Page, report.accounts.farmer2),
    ]);
    report.stepStatus.open_chat_farmer = "pass";
    report.stepStatus.open_chat_farmer2 = "pass";

    const farmerUid = report.accounts.farmer.chat.firebaseUid;
    const farmer2Uid = report.accounts.farmer2.chat.firebaseUid;
    if (!farmerUid || !farmer2Uid) {
      throw new Error("Unable to resolve Firebase UID from chat page state.");
    }

    const expectedConversationId = [farmerUid, farmer2Uid]
      .sort((left, right) => left.localeCompare(right))
      .join("__");
    report.flow.expectedConversationId = expectedConversationId;

    report.flow.step = "start_conversation";
    await startConversation(farmer2Page, 2, expectedConversationId, report.accounts.farmer2);
    await openConversation(farmerPage, expectedConversationId, report.accounts.farmer);
    report.stepStatus.start_conversation = "pass";

    const messageFromFarmer2 = `E2E: farmer2 -> farmer (${report.runId})`;
    const messageFromFarmer = `E2E: farmer -> farmer2 (${report.runId})`;

    report.flow.step = "send_farmer2_to_farmer";
    await sendMessage(farmer2Page, messageFromFarmer2, report.accounts.farmer2);
    await waitForMessage(farmerPage, messageFromFarmer2, report.accounts.farmer);
    report.stepStatus.send_farmer2_to_farmer = "pass";

    report.flow.step = "send_farmer_to_farmer2";
    await sendMessage(farmerPage, messageFromFarmer, report.accounts.farmer);
    await waitForMessage(farmer2Page, messageFromFarmer, report.accounts.farmer2);
    report.stepStatus.send_farmer_to_farmer2 = "pass";

    report.flow.step = "screenshot";
    await farmerPage.screenshot({ path: SCREENSHOT_FARMER, fullPage: true });
    await farmer2Page.screenshot({ path: SCREENSHOT_FARMER2, fullPage: true });
    report.stepStatus.screenshot = "pass";

    report.flow.success = true;
  } catch (error) {
    report.flow.error = serializeError(error);
    report.stepStatus[report.flow.step] = "fail";

    try {
      await farmerPage.screenshot({ path: SCREENSHOT_ERROR_FARMER, fullPage: true });
    } catch {
      // ignore
    }
    try {
      await farmer2Page.screenshot({ path: SCREENSHOT_ERROR_FARMER2, fullPage: true });
    } catch {
      // ignore
    }
  } finally {
    await captureChatState(farmerPage, report.accounts.farmer);
    await captureChatState(farmer2Page, report.accounts.farmer2);

    report.finishedAt = nowIso();
    fs.writeFileSync(OUTPUT_REPORT_FILE, `${JSON.stringify(report, null, 2)}\n`, "utf-8");

    await farmerContext.close();
    await farmer2Context.close();
  }

  expect(report.flow.success, report.flow.error ?? "Unknown flow error").toBe(true);
});
