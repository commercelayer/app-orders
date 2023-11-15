import {
  formatCentsToCurrency,
  useTokenProvider,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { LineItem, Order } from '@commercelayer/sdk'
import { arrayOf } from '../utils'

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
    (order.shipments?.length ?? 0) <= 0 ||
    (order.shipments?.filter((shipment) => shipment.shipping_method == null)
      ?.length ?? 0) > 0

  function isGiftCard(
    item: LineItem
  ): item is Extract<LineItem, LineItem> & { item_type: 'gift_cards' } {
    return (
      item.type === 'line_items' &&
      item.item_type === 'gift_cards' &&
      item.unit_amount_cents != null &&
      item.unit_amount_cents > 0
    )
  }

  const hasLineItems =
    (order.line_items?.filter(
      (lineItem) =>
        arrayOf<LineItem['item_type']>(['skus', 'bundles']).includes(
          lineItem.item_type
        ) || isGiftCard(lineItem)
    )?.length ?? 0) > 0

  return {
    /** Order is in `editing` status and user has permission to update it. */
    isEditing,
    /** Whether the order has shoppable line items or not. */
    hasLineItems,
    /** `true` when there's one or not shipments without a selected `shipping_method`. */
    hasInvalidShipments,
    /** Difference between the current `total_amount` and the `place_total_amount`. */
    diffTotalAndPlacedTotal:
      isOriginalOrderAmountExceeded && currencyCode != null
        ? formatCentsToCurrency(diffTotalAndPlacedTotal, currencyCode)
        : null
  }
}
