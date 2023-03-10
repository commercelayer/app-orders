import {
  Icon,
  Legend,
  ListItem,
  SkeletonTemplate,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { Order, Shipment } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'

interface Props {
  order: Order
}

const OrderShipment = ({ id }: { id?: string }): JSX.Element => {
  const [shipment, setShipment] = useState<Shipment>({
    type: 'shipments',
    id: '',
    created_at: '',
    updated_at: '',
    number: 'NY Store #19346523/S/001'
  })

  const isLoading = useMemo(() => shipment.id === '', [shipment])

  const { sdkClient } = useCoreSdkProvider()

  useEffect(
    function fetchShipment() {
      if (sdkClient != null && id !== undefined) {
        void sdkClient.shipments
          .retrieve(id, { include: ['shipping_method'] })
          .then((response) => {
            setShipment(response)
          })
      }
    },
    [sdkClient, id]
  )

  return (
    <SkeletonTemplate isLoading={isLoading}>
      <ListItem icon={<Icon name='minus' background='gray' gap='large' />}>
        <div>
          <Text tag='div' weight='semibold'>
            #{shipment.number}
          </Text>
          <Text size='small' tag='div' variant='info' weight='medium'>
            {shipment.status} · {shipment.shipping_method?.name?.toLowerCase()}
          </Text>
        </div>
      </ListItem>
    </SkeletonTemplate>
  )
}

export const OrderShipments = ({ order }: Props): JSX.Element => {
  return (
    <>
      <Legend title='Shipments' />
      {order.shipments !== undefined && order.shipments.length > 0 ? (
        order.shipments.map((shipment) => (
          <OrderShipment key={shipment.id} id={shipment.id} />
        ))
      ) : (
        <Spacer top='6' bottom='6'>
          {' '}
          This order doesn't have any shipments.
        </Spacer>
      )}
    </>
  )
}
