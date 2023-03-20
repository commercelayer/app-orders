import {
  Legend,
  withinSkeleton,
  OrderSummary as OrderSummaryElement
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderSummary = withinSkeleton<Props>(({ order }): JSX.Element => {
  return (
    <>
      <Legend title='Summary' />
      <OrderSummaryElement order={order} />
    </>
  )
})
