import {
  getFulfillmentStatusName,
  getOrderStatusName,
  getPaymentStatusName,
  getTimeRangePresetName
} from '#data/dictionaries'
import {
  filtersAdapters,
  getActiveFilterCountFromUrl,
  type FilterFormValues
} from '#data/filters'
import { getTimeRangeCustomLabel } from '#data/filtersTimeUtils'
import { appRoutes } from '#data/routes'
import {
  ButtonFilter,
  SkeletonTemplate,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Market } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-location'

export function FiltersNav(): JSX.Element {
  const {
    settings: { timezone }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const search = useSearch()
  const filters = useMemo(
    () => filtersAdapters.fromUrlQueryToFormValues(search),
    [search]
  )

  const activeGroupCount = getActiveFilterCountFromUrl()

  const selectedMarkets = filters?.market ?? []
  const selectedStatus = filters?.status ?? []
  const selectedPaymentStatus = filters?.paymentStatus ?? []
  const selectedFulfillmentStatus = filters?.fulfillmentStatus ?? []
  const selectedTimePreset = filters?.timePreset
  const selectedTimeFrom = filters?.timeFrom
  const selectedTimeTo = filters?.timeTo

  const { sdkClient } = useCoreSdkProvider()
  const [isLoading, setIsLoading] = useState(true)
  const [marketDetail, setMarketDetail] = useState<Market>()

  const updateQueryString = (qs: string): void => {
    navigate(`?${qs}`)
  }

  const navigateToFiltersEdit = (): void => {
    setLocation(
      appRoutes.filters.makePath(
        filtersAdapters.fromUrlQueryToUrlQuery(location.search)
      )
    )
  }

  const removeSingleFilterGroup = (filterKey: keyof FilterFormValues): void => {
    updateQueryString(
      filtersAdapters.fromFormValuesToUrlQuery({
        ...filters,
        [filterKey]: []
      })
    )
  }

  const removeTimeRangeFilter = (): void => {
    updateQueryString(
      filtersAdapters.fromFormValuesToUrlQuery({
        ...filters,
        timePreset: undefined,
        timeFrom: undefined,
        timeTo: undefined
      })
    )
  }

  useEffect(
    function fetchSingleMarket() {
      if (selectedMarkets.length === 1 && selectedMarkets[0] != null) {
        sdkClient.markets
          .retrieve(selectedMarkets[0], {
            fields: ['id', 'name']
          })
          .then(setMarketDetail)
          .finally(() => {
            setIsLoading(false)
          })
      } else {
        setIsLoading(false)
      }
    },
    [selectedMarkets]
  )

  if (filters == null) {
    return <></>
  }

  return (
    <SkeletonTemplate isLoading={isLoading} delayMs={0}>
      <div className='flex gap-4 flex-wrap'>
        {/* Main filter button */}
        {activeGroupCount > 0 ? (
          <ButtonFilter
            label={`Filters · ${activeGroupCount}`}
            icon='funnel'
            onClick={navigateToFiltersEdit}
            onRemoveRequest={() => {
              // remove all filters from url query
              updateQueryString('')
            }}
          />
        ) : (
          <ButtonFilter
            label='Filters'
            icon='funnel'
            onClick={navigateToFiltersEdit}
          />
        )}

        {/* Markets */}
        {selectedMarkets.length > 0 && selectedMarkets[0] != null ? (
          <ButtonFilter
            label={getButtonFilterLabel({
              list: selectedMarkets,
              labelMultiItem: 'Markets',
              labelSingleItem: marketDetail?.name ?? selectedMarkets[0]
            })}
            onClick={navigateToFiltersEdit}
            onRemoveRequest={() => {
              removeSingleFilterGroup('market')
            }}
          />
        ) : null}

        {/* Status */}
        {selectedStatus.length > 0 && selectedStatus[0] != null ? (
          <ButtonFilter
            label={getButtonFilterLabel({
              list: selectedStatus,
              labelMultiItem: 'Status',
              labelSingleItem: getOrderStatusName(selectedStatus[0])
            })}
            onClick={navigateToFiltersEdit}
            onRemoveRequest={() => {
              removeSingleFilterGroup('status')
            }}
          />
        ) : null}

        {/* Payment status */}
        {selectedPaymentStatus.length > 0 &&
        selectedPaymentStatus[0] != null ? (
          <ButtonFilter
            label={getButtonFilterLabel({
              list: selectedPaymentStatus,
              labelMultiItem: 'Payment status',
              labelSingleItem: getPaymentStatusName(selectedPaymentStatus[0])
            })}
            onClick={navigateToFiltersEdit}
            onRemoveRequest={() => {
              removeSingleFilterGroup('paymentStatus')
            }}
          />
        ) : null}

        {/* Fulfillment status */}
        {selectedFulfillmentStatus.length > 0 &&
        selectedFulfillmentStatus[0] != null ? (
          <ButtonFilter
            label={getButtonFilterLabel({
              list: selectedFulfillmentStatus,
              labelMultiItem: 'Fulfillment status',
              labelSingleItem: getFulfillmentStatusName(
                selectedFulfillmentStatus[0]
              )
            })}
            onClick={navigateToFiltersEdit}
            onRemoveRequest={() => {
              removeSingleFilterGroup('fulfillmentStatus')
            }}
          />
        ) : null}

        {/* Time range preset */}
        {selectedTimePreset != null && selectedTimePreset !== 'custom' ? (
          <ButtonFilter
            label={getTimeRangePresetName(selectedTimePreset)}
            onClick={navigateToFiltersEdit}
            onRemoveRequest={removeTimeRangeFilter}
          />
        ) : null}

        {/* Time range custom */}
        {selectedTimePreset === 'custom' &&
        selectedTimeTo != null &&
        selectedTimeFrom != null ? (
          <ButtonFilter
            label={getTimeRangeCustomLabel(
              selectedTimeFrom,
              selectedTimeTo,
              timezone
            )}
            onClick={navigateToFiltersEdit}
            onRemoveRequest={removeTimeRangeFilter}
          />
        ) : null}
      </div>
    </SkeletonTemplate>
  )
}

/**
 * Get label for ButtonFilter component.
 * If list has only one item, will use the first item in the list.
 * If list has more than one item, will use the labelMultiItem and append the count of items in the list.
 */
function getButtonFilterLabel({
  list,
  labelSingleItem,
  labelMultiItem
}: {
  /**
   * list of items/options active for the filter group
   */
  list: string[]
  /**
   * label to use when list has more than one item
   */
  labelMultiItem: string
  /**
   * optional label to use when list has only one item, will use the first item in the list if not provided
   * in this way we can handle the loading ui state with SkeletonTemplate
   */
  labelSingleItem: string
}): string {
  const firstItemLabel = labelSingleItem ?? list[0] ?? ''
  const groupLabelWithCount = `${labelMultiItem} · ${list.length}`

  return list.length === 1 ? firstItemLabel : groupLabelWithCount
}
