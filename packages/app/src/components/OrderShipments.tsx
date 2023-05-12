import {
  formatDate,
  Icon,
  Legend,
  ListItem,
  Spacer,
  Text,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order, Shipment } from '@commercelayer/sdk'

interface Props {
  order: Order
}

function getIcon(status: Shipment['status']): JSX.Element | undefined {
  switch (status) {
    case 'cancelled':
      return undefined
    case 'draft':
      return undefined
    case 'on_hold':
      return <Icon name='hourglass' background='orange' gap='large' />
    case 'packing':
      return <Icon name='package' background='orange' gap='large' />
    case 'picking':
      return <Icon name='arrowDown' background='orange' gap='large' />
    case 'ready_to_ship':
      return <Icon name='arrowUpRight' background='orange' gap='large' />
    case 'shipped':
      return <Icon name='check' background='green' gap='large' />
    case 'upcoming':
      return undefined
  }
}

const renderShipment = (shipment: Shipment): JSX.Element => {
  const { user } = useTokenProvider()

  return (
    <ListItem key={shipment.id} tag='div' icon={getIcon(shipment.status)}>
      <div>
        <Text tag='div' weight='semibold'>
          #{shipment.number}
        </Text>
        <Text size='small' tag='div' variant='info' weight='medium'>
          {shipment.status} ·{' '}
          {formatDate({
            isoDate: shipment.updated_at,
            timezone: user?.timezone,
            format: 'date'
          })}
        </Text>
      </div>
    </ListItem>
  )
}

export const OrderShipments = withSkeletonTemplate<Props>(({ order }) => {
  return (
    <>
      <Legend title='Shipments' />
      {order.shipments != null && order.shipments.length > 0 ? (
        order.shipments.map((shipment) => renderShipment(shipment))
      ) : (
        <Spacer top='6' bottom='6'>
          {' '}
          This order doesn't have any shipments.
        </Spacer>
      )}
    </>
  )
})
