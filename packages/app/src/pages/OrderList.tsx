import { FiltersNav } from '#components/FiltersNav'
import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemOrder } from '#components/ListItemOrder'
import {
  enforceDefaultStatusIn,
  filtersAdapters,
  getActiveFilterCountFromUrl
} from '#data/filters'
import { filtersByListType, type ListType } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  ResourceList,
  SearchBar,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type QueryParamsList } from '@commercelayer/sdk'
import { type QueryFilter } from '@commercelayer/sdk/lib/cjs/query'
import isEmpty from 'lodash/isEmpty'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-location'

interface Props {
  type: ListType
}

const pageTitle: Record<ListType, string> = {
  awaitingApproval: 'Awaiting approval',
  paymentToCapture: 'Payment to capture',
  fulfillmentInProgress: 'Fulfillment in progress',
  archived: 'Archived',
  history: 'Order history'
}

export function OrderList({ type }: Props): JSX.Element {
  const {
    settings: { mode, timezone }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const search = useSearch()
  const [, setLocation] = useLocation()
  const [sdkQuery, setSdkQuery] = useState<QueryParamsList>()

  const showFilters = type === 'history'
  const isUserFiltered = getActiveFilterCountFromUrl({ includeText: true }) > 0

  useEffect(() => {
    const filters = showFilters
      ? filtersAdapters.fromUrlQueryToSdk(search, timezone)
      : filtersAdapters.fromFormValuesToSdk(filtersByListType[type])
    setSdkQuery(buildListQuery(filters))
  }, [search])

  const updateTextFilter = (hint?: string): void => {
    const currentFilters = filtersAdapters.fromUrlQueryToFormValues(search)
    const newQueryString = filtersAdapters.fromFormValuesToUrlQuery({
      ...currentFilters,
      text: isEmpty(hint?.trim()) ? undefined : hint
    })
    navigate(`?${newQueryString}`)
  }

  if (sdkQuery == null) {
    return <div />
  }

  return (
    <PageLayout
      title={pageTitle[type]}
      mode={mode}
      onGoBack={() => {
        setLocation(appRoutes.home.makePath())
      }}
      gap={showFilters ? 'only-top' : undefined}
    >
      {showFilters ? (
        <Spacer top='4' bottom='14'>
          <Spacer bottom='4'>
            <SearchBar
              placeholder='Search...'
              initialValue={
                filtersAdapters.fromUrlQueryToFormValues(search).text
              }
              onClear={updateTextFilter}
              onSearch={updateTextFilter}
            />
          </Spacer>
          <FiltersNav />
        </Spacer>
      ) : null}

      <Spacer bottom='14'>
        <ResourceList
          sdkClient={sdkClient}
          title='Results'
          type='orders'
          query={sdkQuery}
          emptyState={
            <ListEmptyState
              scope={
                isUserFiltered
                  ? 'filters'
                  : type === 'history'
                  ? 'history'
                  : 'list'
              }
            />
          }
          Item={ListItemOrder}
        />
      </Spacer>
    </PageLayout>
  )
}

function buildListQuery(filters: QueryFilter): QueryParamsList {
  return {
    fields: {
      orders: [
        'id',
        'number',
        'updated_at',
        'formatted_total_amount',
        'status',
        'payment_status',
        'fulfillment_status',
        'customer',
        'market'
      ],
      customers: ['email'],
      markets: ['id', 'name']
    },
    include: ['market', 'customer'],
    pageSize: 25,
    filters: enforceDefaultStatusIn(filters),
    sort: {
      updated_at: 'desc'
    }
  }
}
