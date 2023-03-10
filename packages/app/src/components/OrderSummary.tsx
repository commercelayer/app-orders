import { Legend, withinSkeleton } from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import type { JSX } from 'preact/jsx-runtime'
import { OrderLineItem } from './OrderLineItem'

interface Props {
  order: Order
}

export const OrderSummary = withinSkeleton<Props>(({ order }): JSX.Element => {
  return (
    <>
      <Legend title='Summary' />
      {order.line_items?.map((lineItem) => (
        <OrderLineItem key={lineItem.id} lineItem={lineItem} />
      ))}
    </>
  )
})
