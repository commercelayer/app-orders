export type AppRoute = keyof typeof appRoutes

// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: {
    path: '/',
    makePath: () => '/'
  },
  listHistory: {
    path: '/history',
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/history/?${filters}` : `/history`
  },
  listArchived: {
    path: '/archived',
    makePath: () => '/archived'
  },
  listAwaitingApproval: {
    path: '/awaiting-approval',
    makePath: () => '/awaiting-approval'
  },
  listPaymentToCapture: {
    path: '/payment-to-capture',
    makePath: () => '/payment-to-capture'
  },
  listFulfillmentInProgress: {
    path: '/fulfillment-in-progress',
    makePath: () => '/fulfillment-in-progress'
  },
  filters: {
    path: '/filters',
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/filters/?${filters}` : `/filters`
  },
  filtersTimeRange: {
    path: '/filters/timerange',
    makePath: (filters?: string) =>
      hasFilterQuery(filters)
        ? `/filters/timerange/?${filters}`
        : `/filters/timerange`
  },
  details: {
    path: '/details/:orderId',
    makePath: (orderId: string) => `/details/${orderId}`
  },
  editAddress: {
    path: '/details/:orderId/edit-address/:addressId',
    makePath: (orderId: string, addressId: string) =>
      `/details/${orderId}/edit-address/${addressId}`
  },
  refund: {
    path: '/details/:orderId/refund',
    makePath: (orderId: string) => `/details/${orderId}/refund`
  }
}

function hasFilterQuery(filters?: string): filters is string {
  return Array.from(new URLSearchParams(filters)).length > 0
}
