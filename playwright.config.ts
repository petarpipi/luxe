import { defineConfig } from '@playwright/test'

const baseURL = process.env.LUXE_BASE_URL ?? 'http://127.0.0.1:5183'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 2,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    browserName: 'chromium',
    channel:
      process.env.LUXE_BROWSER_CHANNEL ?? (process.platform === 'win32' ? 'msedge' : undefined),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: process.env.LUXE_BASE_URL
    ? undefined
    : {
        command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5183 --strictPort',
        url: 'http://127.0.0.1:5183',
        reuseExistingServer: true,
        timeout: 30000,
      },
})
