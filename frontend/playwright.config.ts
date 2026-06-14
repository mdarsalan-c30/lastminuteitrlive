import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke tests for LastMinute ITR.
 *
 * Run: `npm run test:e2e`
 * - Starts `npm run dev` on http://localhost:3000 when no server is running (reuseExistingServer locally).
 * - Dev mode is required for mock payment (`order_mock_`) — `next start` sets production and blocks mocks.
 * - Or start the dev server yourself, then run `npm run test:e2e`.
 * - CI: set `CI=1` to always boot a fresh dev server.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    // Dev server keeps NODE_ENV non-production so order_mock_ verify works in E2E.
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXT_PUBLIC_BYPASS_PAYMENT: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
