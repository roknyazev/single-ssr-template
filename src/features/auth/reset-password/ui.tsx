import { useTranslation } from '@/shared/i18n'

import { resetPasswordSchema, useResetPasswordForm } from './model'

export const ResetPasswordPassword = ({
  form,
  autoFocus,
}: {
  form: ReturnType<typeof useResetPasswordForm>
  autoFocus?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <form.AppField
      validators={{ onDynamic: resetPasswordSchema.shape.password }}
      name={'password'}
      children={field => (
        <field.Password
          label={t('auth.resetPassword.passwordLabel')}
          autoComplete={'new-password'}
          autoFocus={autoFocus}
        />
      )}
    />
  )
}
