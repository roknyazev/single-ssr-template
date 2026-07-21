import { Link } from '@tanstack/react-router'

import { AuthCard, AuthCardFooter } from '@/shared/auth-card'
import { useTranslation } from '@/shared/i18n'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <main className={'flex min-h-svh items-center justify-center'}>
      <AuthCard
        title={t('common.notFound.title')}
        description={t('common.notFound.description')}
      >
        <AuthCardFooter>
          <Link
            to={'/'}
            className={
              'text-sm text-foreground underline-offset-4 hover:underline'
            }
          >
            {t('common.notFound.homeLink')}
          </Link>
        </AuthCardFooter>
      </AuthCard>
    </main>
  )
}
