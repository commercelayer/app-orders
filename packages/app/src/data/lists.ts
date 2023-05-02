import { filtrableStatus, type FilterFormValues } from '#data/filters'

export type ListType =
  | 'awaitingApproval'
  | 'paymentToCapture'
  | 'fulfillmentInProgress'
  | 'archived'
  | 'history'

export const filtersByListType: Record<ListType, FilterFormValues> = {
  awaitingApproval: {
    market: [],
    status: ['placed'],
    fulfillmentStatus: [],
    paymentStatus: ['authorized', 'free'],
    archived: 'show'
  },
  paymentToCapture: {
    market: [],
    status: ['approved'],
    fulfillmentStatus: [],
    paymentStatus: ['authorized'],
    archived: 'show'
  },
  fulfillmentInProgress: {
    market: [],
    status: ['approved'],
    fulfillmentStatus: ['in_progress'],
    paymentStatus: [],
    archived: 'show'
  },
  archived: {
    market: [],
    status: filtrableStatus,
    fulfillmentStatus: [],
    paymentStatus: [],
    archived: 'only'
  },
  history: {
    market: [],
    status: filtrableStatus,
    fulfillmentStatus: [],
    paymentStatus: [],
    archived: 'hide'
  }
}
