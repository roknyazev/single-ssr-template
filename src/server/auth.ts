import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { tanstackStartCookies } from 'better-auth/tanstack-start'

import { createDb } from './auth-db'
import { deliver } from './mailbox'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: createDb(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      deliver(user.email, { type: 'reset-password', url })
      console.log(`[auth] Password reset email for ${user.email}:\n${url}`)
    },
    revokeSessionsOnPasswordReset: true,
    onExistingUserSignUp: async ({ user }) => {
      deliver(user.email, { type: 'existing-user' })
      console.log(
        `[auth] Existing-account notice for ${user.email} (verified: ${user.emailVerified}): someone attempted to sign up with this address.`,
      )
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  plugins: [
    emailOTP({
      disableSignUp: true,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({ email, otp, type }) => {
        deliver(email, { type, otp })
        console.log(`[auth] ${type} OTP for ${email}: ${otp}`)
      },
    }),
    tanstackStartCookies(),
  ],
})
