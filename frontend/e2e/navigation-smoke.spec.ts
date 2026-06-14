import { test, expect } from "@playwright/test";

async function clickAndExpectUrl(
  page: import("@playwright/test").Page,
  clickTarget: ReturnType<import("@playwright/test").Page["getByRole"]>,
  urlPattern: RegExp
) {
  await clickTarget.click();
  await expect(page).toHaveURL(urlPattern, { timeout: 30_000 });
}

test.describe.configure({ mode: "serial" });

test.describe("navigation smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test("header exposes primary routes", async ({ page }) => {
    await page.goto("/");
    const mainNav = page.getByRole("navigation", { name: "Main" });
    await expect(mainNav.getByRole("link", { name: "File" })).toHaveAttribute(
      "href",
      "/file"
    );
    await expect(mainNav.getByRole("link", { name: "Import" })).toHaveAttribute(
      "href",
      "/file/import/documents"
    );
    await expect(mainNav.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/#pricing"
    );
  });

  test("filing header nav moves between product areas", async ({ page }) => {
    await page.goto("/file/income");
    await clickAndExpectUrl(
      page,
      page
        .getByRole("navigation", { name: "Product sections" })
        .getByRole("link", { name: "Review" }),
      /\/file\/review\/risk$/
    );
  });

  test("pricing hash scrolls from another page", async ({ page }) => {
    await page.goto("/learn");
    const pricingLink = page.getByRole("contentinfo").getByRole("link", { name: "Pricing" });
    await pricingLink.scrollIntoViewIfNeeded();
    await pricingLink.click();

    await expect(page).toHaveURL(/\/#pricing$/, { timeout: 30_000 });
    const pricing = page.locator("#pricing");
    await expect(pricing).toBeVisible();
    await expect
      .poll(async () => pricing.evaluate((el) => el.getBoundingClientRect().top), {
        timeout: 10_000,
      })
      .toBeLessThan(400);
  });

  test("regime compare hash works from Form16 quick card", async ({ page }) => {
    await page.goto("/#filing-prep");

    const compareLink = page.getByRole("link", { name: "Compare regimes" });
    await expect(compareLink).toBeVisible({ timeout: 15_000 });
    await compareLink.click();

    await expect(page).toHaveURL(/\/#regime-compare$/, { timeout: 30_000 });
    await expect(page.locator("#regime-compare")).toBeVisible();
  });

  test("filing income step advances to house property", async ({ page }) => {
    await page.goto("/file/income");
    await clickAndExpectUrl(
      page,
      page.getByRole("link", { name: "Save & continue" }),
      /\/file\/house-property$/
    );
    await expect(
      page.getByRole("heading", { name: /House property/i })
    ).toBeVisible();
  });

  test("browser back returns to previous filing step", async ({ page }) => {
    await page.goto("/file/income");
    await clickAndExpectUrl(
      page,
      page.getByRole("link", { name: "Save & continue" }),
      /\/file\/house-property$/
    );

    await page.goBack();
    await expect(page).toHaveURL(/\/file\/income$/);
    await expect(page.getByRole("heading", { name: /Income workspace/i })).toBeVisible();
  });

  test("presubmit URL lands on risk review final-check", async ({ page }) => {
    await page.goto("/file/review/presubmit");
    await expect(page).toHaveURL(/\/file\/review\/risk#final-check$/);
    await expect(page.locator("#final-check")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Pre-submit checklist/i })).toBeVisible();
  });

  test("mobile menu closes after navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: "Open menu" });
    await menuButton.scrollIntoViewIfNeeded();
    await menuButton.click();

    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible({ timeout: 10_000 });

    await mobileNav.getByRole("link", { name: "Learn" }).click();
    await expect(page).toHaveURL(/\/learn$/, { timeout: 30_000 });
    await expect(mobileNav).not.toBeVisible();
  });

  test("companion shows loading state before content", async ({ page }) => {
    await page.goto("/file/companion");
    await expect(
      page.getByRole("heading", { name: /Your incometax\.gov\.in walkthrough/i })
    ).toBeVisible({ timeout: 15_000 });
  });
});
