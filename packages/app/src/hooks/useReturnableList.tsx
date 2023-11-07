import { isMockedId } from '#mocks'
import type {
  LineItem,
  Order,
  Return,
  ReturnLineItem
} from '@commercelayer/sdk'
import { useMemo } from 'react'

function returnsToReturnLineItems(returns: Return[]): ReturnLineItem[] {
  const returnLineItems: Record<string, ReturnLineItem> = {}

  for (const returnObj of returns) {
    for (const returnLineItem of returnObj.return_line_items ?? []) {
      if (
        returnObj.status === 'draft' ||
        returnObj.status === 'cancelled' ||
        (returnLineItem.sku_code == null && returnLineItem.bundle_code == null)
      ) {
        break
      }

      const returnLineItemKey =
        returnLineItem.sku_code ?? returnLineItem.bundle_code

      const currentReturnLineItem = returnLineItems[returnLineItemKey as string]

      if (currentReturnLineItem != null) {
        currentReturnLineItem.quantity += currentReturnLineItem.quantity
      } else {
        returnLineItems[returnLineItemKey as string] = {
          ...returnLineItem,
          type: 'return_line_items',
          name: returnLineItem.name,
          sku_code: returnLineItem.sku_code,
          bundle_code: returnLineItem.bundle_code,
          image_url: returnLineItem.image_url,
          quantity: returnLineItem.quantity ?? 0
        }
      }
    }
  }

  return Object.values(returnLineItems)
}

export function useReturnableList(order: Order): LineItem[] {
  return useMemo(() => {
    if (!isMockedId(order.id)) {
      const returnLineItemsFromReturns = returnsToReturnLineItems(
        order.returns ?? []
      )
      const returnableLineItems =
        order.line_items
          ?.filter(
            (lineItem) =>
              lineItem.item_type === 'skus' || lineItem.item_type === 'bundles'
          )
          ?.map((lineItem) => {
            const returnLineItemQuantity: number =
              returnLineItemsFromReturns.find(
                (item) =>
                  (item.sku_code != null &&
                    item.sku_code === lineItem.sku_code) ||
                  (item.bundle_code != null &&
                    item.bundle_code === lineItem.bundle_code)
              )?.quantity ?? 0
            return {
              ...lineItem,
              quantity: lineItem.quantity - returnLineItemQuantity
            }
          })
          .filter((lineItem) => lineItem.quantity > 0) ?? []
      return returnableLineItems
    }
    return []
  }, [order.line_items, order.returns])
}
