import { useCoreApi } from '@commercelayer/app-elements'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useMarketInventoryModel(marketId?: string) {
  const { data: inventoryModel, isLoading } = useCoreApi(
    'markets',
    'inventory_model',
    marketId != null
      ? [
          marketId,
          {
            include: ['inventory_return_locations.stock_location.address']
          }
        ]
      : null
  )

  return { inventoryModel, isLoading }
}
