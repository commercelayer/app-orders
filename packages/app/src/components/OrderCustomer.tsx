import {
  Avatar,
  Legend,
  ListItem,
  SkeletonTemplate,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { Customer, Order } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'

interface Props {
  order?: Order
}

export const OrderCustomer = ({ order }: Props): JSX.Element | null => {
  const [customer, setCustomer] = useState<Customer>({
    email: 'john.doe@commercelayer.io',
    id: '',
    type: 'customers',
    created_at: '',
    updated_at: ''
  })

  const isLoading = useMemo(() => customer.id === '', [customer])
  // const isLoading = true

  const { sdkClient } = useCoreSdkProvider()

  useEffect(
    function fetchCustomer() {
      if (
        sdkClient != null &&
        order !== undefined &&
        order.customer !== undefined &&
        order.customer.id !== undefined
      ) {
        void sdkClient.customers
          .retrieve(order.customer.id, { include: ['orders'] })
          .then((response) => {
            setCustomer(response)
          })
      }
    },
    [sdkClient, order]
  )

  return (
    <>
      <SkeletonTemplate isLoading={isLoading}>
        <Legend title='Customer' />
        <ListItem
          icon={
            <Avatar
              alt={customer.email ?? ''}
              border='none'
              shape='circle'
              src='https://ui-avatars.com/api/Commerce+Layer/160/101111/FFFFFF/2/0.33/false/true/true'
            />
          }
        >
          <div>
            <Text tag='div' weight='semibold'>
              {customer.email}
            </Text>
            <Text size='small' tag='div' variant='info' weight='medium'>
              {customer.orders?.length} orders
            </Text>
          </div>
        </ListItem>
      </SkeletonTemplate>
    </>
  )
}
