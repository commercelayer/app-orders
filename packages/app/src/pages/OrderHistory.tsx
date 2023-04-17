import { ListItemOrder } from '#components/ListItemOrder'
import { filtersAdapters, getActiveFilterCountFromUrl } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  A,
  Button,
  PageLayout,
  ResourceList,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { QueryParamsList } from '@commercelayer/sdk'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-location'

export function OrderHistory(): JSX.Element {
  const {
    settings: { mode, timezone }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const search = useSearch()
  const [, setLocation] = useLocation()
  const [sdkQuery, setSdkQuery] = useState<QueryParamsList>()
  const hasFilters = getActiveFilterCountFromUrl() > 0

  useEffect(() => {
    setSdkQuery({
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
      filters: filtersAdapters.fromUrlQueryToSdk(search, timezone),
      sort: {
        updated_at: 'desc'
      }
    })
  }, [search])

  if (sdkQuery == null) {
    return <div />
  }

  return (
    <PageLayout
      title='Order history'
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        setLocation(appRoutes.home.makePath())
      }}
    >
      <Spacer top='4' bottom='14'>
        <Link
          href={appRoutes.filters.makePath(
            filtersAdapters.fromUrlQueryToUrlQuery(location.search)
          )}
        >
          <Button role='link' variant='secondary'>
            Filters
          </Button>
        </Link>
      </Spacer>

      <Spacer bottom='14'>
        <ResourceList
          sdkClient={sdkClient}
          title='Results'
          type='orders'
          query={sdkQuery}
          emptyState={{
            title: hasFilters ? 'No orders found!' : 'No orders yet!',
            description: hasFilters ? (
              <div>
                <p>No orders to list for the current filters selection.</p>
              </div>
            ) : (
              <div>
                <p>Add an order with the API, or use the CLI.</p>
                <A
                  target='_blank'
                  href='https://docs.commercelayer.io/core/v/api-reference/orders'
                  rel='noreferrer'
                >
                  View API reference.
                </A>
              </div>
            ),
            icon: 'stack'
          }}
          Item={ListItemOrder}
        />
      </Spacer>
    </PageLayout>
  )
}
