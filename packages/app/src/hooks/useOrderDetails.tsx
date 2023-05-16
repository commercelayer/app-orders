import { isMockedId, makeOrder } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function useOrderDetails(id: string): {
  order: Order
  isLoading: boolean
  mutateOrder: KeyedMutator<Order>
} {
  const {
    data: order,
    isLoading,
    mutate: mutateOrder
  } = useCoreApi(
    'orders',
    'retrieve',
    [
      id,
      {
        include: [
          'market',
          'customer',
          'line_items',
          'shipping_address',
          'billing_address',
          'shipments',

          // Timeline
          'transactions',
          'payment_method',
          'payment_source',
          'attachments'
        ]
      }
    ],
    {
      isPaused: () => isMockedId(id),
      fallbackData: makeOrder()
    }
  )

  return { order, isLoading, mutateOrder }
}