import {
  formatCentsToCurrency,
  useTokenProvider,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderStatus(order: Order) {
  const { canUser } = useTokenProvider()

  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | null
    | undefined

  const isEditing = order.status === 'editing' && canUser('update', 'orders')

  const diffTotalAndPlacedTotal =
    (order.total_amount_with_taxes_cents ?? 0) -
    (order.place_total_amount_cents ?? 0)

  const isOriginalOrderAmountExceeded =
    order.status === 'editing' && diffTotalAndPlacedTotal > 0

  const hasInvalidShipments =
    (order.shipments?.filter((shipment) => shipment.shipping_method == null)
      ?.length ?? 0) > 0

  return {
    /** Order is in `editing` status and user has permission to update it. */
    isEditing,
    /** `true` when there's one or not shipments without a selected `shipping_method`. */
    hasInvalidShipments,
    /** Difference between the current `total_amount` and the `place_total_amount`. */
    diffTotalAndPlacedTotal:
      isOriginalOrderAmountExceeded && currencyCode != null
        ? formatCentsToCurrency(diffTotalAndPlacedTotal, currencyCode)
        : null
  }
}
