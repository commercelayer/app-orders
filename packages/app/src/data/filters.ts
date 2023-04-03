import { type Order } from '@commercelayer/sdk'
import type { QueryFilter } from '@commercelayer/sdk/lib/cjs/query'
import castArray from 'lodash/castArray'
import compact from 'lodash/compact'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
import queryString, { type ParsedQuery } from 'query-string'

export const filtrableStatus: Array<Order['status']> = [
  'placed',
  'approved',
  'cancelled'
]

export const filtrablePaymentStatus: Array<Order['payment_status']> = [
  'authorized',
  'paid',
  'voided',
  'refunded',
  'free',
  'unpaid'
]

export const filtrableFulfillmentStatus: Array<Order['fulfillment_status']> = [
  'unfulfilled',
  'in_progress',
  'fulfilled',
  'not_required'
]

export interface FilterFormValues {
  market: string[]
  status: typeof filtrableStatus
  paymentStatus: typeof filtrablePaymentStatus
  fulfillmentStatus: typeof filtrableFulfillmentStatus
}

/**
 * Covert FilterFormValues in url query string
 * @param formValues a valid FilterFormValues object
 * @returns a string ready to be used in URL
 */
function fromFormValuesToUrlQuery(formValues: FilterFormValues): string {
  return queryString.stringify(formValues)
}

/**
 * Covert query string in filters form values
 * @param qs url query string
 * @returns an object containing FilterFormValues
 */
function fromUrlQueryToFormValues(qs: string): FilterFormValues {
  const parsedQuery = queryString.parse(qs)
  const { market, status, paymentStatus, fulfillmentStatus } = parsedQuery

  // parse a single filter key value to return
  // an array of valid values or an empty array
  const parseQueryStringValue = <TFiltrableValue extends string>(
    value?: ParsedQuery[string],
    acceptedValues?: TFiltrableValue[]
  ): TFiltrableValue[] => {
    if (value == null) {
      return []
    }
    const cleanValue = compact(castArray(value) as TFiltrableValue[])
    if (acceptedValues != null) {
      return cleanValue.filter((v) => acceptedValues.includes(v))
    }
    return cleanValue
  }

  const formValues: FilterFormValues = {
    market: parseQueryStringValue(market),
    status: parseQueryStringValue(status, filtrableStatus),
    paymentStatus: parseQueryStringValue(paymentStatus, filtrablePaymentStatus),
    fulfillmentStatus: parseQueryStringValue(
      fulfillmentStatus,
      filtrableFulfillmentStatus
    )
  }
  return formValues
}

/**
 * Covert FilterFormValues in SDK filter object
 * @param formValues a valid FilterFormValues object
 * @returns an object of type QueryFilter to be used in the SDK stripping out empty or undefined values
 */
function fromFormValuesToSdk(formValues: FilterFormValues): QueryFilter {
  const { market, status, paymentStatus, fulfillmentStatus } = formValues
  const sdkFilters: Partial<QueryFilter> = {
    market_id_in: castArray(market).join(','),
    status_in: status.join(','),
    payment_status_in: paymentStatus.join(','),
    fulfillment_status_in: fulfillmentStatus.join(',')
  }
  return omitBy(sdkFilters, isEmpty) as QueryFilter
}

/**
 * Covert URL query string in SDK filter object
 * @param qs url query string
 * @returns an object of type QueryFilter to be used in the SDK
 * stripping out empty or undefined values and enforcing default status_in when empty
 */
function fromUrlQueryToSdk(qs: string): QueryFilter {
  const sdkFilters = fromFormValuesToSdk(fromUrlQueryToFormValues(qs))
  return isEmpty(sdkFilters.status_in)
    ? {
        ...sdkFilters,
        status_in: filtrableStatus.join(',')
      }
    : sdkFilters
}

/**
 * Parse current URL query string to return a new query string that contains only valid form values
 * @param qs url query string
 * @returns an object of type QueryFilter to be used in the SDK stripping out empty or undefined values
 */
function fromUrlQueryToUrlQuery(qs: string): string {
  return fromFormValuesToUrlQuery(fromUrlQueryToFormValues(qs))
}

/**
 * Contains all methods to transform and parse filter values in different formats
 * since filters can be expressed as
 * - App form UI state (FilterFormValues)
 * - URL query string (string)
 * - SDK filter object (QueryFilter)
 */
export const filtersAdapters = {
  fromFormValuesToUrlQuery,
  fromFormValuesToSdk,
  fromUrlQueryToFormValues,
  fromUrlQueryToSdk,
  fromUrlQueryToUrlQuery
}

/**
 * Show the filter label with the counter for selected options
 * or just the total of available options when nothing is selected
 * @param options
 * @returns string
 *
 * @example
 * "Markets · 2 of 4"
 * "Markets · 4"
 */
export function computeFilterLabel({
  label,
  totalCount,
  selectedCount
}: {
  label: string
  totalCount: number
  selectedCount: number
}): string {
  const counter =
    selectedCount > 0 ? `${selectedCount} of ${totalCount}` : totalCount
  return `${label} · ${counter}`
}
