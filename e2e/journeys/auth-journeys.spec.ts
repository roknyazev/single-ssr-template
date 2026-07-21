import type { APIRequestContext, Page } from '@playwright/test'

import { expect, test } from '../fixtures'

function uniqueEmail() {
  return `journey-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
}

async function fetchMailbox(request: APIRequestContext, email: string) {
  const response = await request.get(`/api/dev/mailbox/${email}`)
  expect(response.ok()).toBe(true)
  return (await response.json()) as { type: string; otp?: string; url?: string }
}

async function signUp(page: Page, email: string, password: string) {
  await page.goto('/sign-up')
  await page.getByLabel('Name').fill('Journey Tester')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign up', exact: true }).click()
  await page.waitForURL(/\/verify-email/)
}

async function verifyEmail(
  page: Page,
  request: APIRequestContext,
  email: string,
) {
  const message = await fetchMailbox(request, email)
  expect(message.type).toBe('email-verification')
  expect(message.otp).toMatch(/^\d{6}$/)
  await page.getByLabel('Verification code').fill(message.otp!)
  await page.getByRole('button', { name: 'Verify', exact: true }).click()
  await page.waitForURL('/')
}

test('sign-up → verify email → signed in and landed in app', async ({
  page,
  request,
}) => {
  const email = uniqueEmail()
  await signUp(page, email, 'initial-pass-123')
  await verifyEmail(page, request, email)
  await expect(
    page.getByRole('heading', { name: 'Welcome Home!' }),
  ).toBeVisible()
})

test('password reset: request link → set new password → sign in with it', async ({
  page,
  request,
}) => {
  const email = uniqueEmail()
  await signUp(page, email, 'initial-pass-123')
  await verifyEmail(page, request, email)

  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await page.waitForURL(/\/sign-in/)

  await page.goto('/forgot-password')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(
    page.getByText(`If an account exists for ${email}`),
  ).toBeVisible()

  const message = await fetchMailbox(request, email)
  expect(message.type).toBe('reset-password')
  await page.goto(message.url!)
  await page.waitForURL(/\/reset-password\?/)
  await page
    .getByLabel('New password', { exact: true })
    .fill('brand-new-pass-456')
  await page
    .getByRole('button', { name: 'Reset password', exact: true })
    .click()

  await page.waitForURL(/\/sign-in\/password/)
  await expect(page.getByLabel('Email')).toHaveValue(email)
  await page.getByLabel('Password', { exact: true }).fill('brand-new-pass-456')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForURL('/')
  await expect(
    page.getByRole('heading', { name: 'Welcome Home!' }),
  ).toBeVisible()
})
