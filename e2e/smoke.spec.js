import { test, expect } from '@playwright/test'

test('dashboard loads and exposes the MoonWitness navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('WHERE MYTH FADES TO LEGEND')
  await expect(page.locator('.hero-panel')).toBeVisible()
  await expect(page.locator('.rail-nav')).toContainText('Observatory')
  await expect(page.locator('.rail-nav')).toContainText('Mythos')
  await expect(page.locator('.rail-nav')).toContainText('Revelation')
})

test('fast-track report, evidence and methodology routes load', async ({ page }) => {
  await page.goto('/#reports')
  await expect(page.locator('#mw-fasttrack')).toContainText('Monthly')
  await expect(page.locator('#mw-fasttrack')).toContainText('Observatory Report')
  await page.goto('/#evidence')
  await expect(page.locator('#mw-fasttrack')).toContainText('Evidence Explorer')
  await page.goto('/#about')
  await expect(page.locator('#mw-fasttrack')).toContainText('Observe.')
  await expect(page.locator('#mw-fasttrack')).toContainText('Purify.')
})

test('observation search responds', async ({ page }) => {
  await page.goto('/#mythos')
  const search = page.locator('input[placeholder*="Search place"]')
  if (await search.count()) {
    await search.fill('Medan')
    await page.waitForTimeout(200)
    await expect(page.locator('body')).toContainText('Medan')
  }
})

test('mobile layout has no horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  expect(overflow).toBeFalsy()
})
