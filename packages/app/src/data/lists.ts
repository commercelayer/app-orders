import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export type ListType =
  | 'awaitingApproval'
  | 'editing'
  | 'paymentToCapture'
  | 'fulfillmentInProgress'
  | 'archived'
  | 'pending'
  | 'history'

export const presets: Record<ListType, FormFullValues> = {
  awaitingApproval: {
    status_in: ['placed'],
    payment_status_in: ['authorized', 'free', 'paid'],
    archived: 'show',
    viewTitle: 'Awaiting approval'
  },
  editing: {
    status_in: ['editing'],
    payment_status_in: [],
    archived: 'hide',
    viewTitle: 'Editing'
  },
  paymentToCapture: {
    status_in: ['approved'],
    payment_status_in: ['authorized'],
    archived: 'show',
    viewTitle: 'Payment to capture'
  },
  fulfillmentInProgress: {
    status_in: ['approved'],
    fulfillment_status_in: ['in_progress'],
    archived: 'show',
    viewTitle: 'Fulfillment in progress'
  },
  history: {
    archived: 'hide',
    viewTitle: 'Order history'
  },
  pending: {
    status_in: ['pending'],
    archived: 'hide',
    viewTitle: 'Pending orders'
  },
  archived: {
    archived: 'only',
    viewTitle: 'Archived'
  }
}
