import { test, expect } from '@playwright/test';

test('filters products on the category page', async ({ page }) => {
  await page.goto('/category/laptops');
  await expect(page.locator('h3')).toHaveCountGreaterThan(0);
  const firstUrl = page.url();
  await page.getByLabel('Apple').check();
  await expect(page).toHaveURL(/brand=Apple/);
  await expect(page.locator('h3')).toHaveCountGreaterThan(0);
  expect(page.url()).not.toBe(firstUrl);
});
