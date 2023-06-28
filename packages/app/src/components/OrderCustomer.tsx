import {
  Icon,
  Legend,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
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
              {order.customer.total_orders_count} orders
            </Text>
          </div>
        </ListItem>
      </>
    )
  }
)
