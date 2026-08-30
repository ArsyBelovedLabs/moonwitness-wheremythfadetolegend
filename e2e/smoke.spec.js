import { test, expect } from '@playwright/test'

test('unified August report renders the frozen repository ledger', async ({ page }) => {
  await page.goto('/#report/2026-08')
  await expect(page.locator('body')).toContainText('WHERE MYTH FADE TO LEGEND')
  await expect(page.locator('body')).toContainText('MOONWITNESS SUBMODULE')
  await expect(page.locator('.page-title')).toContainText('August 2026 — Observatory Report')
  await expect(page.locator('.kpi-grid')).toContainText('Mythos Activity')
  await expect(page.locator('.observation-table tbody tr')).toHaveCount(17)
  await expect(page.locator('.observation-table')).toContainText('Tri Sandya + Pemujaan Dewi Sri')
  await expect(page.locator('.observation-table')).toContainText('Hungry Ghost Festival')
  await expect(page.locator('.report-section-nav')).toContainText('Disasters')
  await expect(page.locator('.report-section-nav')).toContainText('Correlation')
})

test('observation geography comes from repository metadata', async ({ page }) => {
  await page.goto('/#spread-map')
  await expect(page.locator('.page-title')).toContainText('August 2026 — Mythos Spread Map')
  await expect(page.locator('.leaflet-stage')).toBeVisible()
  await expect(page.locator('.severity-legend')).toContainText('TAUHID-GAP SEVERITY')
  await expect(page.locator('body')).toContainText('Repository coordinates')
  await expect(page.locator('.geo-state.mapped').first()).toBeVisible()
  await expect(page.locator('.geo-state.nonlocal').first()).toBeVisible()
})

test('Disaster Map uses dedicated disaster rows and keeps causality separate', async ({ page }) => {
  await page.goto('/#disaster-map')
  await expect(page.locator('.page-title')).toContainText('August 2026 — Disaster Map')
  await expect(page.locator('.page-title h1')).not.toContainText('Distribution')
  await expect(page.locator('body')).toContainText('DISASTER DATASET')
  await expect(page.locator('body')).toContainText('Bangka')
  await expect(page.locator('body')).toContainText('Mempawah')
  await expect(page.locator('body')).toContainText('Flores')
  await expect(page.locator('body')).toContainText('Aceh Barat Daya')
  await expect(page.locator('body')).toContainText('Temporal proximity is not proof of causation')
})

test('correlation engine distinguishes proximity from reviewed causality', async ({ page }) => {
  await page.goto('/#correlation')
  await expect(page.locator('.page-title')).toContainText('Correlation / Timeline Engine')
  await expect(page.locator('.engine-flow')).toContainText('ΔT + DISTANCE')
  await expect(page.locator('.correlation-table')).toContainText('Chit Ngiat Pan / Sembahyang Rebut')
  await expect(page.locator('.correlation-table')).toContainText('Chiong Si Ku')
  await expect(page.locator('.relation-state.reviewed').first()).toBeVisible()
  await expect(page.locator('.correlation-table')).toContainText('REVIEWED_NO_CAUSAL_LINK')
})

test('Tauhid Gap is color coded and issue register is complete', async ({ page }) => {
  await page.goto('/#review')
  await expect(page.locator('.page-title')).toContainText('August 2026 — Tauhid Review')
  await expect(page.locator('.review-table tbody tr')).toHaveCount(12)
  await expect(page.locator('.review-table')).toContainText('TAU-01')
  await expect(page.locator('.review-table')).toContainText('TAU-12')
  await expect(page.locator('.priority-chip.critical')).toContainText('CRITICAL')
})

test('evidence and Four Revelation routes remain repository-grounded', async ({ page }) => {
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

test('September starts as an empty collecting pipeline, not published truth', async ({ page }) => {
  await page.goto('/#pipeline')
  await page.locator('.top-actions select').selectOption('2026-09')
  await expect(page.locator('.page-title')).toContainText('September 2026 — Candidate Pipeline')
  await expect(page.locator('.pipeline-flow')).toContainText('DISCOVERED')
  await expect(page.locator('.pipeline-flow')).toContainText('SOURCE_CHECK')
  await expect(page.locator('.pipeline-flow')).toContainText('VERIFIED')
  await expect(page.locator('.pipeline-flow')).toContainText('ANALYZED')
  await expect(page.locator('.pipeline-flow')).toContainText('PUBLISHED')
  await expect(page.locator('body')).toContainText('No candidate signals yet')
})

test('mobile layout has no horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#report/2026-08')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
  expect(overflow).toBeFalsy()
})
