import {
  Icon,
  Legend,
  ListItem,
  Text,
  navigateToDetail,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const [, setLocation] = useLocation()
    const { canAccess } = useTokenProvider()

    if (order.customer == null) {
      return null
    }

    const navigateToCustomer = canAccess('customers')
      ? navigateToDetail({
          setLocation,
          destination: {
            app: 'customers',
            resourceId: order.customer.id
          }
        })
      : {}

    return (
      <>
        <Legend title='Customer' />
        <ListItem
          tag={canAccess('customers') ? 'a' : 'div'}
          icon={<Icon name='user' background='teal' gap='large' />}
          {...navigateToCustomer}
        >
          <div>
            <Text tag='div' weight='semibold'>
              {order.customer.email}
            </Text>
            <Text size='small' tag='div' variant='info' weight='medium'>
              {order.customer.total_orders_count} orders
            </Text>
          </div>
          {canAccess('customers') && <Icon name='caretRight' />}
        </ListItem>
      </>
    )
  }
)
