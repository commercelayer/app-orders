import {
  ListItem,
  RadialProgress,
  Section,
  StatusIcon,
  Text,
  formatDate,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order, Shipment } from '@commercelayer/sdk'
import type { SetNonNullable, SetRequired } from 'type-fest'

interface Props {
  order: Order
}

function getIcon(status: Shipment['status']): JSX.Element | undefined {
  switch (status) {
    case 'cancelled':
      return <StatusIcon name='x' background='gray' gap='large' />
    case 'draft':
      return <StatusIcon name='minus' background='gray' gap='large' />
    case 'on_hold':
      return <StatusIcon name='hourglass' background='orange' gap='large' />
    case 'packing':
      return <StatusIcon name='package' background='orange' gap='large' />
    case 'picking':
      return <StatusIcon name='arrowDown' background='orange' gap='large' />
    case 'ready_to_ship':
      return <StatusIcon name='arrowUpRight' background='orange' gap='large' />
    case 'shipped':
      return <StatusIcon name='check' background='green' gap='large' />
    case 'upcoming':
      return <RadialProgress icon='truck' />
  }
}

function sanitizeShipmentStatus(status: Shipment['status']): string {
  const sanitizedStatus = status.replaceAll('_', ' ')
  return sanitizedStatus.charAt(0).toUpperCase() + sanitizedStatus.slice(1)
}

const renderShipment = (shipment: Shipment): JSX.Element => {
  const {
    user,
    canAccess,
    settings: { mode }
  } = useTokenProvider()

  const navigateToShipment = canAccess('shipments')
    ? navigateTo({
        destination: {
          app: 'shipments',
          resourceId: shipment.id,
          mode
        }
      })
    : {}

  return (
    <ListItem
      key={shipment.id}
      tag={canAccess('shipments') ? 'a' : 'div'}
      icon={getIcon(shipment.status)}
      {...navigateToShipment}
    >
      <div>
        <Text tag='div' weight='semibold'>
          #{shipment.number}
        </Text>
        <Text size='small' tag='div' variant='info' weight='medium'>
          {formatDate({
            isoDate: shipment.updated_at,
            timezone: user?.timezone,
            format: 'date'
          })}{' '}
          · {shipment.shipping_method?.name} ·{' '}
          {sanitizeShipmentStatus(shipment.status)}
        </Text>
      </div>
      {canAccess('shipments') && <StatusIcon name='caretRight' />}
    </ListItem>
  )
}

function hasShipments(
  order: Order
): order is SetRequired<SetNonNullable<Order, 'shipments'>, 'shipments'> {
  return (
    order.shipments != null &&
    order.shipments.length > 0 &&
    order.shipments.filter((shipment) =>
      ['draft', 'cancelled'].includes(shipment.status)
    ).length === 0
  )
}

export const OrderShipments = withSkeletonTemplate<Props>(({ order }) => {
  if (!hasShipments(order)) {
    return null
  }

  return (
    <Section title='Shipments'>
      {order.shipments.map((shipment) => renderShipment(shipment))}
    </Section>
  )
})
