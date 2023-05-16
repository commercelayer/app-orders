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
      return <Icon name='x' background='gray' gap='large' />
    case 'draft':
      return <Icon name='minus' background='gray' gap='large' />
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
      return <Icon name='minus' background='gray' gap='large' />
  }
}

function sanitizeShipmentStatus(status: Shipment['status']): string {
  const sanitizedStatus = status.replaceAll('_', ' ')
  return sanitizedStatus.charAt(0).toUpperCase() + sanitizedStatus.slice(1)
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
          {sanitizeShipmentStatus(shipment.status)} ·{' '}
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
