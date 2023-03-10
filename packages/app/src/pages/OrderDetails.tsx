import { OrderAddresses } from '#components/OrderAddresses'
import { OrderCustomer } from '#components/OrderCustomer'
import { OrderShipments } from '#components/OrderShipments'
import { OrderSteps } from '#components/OrderSteps'
import { OrderSummary } from '#components/OrderSummary'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  formatDate,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { LineItem, Order, Shipment } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'
import { Link, useLocation, useRoute } from 'wouter'

export function OrderDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode, timezone }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const [order, setOrder] = useState<Order>({
    created_at: '',
    id: '',
    type: 'orders',
    updated_at: '',
    status: 'Unknown',
    payment_status: 'Unknown',
    fulfillment_status: 'Unknown',
    line_items: Array(2).fill({
      type: 'line_items',
      id: '',
      created_at: '',
      updated_at: '',
      item_type: 'skus',
      image_url:
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
      name: 'I do not know the name of the product',
      quantity: 1,
      formatted_total_amount: '10.00€',
      formatted_unit_amount: '10.00€'
    } satisfies LineItem),
    market: {
      id: '',
      created_at: '',
      type: 'markets',
      updated_at: '',
      name: 'Unknown'
    },
    shipments: Array(2).fill({
      type: 'shipments',
      id: '',
      created_at: '',
      updated_at: '',
      number: 'NY Store #19346523/S/001'
    } satisfies Shipment)
  })

  const isLoading = useMemo(() => order.id === '', [order])

  const orderId = params?.orderId

  useEffect(
    function fetchOrder() {
      if (sdkClient != null && orderId !== undefined) {
        void sdkClient.orders
          .retrieve(orderId, {
            include: [
              'market',
              'customer',
              'line_items',
              'shipping_address',
              'billing_address',
              'shipments'
            ]
          })
          .then((response) => {
            setOrder(response)
          })
      }
    },
    [sdkClient, orderId]
  )

  if (orderId === undefined || !canUser('read', 'orders')) {
    return (
      <PageLayout
        title='Orders'
        onGoBack={() => {
          setLocation(appRoutes.filters.makePath())
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.filters.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const pageTitle = `${order.market?.name} #${order.number}`

  return (
    <SkeletonTemplate isLoading={isLoading}>
      <PageLayout
        title={
          <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
        }
        description={
          <SkeletonTemplate isLoading={isLoading}>{`Placed on ${formatDate({
            isoDate: order.updated_at,
            timezone,
            format: 'full'
          })}`}</SkeletonTemplate>
        }
        onGoBack={() => {
          setLocation(appRoutes.filters.makePath())
        }}
      >
        <Spacer bottom='4'>
          <OrderSteps order={order} />
          <Spacer top='14'>
            <OrderSummary order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderCustomer order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderAddresses order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderShipments order={order} />
          </Spacer>
        </Spacer>
      </PageLayout>
    </SkeletonTemplate>
  )
}
