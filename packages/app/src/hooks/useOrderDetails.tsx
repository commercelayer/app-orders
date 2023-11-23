import { makeOrder } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'

export const orderIncludeAttribute = [
  'market',
  'customer',
  'line_items',
  'shipping_address',
  'billing_address',
  'shipments',
  'payment_method',
  'payment_source',

  // order editing
  'line_items.sku',
  'shipments.shipping_method',
  'shipments.available_shipping_methods',
  'shipments.stock_location',
  'shipments.stock_line_items',
  'shipments.stock_line_items.sku'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderDetails(id: string) {
  const {
    data: order,
    isLoading,
    mutate: mutateOrder,
    isValidating
  } = useCoreApi(
    'orders',
    'retrieve',
    !isEmpty(id)
      ? [
          id,
          {
            include: orderIncludeAttribute
          }
        ]
      : null,
    {
      fallbackData: makeOrder()
    }
  )

  return { order, isLoading, mutateOrder, isValidating }
}
