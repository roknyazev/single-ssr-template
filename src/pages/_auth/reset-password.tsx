import { createFileRoute, Link } from '@tanstack/react-router'

import {
  AuthCard,
  AuthCardFooter,
  AuthCardForm,
  resetPasswordSearchSchema,
} from '@/entities/auth'
import {
  ResetPasswordPassword,
  useResetPasswordForm,
} from '@/features/auth/reset-password'
import { useTranslation } from '@/shared/i18n'

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: resetPasswordSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { token, error, redirect, email } = Route.useSearch()
  const navigate = Route.useNavigate()
  const form = useResetPasswordForm(token ?? '', {
    onSuccess: () =>
      navigate({ to: '/sign-in/password', search: { redirect, email } }),
  })

  if (!token || error) {
    return (
      <AuthCard
        title={t('auth.resetPassword.title')}
        description={t('auth.resetPassword.invalidLinkDescription')}
      >
        <AuthCardFooter>
          <Link
            to={'/forgot-password'}
            search={{ redirect }}
            className={
              'text-sm text-foreground underline-offset-4 hover:underline'
            }
          >
            {t('auth.resetPassword.requestNewLink')}
          </Link>
        </AuthCardFooter>
      </AuthCard>
    )
  }

  return (
    <form.AppForm>
      <AuthCard title={t('auth.resetPassword.title')}>
        <AuthCardForm
          footer={
            <form.Submit className={'w-full'}>
              {t('auth.resetPassword.submitButton')}
            </form.Submit>
          }
        >
          <ResetPasswordPassword form={form} autoFocus />
        </AuthCardForm>
      </AuthCard>
    </form.AppForm>
  )
}
