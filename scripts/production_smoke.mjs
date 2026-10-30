import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'

const browser = await chromium.launch({
  headless: true,
  ...(process.platform === 'win32' ? { channel: 'msedge' } : {}),
})
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await context.newPage()
const errors = []
const externalRequests = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('request', (request) => {
  if (new URL(request.url()).hostname !== '127.0.0.1') externalRequests.push(request.url())
})
await page.addInitScript(() => {
  window.luxeMetrics = { cls: 0, lcp: 0 }
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.luxeMetrics.cls += entry.value
    }
  }).observe({ type: 'layout-shift', buffered: true })
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    window.luxeMetrics.lcp = entries.at(-1)?.startTime ?? 0
  }).observe({ type: 'largest-contentful-paint', buffered: true })
})
const response = await page.goto('http://127.0.0.1:4175/')
await page.waitForFunction(() => document.querySelector('.hero-media img')?.complete)
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)
const initialMetrics = await page.evaluate(() => ({
  ...window.luxeMetrics,
  fontsLoaded: document.fonts.check('400 24px Cormorant') && document.fonts.check('400 16px Inter'),
  resourceBytes: performance
    .getEntriesByType('resource')
    .reduce((sum, entry) => sum + entry.transferSize, 0),
}))
await page.getByRole('button', { name: 'Arca Lounge Chair', exact: true }).click()
if (!(await page.getByRole('dialog', { name: 'Arca Lounge Chair' }).isVisible()))
  throw new Error('Production product dialog did not open')
await page.keyboard.press('Escape')
await page.getByRole('dialog').waitFor({ state: 'hidden' })
await page.getByLabel('Name').fill('Portfolio Preview')
await page.getByLabel('Email').fill('preview@example.com')
await page.getByLabel('What are you planning?').selectOption('A single piece')
await page
  .getByLabel('About the space')
  .fill('A warm reading corner with an architectural lounge chair.')
await page.getByRole('button', { name: /Preview enquiry/ }).click()
if (!(await page.getByRole('status').textContent()).includes('nothing has been sent or stored'))
  throw new Error('Production form preview failed')
const result = {
  date: new Date().toISOString(),
  status: response.status(),
  title: await page.title(),
  browser: browser.version(),
  metrics: initialMetrics,
  browserErrors: errors,
  externalRequests,
  productDialog: 'passed',
  formPreview: 'passed',
  note: 'Local unthrottled lab sample, not a Lighthouse score or field performance guarantee.',
}
await fs.mkdir('qa', { recursive: true })
await fs.writeFile('qa/production-smoke.json', JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
await browser.close()
if (response.status() !== 200 || errors.length || externalRequests.length) process.exitCode = 1
