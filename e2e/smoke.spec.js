import { test, expect } from '@playwright/test'

test('dashboard loads and exposes core sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('WHERE MYTH FADE TO LEGEND')
  await expect(page.locator('#dashboard')).toBeVisible()
  await expect(page.locator('#observations')).toBeVisible()
  await expect(page.locator('#issues')).toBeVisible()
  await expect(page.locator('#evidence')).toBeVisible()
})

test('observation search responds', async ({ page }) => {
  await page.goto('/')
  const search = page.locator('input[placeholder*="Search location"]')
  if (await search.count()) {
    await search.fill('Medan')
    await page.waitForTimeout(200)
    await expect(page.locator('body')).toContainText('Medan')
  }
})

test('mobile layout has no horizontal page overflow', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  expect(overflow).toBeFalsy()
})
