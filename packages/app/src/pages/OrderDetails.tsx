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
import { useEffect, useMemo, useState } from 'react'
import { isMock, makeOrder } from '#mocks'
import { Link, useLocation, useRoute } from 'wouter'
import { ScrollToTop } from '#components/ScrollToTop'
import { OrderDetailsContextMenu } from '#components/OrderDetailsContextMenu'
import { OrderContext } from '#contexts/OrderContext'
import { type Order } from '@commercelayer/sdk'

export function OrderDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode, timezone }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const [order, setOrder] = useState<Order>(makeOrder())

  const isLoading = useMemo(() => isMock(order), [order])

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
    <OrderContext.Provider value={[order, setOrder]}>
      <PageLayout
        mode={mode}
        actionButton={<OrderDetailsContextMenu order={order} />}
        title={
          <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
        }
        description={
          <SkeletonTemplate isLoading={isLoading}>{`Placed on ${formatDate({
            isoDate: order.placed_at ?? '',
            timezone,
            format: 'full'
          })}`}</SkeletonTemplate>
        }
        onGoBack={() => {
          setLocation(appRoutes.filters.makePath())
        }}
      >
        <ScrollToTop />
        <SkeletonTemplate isLoading={isLoading}>
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
        </SkeletonTemplate>
      </PageLayout>
    </OrderContext.Provider>
  )
}
