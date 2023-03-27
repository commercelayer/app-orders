import {
  Icon,
  Legend,
  ListItem,
  SkeletonTemplate,
  Text,
  useCoreSdkProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order, isLoading }): JSX.Element | null => {
    const [totalOrders, setTotalOrders] = useState<number | undefined>()

    const totalOrdersIsLoading = useMemo(
      () => totalOrders === undefined,
      [totalOrders]
    )

    const { sdkClient } = useCoreSdkProvider()

    useEffect(
      function fetchCustomer() {
        if (isLoading !== true && sdkClient != null && order.customer != null) {
          void sdkClient.orders
            .list({
              fields: ['id'],
              pageSize: 1,
              filters: {
                customer_id_eq: order.customer.id
              }
            })
            .then((response) => {
              setTotalOrders(response.meta.recordCount)
            })
        }
      },
      [sdkClient, order]
    )

    if (order.customer == null) {
      return null
    }

    return (
      <>
        <Legend title='Customer' />
        <ListItem
          tag='div'
          icon={<Icon name='user' background='teal' gap='large' />}
        >
          <div>
            <Text tag='div' weight='semibold'>
              {order.customer.email}
            </Text>
            <Text size='small' tag='div' variant='info' weight='medium'>
              <SkeletonTemplate isLoading={totalOrdersIsLoading}>
                {totalOrders} orders
              </SkeletonTemplate>
            </Text>
          </div>
        </ListItem>
      </>
    )
  }
)
