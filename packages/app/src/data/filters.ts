import { type Order } from '@commercelayer/sdk'
import type { QueryFilter } from '@commercelayer/sdk/lib/cjs/query'
import { castArray, compact, isEmpty, omitBy, isBoolean } from 'lodash'
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
  archived?: 'only' | 'hide'
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
  const { market, status, paymentStatus, fulfillmentStatus, archived } =
    parsedQuery
  // parse a single filter key value to return
  // an array of valid values or an empty array
  const parseQueryStringValueAsArray = <TFiltrableValue extends string>(
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
    market: parseQueryStringValueAsArray(market),
    status: parseQueryStringValueAsArray(status, filtrableStatus),
    paymentStatus: parseQueryStringValueAsArray(
      paymentStatus,
      filtrablePaymentStatus
    ),
    fulfillmentStatus: parseQueryStringValueAsArray(
      fulfillmentStatus,
      filtrableFulfillmentStatus
    ),
    // `hide` is default value for archived
    archived: parseQueryStringValueAsArray(archived, ['only', 'hide'])[0]
  }
  return formValues
}

/**
 * Covert FilterFormValues in SDK filter object
 * @param formValues a valid FilterFormValues object
 * @returns an object of type QueryFilter to be used in the SDK stripping out empty or undefined values
 */
function fromFormValuesToSdk(formValues: FilterFormValues): QueryFilter {
  const { market, status, paymentStatus, fulfillmentStatus, archived } =
    formValues
  const sdkFilters: Partial<QueryFilter> = {
    market_id_in: castArray(market).join(','),
    status_in: status.join(','),
    payment_status_in: paymentStatus.join(','),
    fulfillment_status_in: fulfillmentStatus.join(','),
    archived_at_null: archived !== 'only'
  }

  // stripping out empty or undefined values
  const noEmpty = omitBy(
    sdkFilters,
    (v) => isEmpty(v) && !isBoolean(v)
  ) as QueryFilter

  // enforce default status_in when not set, to prevent listing draft or pending
  return isEmpty(noEmpty.status_in)
    ? {
        ...noEmpty,
        status_in: filtrableStatus.join(',')
      }
    : noEmpty
}

/**
 * Covert URL query string in SDK filter object
 * @param qs url query string
 * @returns an object of type QueryFilter to be used in the SDK
 * stripping out empty or undefined values and enforcing default status_in when empty
 */
function fromUrlQueryToSdk(qs: string): QueryFilter {
  return fromFormValuesToSdk(fromUrlQueryToFormValues(qs))
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
