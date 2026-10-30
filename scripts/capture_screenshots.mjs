// Captures portfolio screenshots of the production preview into screenshots/.
// Usage: pnpm build && pnpm preview, then `node scripts/capture_screenshots.mjs`.
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const base = process.env.LUXE_BASE_URL ?? 'http://127.0.0.1:4175'
const out = new URL('../screenshots/', import.meta.url)
await mkdir(out, { recursive: true })
const file = (name) => fileURLToPath(new URL(name, out))

const browser = await chromium.launch({
  channel: process.platform === 'win32' ? 'msedge' : undefined,
})
for (const width of [375, 390, 768, 1024, 1440, 1920]) {
  const mobile = width < 700
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 844 : width < 1100 ? 1024 : width === 1440 ? 900 : 1080 },
    deviceScaleFactor: mobile ? 2 : 1,
    isMobile: mobile,
    hasTouch: width < 1100,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: file(`luxe-${width}-hero.png`) })
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: file(`luxe-${width}-full.png`), fullPage: true })
  if (width === 390 || width === 1440) {
    await page.getByRole('button', { name: 'Soma Modular Sofa', exact: true }).click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: file(`luxe-${width}-product-dialog.png`) })
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: /A long table, late light/ }).click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: file(`luxe-${width}-lightbox.png`) })
    await page.keyboard.press('Escape')
  }
  if (width === 390) {
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole('button', { name: 'Open menu' }).click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: file('luxe-390-menu.png') })
  }
  await context.close()
  console.log('captured', width)
}
await browser.close()
