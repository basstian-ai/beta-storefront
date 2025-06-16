// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

const TEST_USERNAME = 'kminchelle'; // Standard test user
const TEST_PASSWORD = '0lelplR';    // Standard test user password
const INVALID_PASSWORD = 'invalidpassword';

test.describe('Authentication Flow', () => {
  test('should allow a user to log in successfully and redirect to account page', async ({ page }) => {
    await page.goto('/login');

    // Fill in the credentials
    await page.fill('input[name="username"]', TEST_USERNAME);
    await page.fill('input[name="password"]', TEST_PASSWORD);

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to the account page (or homepage if that's the redirect)
    // Option 1: Check for URL
    await expect(page).toHaveURL(/(\/account|\/)$/, { timeout: 10000 }); // Allow /account or / (homepage)

    // Option 2: Check for some element that only appears when logged in
    // For example, if there's a "Welcome, kminchelle" text or an account dropdown.
    // This depends on the actual content of the page after login.
    // As a generic check, let's see if we are NOT on the /login or /auth/error page.
    expect(page.url()).not.toMatch(/(\/login|\/auth\/error)/);

    // Optional: Check for session cookie (more advanced, might require context inspection)
    // const cookies = await page.context().cookies();
    // expect(cookies.some(cookie => cookie.name.includes('next-auth.session-token'))).toBeTruthy();
  });

  test('should show an error message for invalid credentials on the login page', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[name="username"]', TEST_USERNAME);
    await page.fill('input[name="password"]', INVALID_PASSWORD);

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for an error message on the login page itself
    const errorMessage = page.locator('form p[class*="text-red-600"]'); // Selector for the error message
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText(/Invalid username or password|CredentialsSignin/i);

    // Ensure still on the login page
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to the custom error page for other auth errors (simulation)', async ({ page }) => {
     // This test simulates a scenario where NextAuth redirects to its error page.
     // We directly navigate to a known error path that NextAuth might use.
     // For a real CredentialsSignin error that results in a redirect (not caught by client-side form validation),
     // the previous test ('should show an error message for invalid credentials') covers the UI feedback.
     // This test is more about ensuring the /auth/error page itself renders.

     await page.goto('/auth/error?error=Configuration'); // Simulate a generic configuration error

     // Check for title on the error page
     const errorTitle = page.locator('h1[class*="text-red-600"]');
     await expect(errorTitle).toBeVisible();
     await expect(errorTitle).toContainText(/Server Configuration Error/i);

     // Check for a link to go back to login
     const loginLink = page.locator('a[href="/login"]');
     await expect(loginLink).toBeVisible();
     await expect(loginLink).toContainText('Try Logging In Again');
  });
});
