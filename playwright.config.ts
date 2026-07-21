import { existsSync } from 'node:fs'

import { defineConfig, devices } from '@playwright/test'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const baseURL = process.env.E2E_BASE_URL!
const { port } = new URL(baseURL)

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'e2e',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `AUTH_DB_PATH=:memory: BETTER_AUTH_URL=${baseURL} vp preview --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
