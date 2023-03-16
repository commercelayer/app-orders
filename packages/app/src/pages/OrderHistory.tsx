import { ListItemOrder } from '#components/ListItemOrder'
import { appRoutes } from '#data/routes'
import {
  List,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import type { ListResponse } from '@commercelayer/sdk/lib/cjs/resource'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

export function OrderHistory(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  const [orders, setOrders] = useState<ListResponse<Order> | undefined>(
    undefined
  )
  const [page, setPage] = useState(1)
  useEffect(() => {
    if (sdkClient != null) {
      void sdkClient.orders
        .list({
          include: ['market', 'customer'],
          pageNumber: page,
          pageSize: 25,
          filters: {
            status_in: 'placed,approved,cancelled'
          },
          sort: {
            updated_at: 'desc'
          }
        })
        .then((response) => {
          setOrders(response)
        })
    }
  }, [sdkClient, page])

  if (orders === undefined) {
    return <div>Loading</div>
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
        <List
          title='Results'
          pagination={{
            pageCount: orders.meta.pageCount,
            currentPage: orders.meta.currentPage,
            onChangePageRequest: setPage,
            recordCount: orders.meta.recordCount,
            recordsPerPage: orders.meta.recordsPerPage
          }}
        >
          {orders.map((order) => (
            <ListItemOrder key={order.id} order={order} />
          ))}
        </List>
      </Spacer>
    </PageLayout>
  )
}
