import type { IconProps } from '@commercelayer/app-elements/dist/ui/atoms/Icon'
import type { Order } from '@commercelayer/sdk'

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

interface OrderDisplayStatus {
  status: UIStatus
  label: string
  icon: IconProps['name']
  color: IconProps['background']
  task?: string
}

export function getDisplayStatus(order: Order): OrderDisplayStatus {
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

    case 'placed:free:unfulfilled':
      return {
        status: 'placed',
        label: 'Placed',
        icon: 'arrowDown',
        color: 'orange',
        task: 'Awaiting approval'
      }

    case 'placed:unpaid:unfulfilled':
      return {
        status: 'placed',
        label: 'Placed',
        icon: 'arrowDown',
        color: 'orange',
        task: 'Awaiting Payment'
      }

    case 'approved:authorized:unfulfilled':
      return {
        status: 'approved',
        label: 'Approved',
        icon: 'warning',
        color: 'orange',
        task: 'Payment to capture'
      }

    case 'placed:authorized:not_required':
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

    case 'placed:paid:not_required':
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
