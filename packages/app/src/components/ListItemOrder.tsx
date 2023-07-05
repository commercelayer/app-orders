import { appRoutes } from '#data/routes'
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
  return (
    <Link href={appRoutes.details.makePath(resource.id)}>
      <ListItemOrderElements
        order={resource}
        isLoading={isLoading}
        delayMs={delayMs}
        tag='a'
      />
    </Link>
  )
}
