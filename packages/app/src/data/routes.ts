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
  history: {
    path: '/history',
    makePath: (filters?: string) =>
      hasFilterQuery(filters) ? `/history/?${filters}` : `/history`
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
  }
}

function hasFilterQuery(filters?: string): filters is string {
  return Array.from(new URLSearchParams(filters)).length > 0
}
