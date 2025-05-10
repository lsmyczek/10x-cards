import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for the Home page
 */
export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly heroSection: Locator;
  readonly ctaButton: Locator;
  readonly navbarLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator("h1");
    this.heroSection = page.getByRole("region", { name: "hero" });
    this.ctaButton = page.getByRole("link", { name: /get started/i });
    this.navbarLinks = page.locator("nav a");
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Check if the home page is loaded properly
   */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.heroSection).toBeVisible();
  }

  /**
   * Click the primary CTA button
   */
  async clickCTA() {
    await this.ctaButton.click();
  }

  /**
   * Take a screenshot of the home page
   * @param path Path to save the screenshot
   */
  async takeScreenshot(path: string) {
    await this.page.screenshot({ path });
  }
}
