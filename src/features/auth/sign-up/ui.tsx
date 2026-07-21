import { useTranslation } from '@/shared/i18n'

import { signUpSchema, useSignUpForm } from './model'

export const SignUpName = ({
  form,
  autoFocus,
}: {
  form: ReturnType<typeof useSignUpForm>
  autoFocus?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <form.AppField
      validators={{ onDynamic: signUpSchema.shape.name }}
      name={'name'}
      children={field => (
        <field.Name label={t('auth.signUp.nameLabel')} autoFocus={autoFocus} />
      )}
    />
  )
}

export const SignUpEmail = ({
  form,
}: {
  form: ReturnType<typeof useSignUpForm>
}) => {
  const { t } = useTranslation()
  return (
    <form.AppField
      validators={{ onDynamic: signUpSchema.shape.email }}
      name={'email'}
      children={field => <field.Email label={t('auth.signUp.emailLabel')} />}
    />
  )
}

export const SignUpPassword = ({
  form,
}: {
  form: ReturnType<typeof useSignUpForm>
}) => {
  const { t } = useTranslation()
  return (
    <form.AppField
      validators={{ onDynamic: signUpSchema.shape.password }}
      name={'password'}
      children={field => (
        <field.Password
          label={t('auth.signUp.passwordLabel')}
          autoComplete={'new-password'}
        />
      )}
    />
  )
}
