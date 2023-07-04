import type { FormFullValues } from '@commercelayer/app-elements-hook-form/dist/filters/methods/types'

export type ListType =
  | 'awaitingApproval'
  | 'paymentToCapture'
  | 'fulfillmentInProgress'
  | 'archived'
  | 'history'

export const presets: Record<ListType, FormFullValues> = {
  awaitingApproval: {
    status_in: ['placed'],
    payment_status_in: ['authorized', 'free'],
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
  archived: {
    archived_at_null: 'only',
    viewTitle: 'Archived'
  }
}
