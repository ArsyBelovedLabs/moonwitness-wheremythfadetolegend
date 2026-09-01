import { test, expect } from '@playwright/test'

const BREAKPOINTS = [1440, 1280, 1024, 768, 430, 390, 360]
const AUGUST_ROUTES = [
  ['report', '/#report/2026-08', 'Monthly Report'],
  ['spread', '/#spread-map', 'Spread Map'],
  ['disaster', '/#disaster-map', 'Disaster Map'],
  ['correlation', '/#correlation', 'Correlation Engine'],
  ['review', '/#review', 'Practice-Level Review'],
  ['evidence', '/#evidence', 'Evidence'],
  ['revelation', '/#revelation', 'Four Revelation Lens'],
]

for (const width of BREAKPOINTS) {
  test.describe(`visual contract @ ${width}px`, () => {
    for (const [id, route] of AUGUST_ROUTES) {
      test(`${id} stays bounded with explicit frozen state`, async ({ page }) => {
        await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 })
        await page.goto(route)
        await expect(page.locator('.canonical-mission-shell')).toBeVisible()
        await expect(page.locator('.canonical-route-shell')).toContainText('FROZEN BASELINE')
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
        expect(overflow).toBeFalsy()
      })
    }
  })
}

test('public mission rail exposes exactly eight authorized tasks', async ({ page }) => {
  await page.goto('/#report/2026-08')
  const mission = page.getByRole('navigation', { name: 'Mission navigation' })
  await expect(mission).toBeVisible()
  const buttons = mission.getByRole('button')
  await expect(buttons).toHaveCount(8)
  for (const label of ['Monthly Report','Spread Map','Disaster Map','Correlation Engine','Practice-Level Review','Evidence','Four Revelation Lens','Candidate Pipeline']) {
    await expect(mission).toContainText(label)
  }
  await expect(mission).not.toContainText('Live ResearchRun')
})

test('maps and correlation preserve the exact causality boundary', async ({ page }) => {
  for (const route of ['/#spread-map','/#disaster-map','/#correlation']) {
    await page.goto(route)
    await expect(page.locator('.mw-causality-guardrail').first()).toContainText('Temporal/geographic proximity does not establish causation.')
  }
})

test('practice review remains explicitly practice-level', async ({ page }) => {
  await page.goto('/#review')
  await expect(page.locator('.canonical-route-shell')).toContainText('PRACTICE-LEVEL REVIEW')
  await expect(page.locator('body')).not.toContainText(/judge (a )?person|judge faith/i)
})

test('Four Revelation Lens is exactly Q/I/T/Z and exactly four items', async ({ page }) => {
  await page.goto('/#revelation')
  await expect(page.locator('.mw-revelation-lens__item')).toHaveCount(4)
  for (const label of ["Al-Qur'an", 'Injil / Gospel', 'Taurat / Torah', 'Zabur / Psalms']) {
    await expect(page.locator('body')).toContainText(label)
  }
})

test('keyboard traversal reaches the public mission controls with visible focus', async ({ page }) => {
  await page.goto('/#report/2026-08')
  let missionFocused = false
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab')
    const state = await page.evaluate(() => {
      const el = document.activeElement
      if (!(el instanceof HTMLElement)) return { mission: false, visible: false }
      const mission = el.closest('[aria-label="Mission navigation"]')
      const style = getComputedStyle(el)
      const rect = el.getBoundingClientRect()
      return {
        mission: Boolean(mission),
        visible: style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0,
      }
    })
    if (state.mission) {
      expect(state.visible).toBeTruthy()
      missionFocused = true
      break
    }
  }
  expect(missionFocused).toBeTruthy()
})

test('candidate pipeline remains a task surface without becoming live operational navigation', async ({ page }) => {
  await page.goto('/#report/2026-09')
  const mission = page.getByRole('navigation', { name: 'Mission navigation' })
  await mission.getByRole('button', { name: /Candidate Pipeline/i }).click()
  await expect(page.locator('.canonical-route-shell')).toContainText('Candidate Pipeline')
  await expect(page.locator('.pipeline-flow')).toContainText('DISCOVERED')
  await expect(page.locator('.pipeline-flow')).toContainText('PUBLISHED')
  await expect(mission).not.toContainText('Live ResearchRun')
})
