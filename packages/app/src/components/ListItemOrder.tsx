import { makeOrder } from '#mocks'
import {
  ListItemOrder as ListItemOrderElements,
  navigateToDetail
} from '@commercelayer/app-elements'
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
    <ListItemOrderElements
      order={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      tag='a'
      {...navigateToDetail({
        setLocation,
        destination: {
          app: 'orders',
          resourceId: resource.id
        }
      })}
    />
  )
}
