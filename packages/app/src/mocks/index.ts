import type { Resource } from '@commercelayer/sdk/lib/cjs/resource'

export * from './resources/customers'
export * from './resources/line_items'
export * from './resources/markets'
export * from './resources/orders'
export * from './resources/shipments'

export const isMock = (resource: Resource): boolean => {
  return resource.id.startsWith('fake-')
}

export const repeat = <R>(n: number, resource: () => R): R[] => {
  return Array(n)
    .fill(0)
    .map(() => resource())
}
