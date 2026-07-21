import { expect, test } from './fixtures'

test('reports generic success even for unknown emails', async ({ page }) => {
  await page.goto('/forgot-password')
  const email = `nobody-${Date.now()}@example.com`
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(
    page.getByText(`If an account exists for ${email}`),
  ).toBeVisible()
})

test('invalid reset link offers to request a new one', async ({ page }) => {
  await page.goto('/reset-password?error=INVALID_TOKEN')
  await expect(
    page.getByText('This password reset link is invalid or has expired.'),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Request a new link' }).click()
  await page.waitForURL(/\/forgot-password/)
})
