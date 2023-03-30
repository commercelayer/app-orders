import type { Order } from '@commercelayer/sdk'
import { type UITriggerAttributes } from './status'

// TODO: remove the following status types once SDK nullable=false have been updated
export type OrderStatus = NonNullable<Order['status']>
export type PaymentStatus = NonNullable<Order['payment_status']>
export type FulfillmentStatus = NonNullable<Order['fulfillment_status']>

const orderStatusDictionary: Record<OrderStatus, string> = {
  approved: 'Approved',
  cancelled: 'Cancelled',
  draft: 'Draft',
  pending: 'Pending',
  placed: 'Placed'
}
export function getOrderStatusName(status: Order['status']): string {
  return orderStatusDictionary[status as OrderStatus] ?? status
}

const paymentStatusDictionary: Record<PaymentStatus, string> = {
  authorized: 'Authorized',
  paid: 'Paid',
  unpaid: 'Unpaid',
  free: 'Free',
  voided: 'Voided',
  refunded: 'Refunded',
  partially_authorized: 'Part. authorized',
  partially_paid: 'Part. paid',
  partially_refunded: 'Part. refunded',
  partially_voided: 'Part. voided'
}
export function getPaymentStatusName(status: Order['payment_status']): string {
  return paymentStatusDictionary[status as PaymentStatus] ?? status
}

const fulfillmentStatusDictionary: Record<FulfillmentStatus, string> = {
  unfulfilled: 'Unfulfilled',
  in_progress: 'In progress',
  fulfilled: 'Fulfilled',
  not_required: 'Not required'
}
export function getFulfillmentStatusName(
  status: Order['fulfillment_status']
): string {
  return fulfillmentStatusDictionary[status as FulfillmentStatus] ?? status
}

const triggerAttributesDictionary: Record<UITriggerAttributes, string> = {
  _approve: 'Approve',
  _archive: 'Archive',
  _cancel: 'Cancel',
  _capture: 'Capture payment',
  _refund: 'Refund',
  _return: 'Return',
  _unarchive: 'Unarchive'
}
export function getTriggerAttributeName(
  triggerAttribute: UITriggerAttributes
): string {
  return triggerAttributesDictionary[triggerAttribute]
}
