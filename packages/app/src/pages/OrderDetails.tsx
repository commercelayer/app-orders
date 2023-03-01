import { appRoutes } from '#data/routes'
import { PageLayout, Spacer } from '@commercelayer/app-elements'
import type { JSX } from 'preact/jsx-runtime'
import { useLocation } from 'wouter'

export function OrderDetails(): JSX.Element {
  const [, setLocation] = useLocation()

  return (
    <PageLayout
      title='Order details'
      description='Placed on XXX'
      onGoBack={() => {
        setLocation(appRoutes.filters.makePath())
      }}
    >
      <Spacer bottom='4'>...</Spacer>
    </PageLayout>
  )
}
