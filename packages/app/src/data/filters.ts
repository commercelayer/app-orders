import { type Order } from '@commercelayer/sdk'
import type { QueryFilter } from '@commercelayer/sdk/lib/cjs/query'
import { castArray, compact, isBoolean, isEmpty, omitBy } from 'lodash'
import queryString, { type ParsedQuery } from 'query-string'
import { makeSdkFilterTime } from './filtersTimeUtils'

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

export const filtrableTimeRangePreset = [
  'today',
  'last7days',
  'last30days',
  'custom'
] as const
export type TimeRangePreset = (typeof filtrableTimeRangePreset)[number]

export interface FilterFormValues {
  market: string[]
  status: typeof filtrableStatus
  paymentStatus: typeof filtrablePaymentStatus
  fulfillmentStatus: typeof filtrableFulfillmentStatus
  archived?: 'only' | 'hide'
  timePreset?: TimeRangePreset
  timeFrom?: Date | null
  timeTo?: Date | null
}

/**
 * Covert FilterFormValues in url query string
 * @param formValues a valid FilterFormValues object
 * @returns a string ready to be used in URL
 */
function fromFormValuesToUrlQuery(formValues: FilterFormValues): string {
  return queryString.stringify(
    omitBy(
      {
        ...formValues,
        timeFrom: formValues.timeFrom?.toISOString(),
        timeTo: formValues.timeTo?.toISOString()
      },
      isEmpty
    )
  )
}

/**
 * Covert query string in filters form values
 * @param qs url query string
 * @returns an object containing FilterFormValues
 */
function fromUrlQueryToFormValues(qs: string): FilterFormValues {
  const parsedQuery = queryString.parse(qs)
  const {
    market,
    status,
    paymentStatus,
    fulfillmentStatus,
    archived,
    timePreset,
    timeFrom,
    timeTo
  } = parsedQuery

  // parse a single filter key value to return
  // an array of valid values or an empty array
  const parseQueryStringValueAsArray = <TFiltrableValue extends string>(
    value?: ParsedQuery[string],
    acceptedValues?: Readonly<TFiltrableValue[]>
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

  const parseQueryStringValueAsDate = (value: unknown): Date | undefined => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/
    if (typeof value !== 'string' || !isoRegex.test(value)) {
      return undefined
    }
    try {
      return new Date(value)
    } catch {
      return undefined
    }
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
    archived: parseQueryStringValueAsArray(archived, ['only', 'hide'])[0],
    timePreset: parseQueryStringValueAsArray(
      timePreset,
      filtrableTimeRangePreset
    )[0],
    timeFrom: parseQueryStringValueAsDate(timeFrom),
    timeTo: parseQueryStringValueAsDate(timeTo)
  }

  return formValues
}

/**
 * Covert FilterFormValues in SDK filter object
 * @param formValues a valid FilterFormValues object
 * @returns an object of type QueryFilter to be used in the SDK stripping out empty or undefined values
 */
function fromFormValuesToSdk(
  formValues: FilterFormValues,
  timezone?: string
): QueryFilter {
  const {
    market,
    status,
    paymentStatus,
    fulfillmentStatus,
    archived,
    timePreset,
    timeFrom,
    timeTo
  } = formValues

  const sdkFilters: Partial<QueryFilter> = {
    market_id_in: castArray(market).join(','),
    status_in: status.join(','),
    payment_status_in: paymentStatus.join(','),
    fulfillment_status_in: fulfillmentStatus.join(','),
    archived_at_null: archived !== 'only',
    ...makeSdkFilterTime({ timePreset, timeFrom, timeTo, timezone })
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
function fromUrlQueryToSdk(qs: string, timezone?: string): QueryFilter {
  return fromFormValuesToSdk(fromUrlQueryToFormValues(qs), timezone)
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

/**
 * Get total count of active filter groups.
 * Example: if we have 3 markets selected, will still count as `1` active filter group
 * If we have 3 markets and 1 status selected, will count as `2`.
 * @returns number of active filters
 */
export function getActiveFilterCountFromUrl(): number {
  // timeFrom and timeTo will be omitted because Date is consider as empty/non-iterable object
  const nonEmptyFilter = omitBy<FilterFormValues>(
    filtersAdapters.fromUrlQueryToFormValues(location.search),
    isEmpty
  )
  return Object.keys(nonEmptyFilter).length
}
