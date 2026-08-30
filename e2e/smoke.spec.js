import { test, expect } from '@playwright/test'

test('submodule dashboard loads the August 2026 repository report', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText('WHERE MYTH FADE TO LEGEND')
  await expect(page.locator('body')).toContainText('MOONWITNESS SUBMODULE')
  await expect(page.locator('.kpi-grid')).toContainText('Mythos Activity')
  await expect(page.locator('.observation-table tbody tr')).toHaveCount(17)
  await expect(page.locator('.observation-table')).toContainText('Tri Sandya + Pemujaan Dewi Sri')
  await expect(page.locator('.observation-table')).toContainText('Hungry Ghost Festival')
})

test('Tauhid Gap is color coded at cell and badge level', async ({ page }) => {
  await page.goto('/#report')
  await expect(page.locator('.gap-cell.critical').first()).toBeVisible()
  await expect(page.locator('.score-badge.critical').first()).toBeVisible()
  await expect(page.locator('.score-badge.low').first()).toBeVisible()
})

test('spread map renders repository-grounded observation geography', async ({ page }) => {
  await page.goto('/#spread-map')
  await expect(page.locator('body')).toContainText('August 2026 — Mythos Spread Map')
  await expect(page.locator('.leaflet-stage')).toBeVisible()
  await expect(page.locator('.severity-legend')).toContainText('TAUHID-GAP SEVERITY')
  await expect(page.locator('body')).toContainText('HIGH-ALERT NODES')
})

test('disaster map uses the correct title and repository causality context', async ({ page }) => {
  await page.goto('/#disaster-map')
  await expect(page.locator('body')).toContainText('August 2026 — Disaster Map')
  await expect(page.locator('.page-title h1')).not.toContainText('Distribution')
  await expect(page.locator('body')).toContainText('Wildfire / Karhutla')
  await expect(page.locator('body')).toContainText('Earthquake')
  await expect(page.locator('body')).toContainText('Temporal proximity is not proof of causation')
  await expect(page.locator('.disaster-register')).toContainText('Bangka')
  await expect(page.locator('.disaster-register')).toContainText('Mempawah')
  await expect(page.locator('.disaster-register')).toContainText('Flores')
})

test('Tauhid Review exposes the complete issue register', async ({ page }) => {
  await page.goto('/#review')
  await expect(page.locator('body')).toContainText('August 2026 — Tauhid Review')
  await expect(page.locator('.review-table tbody tr')).toHaveCount(12)
  await expect(page.locator('.review-table')).toContainText('TAU-01')
  await expect(page.locator('.review-table')).toContainText('TAU-12')
  await expect(page.locator('.priority-chip.critical')).toContainText('CRITICAL')
})

test('evidence and Four Revelation routes stay repository-grounded', async ({ page }) => {
  await page.goto('/#evidence')
  await expect(page.locator('.evidence-ledger tbody tr')).toHaveCount(15)
  await expect(page.locator('body')).toContainText('BMKG — Total Solar Eclipse 12 August 2026')
  await page.goto('/#revelation')
  await expect(page.locator('.revelation-row')).toHaveCount(4)
  await expect(page.locator('body')).toContainText("Al-Qur'an")
  await expect(page.locator('body')).toContainText('Injil / Gospel')
  await expect(page.locator('body')).toContainText('Taurat / Torah')
  await expect(page.locator('body')).toContainText('Zabur / Psalms')
})

test('mobile layout has no horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#report')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  expect(overflow).toBeFalsy()
})
