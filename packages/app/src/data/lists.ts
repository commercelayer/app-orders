import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/Filters/types'

export type ListType =
  | 'awaitingApproval'
  | 'paymentToCapture'
  | 'fulfillmentInProgress'
  | 'archived'
  | 'pending'
  | 'history'

export const presets: Record<ListType, FormFullValues> = {
  awaitingApproval: {
    status_in: ['placed'],
    payment_status_in: ['authorized', 'free', 'paid'],
    archived_at_null: 'show',
    viewTitle: 'Awaiting approval'
  },
  paymentToCapture: {
    status_in: ['approved'],
    payment_status_in: ['authorized'],
    archived_at_null: 'show',
    viewTitle: 'Payment to capture'
  },
  fulfillmentInProgress: {
    status_in: ['approved'],
    fulfillment_status_in: ['in_progress'],
    archived_at_null: 'show',
    viewTitle: 'Fulfillment in progress'
  },
  history: {
    archived_at_null: 'hide',
    viewTitle: 'Order history'
  },
  pending: {
    status_in: ['pending'],
    archived_at_null: 'hide',
    viewTitle: 'Pending orders'
  },
  archived: {
    archived_at_null: 'only',
    viewTitle: 'Archived'
  }
}
