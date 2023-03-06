const paymentStatusDictionary: Record<PaymentStatus, string> = {
  authorized: 'Authorized',
  paid: 'Paid',
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
  fulfilled: 'Fulfilled'
}
export function getFulfillmentStatusName(fulfillmentStatus?: string): string {
  return (
    fulfillmentStatusDictionary[fulfillmentStatus as FulfillmentStatus] ??
    fulfillmentStatus
  )
}
