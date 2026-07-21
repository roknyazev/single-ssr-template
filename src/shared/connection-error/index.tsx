import { AuthCard, AuthCardFooter } from '@/shared/auth-card'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/components/button'

export function ConnectionError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <main className={'flex min-h-svh items-center justify-center'}>
      <AuthCard
        title={t('common.connectionError.title')}
        description={t('common.connectionError.description')}
      >
        <AuthCardFooter>
          <Button className={'w-full'} onClick={onRetry}>
            {t('common.connectionError.retryButton')}
          </Button>
        </AuthCardFooter>
      </AuthCard>
    </main>
  )
}
