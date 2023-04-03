import { ListItemOrder } from '#components/ListItemOrder'
import { filtersAdapters } from '#data/filters'
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

export function OrderHistory(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [sdkQuery, setSdkQuery] = useState<QueryParamsList>()

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
      filters: filtersAdapters.fromUrlQueryToSdk(location.search),
      sort: {
        updated_at: 'desc'
      }
    })
  }, [location.search])

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
            title: 'No orders yet!',
            description: (
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
