// Object to be used as source of truth to handel application routes
// each page should correspond to a key and each key should have
// a `path` property to be used as patter matching in <Route path> component
// and `makePath` method to be used to generate the path used in navigation and links
export const appRoutes = {
  home: {
    path: '/',
    makePath: () => '/'
  },
  filters: {
    path: '/filters',
    makePath: (filters = new URLSearchParams()) =>
      hasFilterQuery(filters) ? `/filters/?${filters.toString()}` : `/filters`
  },
  details: {
    path: '/details/:orderId',
    makePath: (orderId: string) => `/details/${orderId}`
  }
}

function hasFilterQuery(filters: URLSearchParams): boolean {
  return Array.from(filters).length > 0
}
