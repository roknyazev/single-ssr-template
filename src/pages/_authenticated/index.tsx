import { createFileRoute, useRouter } from '@tanstack/react-router'

import { useSignOut } from '@/features/auth/sign-out'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/components/button'
import { SpinnerAddon } from '@/shared/ui/components/spinner-addon'

export const Route = createFileRoute('/_authenticated/')({
  component: Index,
})

function Index() {
  const { t } = useTranslation()
  const { user } = Route.useRouteContext()
  const router = useRouter()
  const signOut = useSignOut()

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <p>{t('auth.signedIn.description', { email: user.email })}</p>
      <Button
        variant="outline"
        disabled={signOut.isPending}
        aria-busy={signOut.isPending}
        onClick={() =>
          signOut.mutate(undefined, {
            onSuccess: () => router.navigate({ to: '/sign-in' }),
          })
        }
      >
        <SpinnerAddon enabled={signOut.isPending} />
        {t('auth.signedIn.signOutButton')}
      </Button>
    </div>
  )
}
