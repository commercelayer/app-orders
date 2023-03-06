type OrderStatus = 'placed' | 'approved' | 'cancelled'

type PaymentStatus =
  | 'authorized'
  | 'paid'
  | 'voided'
  | 'refunded'
  | 'partially_refunded'

type FulfillmentStatus = 'unfulfilled' | 'in_progress' | 'fulfilled'
