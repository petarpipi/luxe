import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const widths = [375, 390, 768, 1024, 1440, 1920]

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
})

const box = (page: Page, selector: string) =>
  page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
  })

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
    window.scrollTo(0, 0)
  })
}

test('filters, product details, centred dialog, focus trap and Escape', async ({ page }, info) => {
  for (const category of ['Seating', 'Sofas', 'Tables', 'Lighting', 'Storage', 'Objects']) {
    await page.getByRole('button', { name: category, exact: true }).click()
    await expect(page.locator('.product-card')).toHaveCount(1)
  }
  await page.getByRole('button', { name: 'All pieces' }).click()
  await expect(page.locator('.product-card')).toHaveCount(6)
  const trigger = page.getByRole('button', { name: 'Arca Lounge Chair', exact: true })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Arca Lounge Chair' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('not for sale')
  // Regression: the dialog used to be pinned to the top-left corner.
  await page.waitForFunction(() => !document.querySelector('dialog[open]')!.getAnimations().length)
  const rect = await box(page, 'dialog[open]')
  const viewport = page.viewportSize()!
  if (info.project.name === 'desktop') {
    expect(Math.abs(rect.left - (viewport.width - rect.right))).toBeLessThan(2)
    expect(Math.abs(rect.top - (viewport.height - rect.bottom))).toBeLessThan(2)
  } else {
    expect(rect.left).toBeLessThan(1)
    expect(Math.abs(rect.right - viewport.width)).toBeLessThan(1)
    expect(Math.abs(rect.bottom - viewport.height)).toBeLessThan(1)
  }
  // Regression: on phones the title used to render on top of the photograph.
  const media = await box(page, '.product-dialog-media')
  const title = await box(page, 'dialog[open] h2')
  if (info.project.name === 'mobile') expect(title.top).toBeGreaterThanOrEqual(media.bottom)
  else expect(title.left).toBeGreaterThanOrEqual(media.right)
  await page.keyboard.press('Shift+Tab')
  expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('enquiring about a piece moves to a pre-filled consultation form', async ({ page }) => {
  await page.getByRole('button', { name: 'Linea Dining Table', exact: true }).click()
  await page.getByRole('button', { name: /Enquire about this piece/ }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('#contact')).toBeFocused()
  await expect(page.getByLabel('About the space')).toHaveValue(
    'I would like to know more about the Linea Dining Table.',
  )
  await expect(page.getByLabel('What are you planning?')).toHaveValue('A single piece')
  await expect
    .poll(() =>
      page.locator('#contact').evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(120)
})

test('hero is prerendered, visible immediately and never collides with its photograph', async ({
  page,
  request,
}) => {
  // Only the production build is prerendered; the dev server starts with an empty root.
  if (process.env.LUXE_BASE_URL) {
    const html = await (await request.get('/')).text()
    expect(html).toContain('Furniture for')
    expect(html).toMatch(/<img[^>]+hero-960\.webp/)
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  expect(
    await page.locator('.hero-media img').evaluate((image) => getComputedStyle(image).opacity),
  ).toBe('1')
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 })
    const overlap = await page.evaluate(() => {
      const media = document.querySelector('.hero-media')!.getBoundingClientRect()
      return Array.from(document.querySelectorAll('.hero-line')).some((line) => {
        const range = document.createRange()
        range.selectNodeContents(line)
        const rect = range.getBoundingClientRect()
        return rect.right > media.left + 1 && rect.bottom > media.top + 1 && rect.top < media.bottom
      })
    })
    expect(overlap, `hero headline overlaps photo at ${width}px`).toBe(false)
    const media = await box(page, '.hero-media')
    if (width < 960)
      expect(Math.round(media.right - media.left), `hero width at ${width}px`).toBe(width)
  }
})

test('typography never drops below 12px and no photograph repeats', async ({ page }) => {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 })
    await scrollThrough(page)
    const tiny = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const found: string[] = []
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const element = node.parentElement!
        if (!node.textContent!.trim() || !element.getClientRects().length) continue
        if (parseFloat(getComputedStyle(element).fontSize) < 12)
          found.push(node.textContent!.trim())
      }
      return found
    })
    expect(tiny, `text below 12px at ${width}px`).toEqual([])
  }
  const families = await page
    .locator('main img')
    .evaluateAll((images) =>
      images.map((image) => image.getAttribute('src')!.match(/images\/([a-z]+)-/)![1]),
    )
  expect(new Set(families).size).toBe(families.length)
})

test('reveals finish with motion and nothing is hidden with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await page.locator('#journal .section-head').scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      page.locator('#journal .section-head').evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe('1')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const hidden = await page
    .locator('[data-reveal]')
    .evaluateAll((elements) => elements.filter((el) => getComputedStyle(el).opacity !== '1').length)
  expect(hidden).toBe(0)
})

test('signature selector supports keyboard and matching details', async ({ page }) => {
  await page.getByRole('tab', { name: /Orbit Swivel Chair/ }).click()
  await page.keyboard.press('ArrowRight')
  const dune = page.getByRole('tab', { name: /Dune Sofa/ })
  await expect(dune).toBeFocused()
  await expect(dune).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel').getByRole('heading', { level: 3 })).toHaveText(
    'Dune Sofa',
  )
  await page.getByRole('button', { name: 'View details' }).click()
  await expect(page.getByRole('dialog', { name: 'Dune Sofa' })).toBeVisible()
})

test('journal lightbox: buttons, keys, swipe, wraparound, Escape and focus return', async ({
  page,
}) => {
  const trigger = page.getByRole('button', { name: /The reading alcove/ })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Journal gallery' })
  await expect(dialog).toBeVisible()
  const heading = dialog.getByRole('heading', { level: 3 })
  await page.keyboard.press('ArrowLeft')
  await expect(heading).toHaveText('Raw plaster, soft sheets')
  await dialog.getByRole('button', { name: 'Next image' }).click()
  await expect(heading).toHaveText('The reading alcove')
  const stage = await box(page, '.lightbox-stage')
  const y = (stage.top + stage.bottom) / 2
  await page.mouse.move(stage.right - 40, y)
  await page.mouse.down()
  await page.mouse.move(stage.left + 40, y, { steps: 6 })
  await page.mouse.up()
  await expect(heading).toHaveText('A long table, late light')
  await page.keyboard.press('End')
  await expect(heading).toHaveText('Raw plaster, soft sheets')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('contact validation, honest success, no network submission and reset', async ({ page }) => {
  let submissions = 0
  page.on('request', (request) => {
    if (request.method() === 'POST') submissions++
  })
  await page.getByRole('button', { name: /Preview enquiry/ }).click()
  await expect(page.getByLabel('Name')).toBeFocused()
  await expect(page.locator('.field-error')).toHaveCount(4)
  await page.getByLabel('Name').fill('Alex Morgan')
  await page.getByLabel('Email').fill('invalid')
  await page.getByLabel('What are you planning?').selectOption('A full home')
  await page.getByLabel('About the space').fill('A quiet living room with natural materials.')
  await page.getByRole('button', { name: /Preview enquiry/ }).click()
  await expect(page.getByLabel('Email')).toBeFocused()
  await page.getByLabel('Email').fill('alex@example.com')
  await page.getByRole('button', { name: /Preview enquiry/ }).click()
  await expect(page.getByRole('status')).toContainText('nothing has been sent or stored')
  expect(submissions).toBe(0)
  await page.getByRole('button', { name: /Start a new enquiry/ }).click()
  await expect(page.getByLabel('Name')).toHaveValue('')
})

test('navigation, active section, mobile menu focus and back to top', async ({ page }, info) => {
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open menu' }).click()
    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()
    await menu.getByRole('link', { name: /Materials/ }).click()
    await expect(menu).toBeHidden()
    await expect(page.locator('#materials')).toBeFocused()
  } else {
    const link = page.getByRole('navigation', { name: 'Main' }).getByRole('link', {
      name: 'Materials',
    })
    await link.click()
    await expect(link).toHaveAttribute('aria-current', 'true')
  }
  await expect(page).toHaveURL(/#materials$/)
  await expect
    .poll(() =>
      page.locator('#materials').evaluate((el) => Math.round(el.getBoundingClientRect().top)),
    )
    .toBeLessThan(120)
  await expect(page.locator('.header')).toHaveClass(/is-scrolled/)
  await page.getByRole('link', { name: 'Back to top', exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('page and open dialogs have no WCAG A/AA automated violations', async ({ page }, info) => {
  await scrollThrough(page)
  const scan = () =>
    new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()
  expect((await scan()).violations).toEqual([])
  await page.getByRole('button', { name: 'Arca Lounge Chair', exact: true }).click()
  expect((await scan()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: /The reading alcove/ }).click()
  expect((await scan()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  if (info.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Open menu' }).click()
    expect((await scan()).violations).toEqual([])
  }
})

test('responsive sweep: no overflow, images decode, no console errors', async ({ page }) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 })
    await page.goto('/')
    await scrollThrough(page)
    // Never-requested lazy images would make image.decode() wait forever, so wait for the network.
    await page.waitForLoadState('networkidle')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `horizontal overflow at ${width}px`,
    ).toBe(true)
    expect(
      await page
        .locator('img')
        // Lazy images inside the horizontal mobile carousel may not have loaded yet; none may be broken.
        .evaluateAll((images) =>
          images.every((image) => {
            const img = image as HTMLImageElement
            return !img.complete || img.naturalWidth > 0
          }),
        ),
    ).toBe(true)
  }
  expect(errors).toEqual([])
})
