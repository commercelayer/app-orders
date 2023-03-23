import {
  formatDate,
  Icon,
  Legend,
  ListItem,
  Spacer,
  Text,
  useTokenProvider,
  withinSkeleton
} from '@commercelayer/app-elements'
import type { Order, Shipment } from '@commercelayer/sdk'

interface Props {
  order: Order
}

const renderShipment = (shipment: Shipment): JSX.Element => {
  const {
    settings: { timezone }
  } = useTokenProvider()

  return (
    <ListItem
      key={shipment.id}
      icon={<Icon name='minus' background='gray' gap='large' />}
    >
      <div>
        <Text tag='div' weight='semibold'>
          #{shipment.number}
        </Text>
        <Text size='small' tag='div' variant='info' weight='medium'>
          {shipment.status} ·{' '}
          {formatDate({
            isoDate: shipment.updated_at,
            timezone,
            format: 'noYear'
          })}
        </Text>
      </div>
    </ListItem>
  )
}

export const OrderShipments = withinSkeleton<Props>(({ order }) => {
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
