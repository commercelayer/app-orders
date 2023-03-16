import {
  Badge,
  Spacer,
  Stack,
  Text,
  withinSkeleton
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const OrderSteps = withinSkeleton<Props>(({ order }): JSX.Element => {
  return (
    <Stack>
      <div>
        <Spacer bottom='2'>
          <Text size='small' tag='div' variant='info' weight='semibold'>
            Order
          </Text>
        </Spacer>
        {order.status !== undefined && (
          <Badge
            label={order.status.toUpperCase()}
            variant={'secondary' ?? 'success-solid'}
          />
        )}
      </div>
      <div>
        <Spacer bottom='2'>
          <Text size='small' tag='div' variant='info' weight='semibold'>
            Payment
          </Text>
        </Spacer>
        {order.payment_status !== undefined && (
          <Badge
            label={order.payment_status.toUpperCase()}
            variant={'secondary' ?? 'success-solid'}
          />
        )}
      </div>
      <div>
        <Spacer bottom='2'>
          <Text size='small' tag='div' variant='info' weight='semibold'>
            Fulfillment
          </Text>
        </Spacer>
        {order.fulfillment_status !== undefined && (
          <Badge
            label={order.fulfillment_status.toUpperCase()}
            variant={'secondary' ?? 'success-solid'}
          />
        )}
      </div>
    </Stack>
  )
})
