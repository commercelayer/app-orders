import { appRoutes } from '#data/routes'
import { getPaymentStatusName } from '#data/status'
import {
  Icon,
  ListItem,
  Text,
  formatDate,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { IconProps } from '@commercelayer/app-elements/dist/ui/atoms/Icon'
import type { Order } from '@commercelayer/sdk'
import type { JSX } from 'preact/jsx-runtime'
import { Link } from 'wouter'

interface Props {
  order: Order
}

export function ListItemOrder({ order }: Props): JSX.Element {
  const {
    settings: { timezone }
  } = useTokenProvider()

  const statusInfo = getStatusInfo(order)
  return (
    <Link href={appRoutes.details.makePath(order.id)} key={order.id}>
      <ListItem
        icon={
          <Icon
            name={statusInfo.icon}
            background={statusInfo.color}
            gap='large'
          />
        }
      >
        <div>
          <Text tag='div' weight='semibold'>
            {order.market?.name} #{order.id}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {statusInfo.label} · {order.customer?.email} ·{' '}
            {formatDate({ isoDate: order.updated_at, timezone })}
          </Text>
          {statusInfo.task != null && (
            <Text tag='div' weight='bold' size='small' variant='warning'>
              {statusInfo.task}
            </Text>
          )}
        </div>
        <div>
          <Text tag='div' weight='semibold'>
            {order.formatted_total_amount}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {getPaymentStatusName(order.payment_status)}
          </Text>
        </div>
      </ListItem>
    </Link>
  )
}

// TODO: do we need this?
type UIStatus =
  | 'placed'
  | 'approved'
  | 'in_progress'
  | 'paid'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded'
  | 'part_refunded'
  | 'not_handled'

// TODO: missing combination to investigate
// placed:unpaid:unfulfilled
// placed:authorized:not_required
// placed:free:unfulfilled
// type Combination = `${OrderStatus}:${PaymentStatus}:${FulfillmentStatus}`
export function getStatusInfo(order: Order): {
  status: UIStatus
  label: string
  icon: IconProps['name']
  color: IconProps['background']
  task?: string
} {
  const status = order.status as OrderStatus
  const paymentStatus = order.payment_status as PaymentStatus
  const fulfillmentStatus = order.fulfillment_status as FulfillmentStatus

  const combinedStatus =
    `${status}:${paymentStatus}:${fulfillmentStatus}` as const

  switch (combinedStatus) {
    case 'placed:authorized:unfulfilled':
      return {
        status: 'placed',
        label: 'Placed',
        icon: 'arrowDown',
        color: 'orange',
        task: 'Awaiting approval'
      }

    case 'approved:authorized:unfulfilled':
      return {
        status: 'approved',
        label: 'Approved',
        icon: 'warning',
        color: 'orange',
        task: 'Payment to capture'
      }

    case 'approved:authorized:in_progress':
      return {
        status: 'in_progress',
        label: 'In progress (Manual)',
        icon: 'arrowClockwise',
        color: 'orange',
        task: 'Fulfillment in progress'
      }

    case 'approved:paid:in_progress':
      return {
        status: 'paid',
        label: 'In progress',
        icon: 'arrowClockwise',
        color: 'orange',
        task: 'Fulfillment in progress'
      }

    case 'approved:paid:fulfilled':
      return {
        status: 'fulfilled',
        label: 'Fulfilled',
        icon: 'check',
        color: 'green'
      }

    case 'cancelled:voided:unfulfilled':
      return {
        status: 'cancelled',
        label: 'Cancelled',
        icon: 'x',
        color: 'gray'
      }

    case 'cancelled:refunded:unfulfilled':
      return {
        status: 'refunded',
        label: 'Cancelled',
        icon: 'x',
        color: 'gray'
      }

    case 'cancelled:refunded:fulfilled':
      return {
        status: 'refunded',
        label: 'Cancelled',
        icon: 'x',
        color: 'gray'
      }

    case 'approved:partially_refunded:in_progress':
      return {
        status: 'part_refunded',
        label: 'In progress',
        icon: 'arrowClockwise',
        color: 'orange',
        task: 'Fulfillment in progress'
      }

    case 'approved:partially_refunded:fulfilled':
      return {
        status: 'part_refunded',
        label: 'Part. refunded',
        icon: 'check',
        color: 'green'
      }

    default:
      return {
        status: 'not_handled',
        label: `Not handled: (${combinedStatus})`,
        icon: 'warning',
        color: 'white'
      }
  }
}
