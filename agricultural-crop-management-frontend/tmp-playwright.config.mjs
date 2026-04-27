import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["line"],
    ["json", { outputFile: "d:/SE122-Code-MicroserviceReady/tmp-chat-playwright-result.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5173",
    headless: true,
  },
});
