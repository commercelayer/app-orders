import { isMock, makeShipment } from '#mocks'
import {
  Icon,
  Legend,
  ListItem,
  SkeletonTemplate,
  Spacer,
  Text,
  useCoreSdkProvider,
  withinSkeleton
} from '@commercelayer/app-elements'
import type { Order, Shipment } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  order: Order
}

const OrderShipment = withinSkeleton<{ id?: string }>(
  ({ isLoading, id }): JSX.Element => {
    const [shipment, setShipment] = useState<Shipment>(makeShipment())

    const isShipmentLoading = useMemo(() => isMock(shipment), [shipment, id])

    const { sdkClient } = useCoreSdkProvider()

    useEffect(
      function fetchShipment() {
        if (isLoading === false && sdkClient != null && id !== undefined) {
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
      <SkeletonTemplate isLoading={isShipmentLoading} delayMs={0}>
        <ListItem icon={<Icon name='minus' background='gray' gap='large' />}>
          <div>
            <Text tag='div' weight='semibold'>
              #{shipment.number}
            </Text>
            <Text size='small' tag='div' variant='info' weight='medium'>
              {shipment.status} ·{' '}
              {shipment.shipping_method?.name?.toLowerCase()}
            </Text>
          </div>
        </ListItem>
      </SkeletonTemplate>
    )
  }
)

export const OrderShipments = withinSkeleton<Props>(({ order }) => {
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
})
