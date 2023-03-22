import type { Order } from '@commercelayer/sdk'

// TODO: remove the following status types once SDK union have been updated
export type OrderStatus = NonNullable<Order['status']>
export type PaymentStatus =
  | NonNullable<Order['payment_status']>
  | 'partially_refunded'
  | 'free'
export type FulfillmentStatus =
  | NonNullable<Order['fulfillment_status']>
  | 'not_required'

const paymentStatusDictionary: Record<PaymentStatus, string> = {
  authorized: 'Authorized',
  paid: 'Paid',
  unpaid: 'Unpaid',
  free: 'Free',
  voided: 'Voided',
  refunded: 'Refunded',
  partially_refunded: 'Part. refunded'
}
export function getPaymentStatusName(paymentStatus?: string): string {
  return (
    paymentStatusDictionary[paymentStatus as PaymentStatus] ?? paymentStatus
  )
}

const fulfillmentStatusDictionary: Record<FulfillmentStatus, string> = {
  unfulfilled: 'Unfulfilled',
  in_progress: 'In progress',
  fulfilled: 'Fulfilled',
  not_required: 'Not required'
}
export function getFulfillmentStatusName(fulfillmentStatus?: string): string {
  return (
    fulfillmentStatusDictionary[fulfillmentStatus as FulfillmentStatus] ??
    fulfillmentStatus
  )
}
