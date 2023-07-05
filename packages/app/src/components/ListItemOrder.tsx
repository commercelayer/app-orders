import { appRoutes } from '#data/routes'
import { useBackToList } from '#hooks/useBackToList'
import { makeOrder } from '#mocks'
import { ListItemOrder as ListItemOrderElements } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { Link } from 'wouter'

interface Props {
  resource?: Order
  isLoading?: boolean
  delayMs?: number
}

export function ListItemOrder({
  resource = makeOrder(),
  isLoading,
  delayMs
}: Props): JSX.Element {
  const { setBackToList } = useBackToList()
  return (
    <Link
      href={appRoutes.details.makePath(resource.id)}
      onClick={() => {
        setBackToList({
          search: window.location.search
        })
      }}
    >
      <ListItemOrderElements
        order={resource}
        isLoading={isLoading}
        delayMs={delayMs}
        tag='a'
      />
    </Link>
  )
}
