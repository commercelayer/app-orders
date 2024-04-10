import { makeOrder } from '#mocks'
import { ResourceListItem, navigateTo } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

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
  const [, setLocation] = useLocation()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        setLocation,
        destination: {
          app: 'orders',
          resourceId: resource.id
        }
      })}
    />
  )
}
