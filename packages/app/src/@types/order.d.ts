type OrderStatus = 'placed' | 'approved' | 'cancelled'

type PaymentStatus =
  | 'authorized'
  | 'unpaid'
  | 'paid'
  | 'voided'
  | 'refunded'
  | 'partially_refunded'
  | 'free'

type FulfillmentStatus =
  | 'unfulfilled'
  | 'in_progress'
  | 'fulfilled'
  | 'not_required'
