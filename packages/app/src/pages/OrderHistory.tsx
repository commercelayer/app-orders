import { appRoutes } from '#data/routes'
import {
  A,
  PageLayout,
  ResourceList,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { ListItemOrder } from '../components/ListItemOrder'
import type { QueryParamsList } from '@commercelayer/sdk'

export function OrderHistory(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const query: QueryParamsList = {
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
    filters: {
      status_in: 'placed,approved,cancelled'
    },
    sort: {
      updated_at: 'desc'
    }
  }

  return (
    <PageLayout
      title='Order history'
      mode={mode}
      onGoBack={() => {
        setLocation(appRoutes.home.makePath())
      }}
    >
      <Spacer bottom='14'>
        <ResourceList
          sdkClient={sdkClient}
          title='Results'
          type='orders'
          query={query}
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
