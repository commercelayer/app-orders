import {
  getFulfillmentStatusName,
  getOrderStatusName,
  getPaymentStatusName
} from '#data/dictionaries'
import {
  Badge,
  Spacer,
  Stack,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { BadgeVariant } from '@commercelayer/app-elements/dist/ui/atoms/Badge'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

function getOrderStatusBadgeVariant(status: Order['status']): BadgeVariant {
  switch (status) {
    case 'approved':
      return 'success-solid'
    case 'cancelled':
    case 'draft':
    case 'pending':
      return 'secondary'
    case 'placed':
      return 'warning-solid'
  }
}

function getPaymentStatusBadgeVariant(
  status: Order['payment_status']
): BadgeVariant {
  switch (status) {
    case 'paid':
    case 'free':
      return 'success-solid'
    case 'refunded':
    case 'voided':
    case 'partially_refunded':
    case 'partially_voided':
      return 'secondary'
    case 'authorized':
    case 'partially_authorized':
      return 'warning-solid'
    case 'unpaid':
    case 'partially_paid':
      return 'danger-solid'
  }
}

function getFulfillmentStatusBadgeVariant(
  status: Order['fulfillment_status']
): BadgeVariant {
  switch (status) {
    case 'fulfilled':
      return 'success-solid'
    case 'unfulfilled':
    case 'not_required':
      return 'secondary'
    case 'in_progress':
      return 'warning-solid'
  }
}

export const OrderSteps = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
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
              label={getOrderStatusName(order.status).toUpperCase()}
              variant={getOrderStatusBadgeVariant(order.status)}
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
              label={getPaymentStatusName(order.payment_status).toUpperCase()}
              variant={getPaymentStatusBadgeVariant(order.payment_status)}
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
              label={getFulfillmentStatusName(
                order.fulfillment_status
              ).toUpperCase()}
              variant={getFulfillmentStatusBadgeVariant(
                order.fulfillment_status
              )}
            />
          )}
        </div>
      </Stack>
    )
  }
)
