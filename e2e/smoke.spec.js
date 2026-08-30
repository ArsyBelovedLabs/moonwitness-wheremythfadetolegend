import { test, expect } from '@playwright/test'

test('dashboard loads and exposes the MoonWitness navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('WHERE MYTH FADES TO LEGEND')
  await expect(page.locator('.hero-panel')).toBeVisible()
  await expect(page.locator('.rail-nav')).toContainText('Observatory')
  await expect(page.locator('.rail-nav')).toContainText('Evidence Analysis')
  await expect(page.locator('.rail-nav')).toContainText('Resolution')
})

test('research workflow routes load end-to-end', async ({ page }) => {
  await page.goto('/#reports')
  await expect(page.locator('body')).toContainText('Monthly Field Report')
  await page.goto('/#evidence')
  await expect(page.locator('body')).toContainText('Evidence Explorer')
  await page.goto('/#analysis')
  await expect(page.locator('body')).toContainText('Evidence Analysis')
  await expect(page.locator('body')).toContainText('TAU-01')
  await expect(page.locator('body')).toContainText('TAU-08')
  await page.goto('/#resolution')
  await expect(page.locator('body')).toContainText('Resolution Board')
  await expect(page.locator('body')).toContainText('Generate Image · Story')
})

test('case inspection opens analysis data', async ({ page }) => {
  await page.goto('/#analysis')
  await page.getByRole('button', { name: 'View' }).first().click()
  await expect(page.locator('.detail-drawer')).toBeVisible()
  await expect(page.locator('.detail-drawer')).toContainText('CASE FILE')
  await expect(page.locator('.detail-drawer')).toContainText('Resolution')
})

test('story route renders a 1080x1920 export surface', async ({ page }) => {
  await page.goto('/#story/TAU-01')
  await expect(page.locator('body')).toContainText('Story Generator')
  await expect(page.locator('body')).toContainText('Download 1080×1920 SVG')
  await expect(page.locator('body')).toContainText('Dewi Sri')
})

test('global search finds issues across the observatory', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Global search').fill('TAU-02')
  await expect(page.locator('.global-results')).toContainText('TAU-02')
  await page.getByText('TAU-02', { exact: false }).last().click()
  await expect(page).toHaveURL(/#analysis$/)
})

test('mobile layout has no horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  expect(overflow).toBeFalsy()
})
