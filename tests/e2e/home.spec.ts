import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Home Page', () => {
  test('should load the home page correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectLoaded();
    
    // Verify that the homepage has the correct title
    await expect(page).toHaveTitle(/10x Cards/);
  });

  test('should navigate to the sign-in page when clicking CTA', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Capture a screenshot before navigation for visual comparison
    await homePage.takeScreenshot('./screenshots/home-page.png');
    
    // Click the CTA button
    await homePage.clickCTA();
    
    // Verify navigation occurred
    await expect(page).toHaveURL(/.*auth\/sign-in/);
  });
}); 