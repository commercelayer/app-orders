import { type Order } from '@commercelayer/sdk'
import type { QueryFilter } from '@commercelayer/sdk/lib/cjs/query'
import castArray from 'lodash/castArray'
import compact from 'lodash/compact'
import isBoolean from 'lodash/isBoolean'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
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
  archived?: 'only' | 'hide' | 'show'
  timePreset?: TimeRangePreset
  timeFrom?: Date | null
  timeTo?: Date | null
  text?: string
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
    timeTo,
    text
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
    archived: parseQueryStringValueAsArray(archived, [
      'only',
      'hide',
      'show'
    ])[0],
    timePreset: parseQueryStringValueAsArray(
      timePreset,
      filtrableTimeRangePreset
    )[0],
    timeFrom: parseQueryStringValueAsDate(timeFrom),
    timeTo: parseQueryStringValueAsDate(timeTo),
    text: parseQueryStringValueAsArray(text)[0]
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
    timeTo,
    text
  } = formValues

  const sdkFilters: Partial<QueryFilter> = {
    market_id_in: castArray(market).join(','),
    status_in: status.join(','),
    payment_status_in: paymentStatus.join(','),
    fulfillment_status_in: fulfillmentStatus.join(','),
    archived_at_null: archived === 'show' ? undefined : archived !== 'only',
    ...makeSdkFilterTime({ timePreset, timeFrom, timeTo, timezone }),
    ...(isEmpty(text)
      ? {}
      : { number_or_customer_email_or_billing_address_email_cont: text })
  }

  // stripping out empty or undefined values
  const noEmpty = omitBy(
    sdkFilters,
    (v) => isEmpty(v) && !isBoolean(v)
  ) as QueryFilter

  // enforce default status_in when not set, to prevent listing draft or pending
  return enforceDefaultStatusIn(noEmpty)
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
 * Covert FilterFormValues in Metrics API filter object.
 * Partial implementation: it only supports status, payment_status and fulfillment_status
 */
function fromFormValuesToMetricsApi(formValues: FilterFormValues): object {
  return {
    statuses:
      formValues.status != null && formValues.status.length > 0
        ? {
            in: formValues.status
          }
        : undefined,
    payment_statuses:
      formValues.paymentStatus != null && formValues.paymentStatus.length > 0
        ? {
            in: formValues.paymentStatus
          }
        : undefined,
    fulfillment_statuses:
      formValues.fulfillmentStatus != null &&
      formValues.fulfillmentStatus.length > 0
        ? {
            in: formValues.fulfillmentStatus
          }
        : undefined
  }
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
  fromFormValuesToMetricsApi,
  fromUrlQueryToFormValues,
  fromUrlQueryToSdk,
  fromUrlQueryToUrlQuery
}

/**
 * Be sure to have a status_in filter with all the default values
 * to prevent listing draft or pending orders
 */
export function enforceDefaultStatusIn(filters: QueryFilter): QueryFilter {
  return isEmpty(filters.status_in)
    ? {
        ...filters,
        status_in: filtrableStatus.join(',')
      }
    : filters
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
 * Get total count of active filter groups from URL query string.
 * @param includeText if `true` will count `text` filter as active filter group
 * @returns number of active filters
 * Example: if we have 3 markets selected, will still count as `1` active filter group
 * If we have 3 markets and 1 status selected, will count as `2`.
 */
export function getActiveFilterCountFromUrl({
  includeText = false
}: {
  includeText?: boolean
}): number {
  const toCount = filtersAdapters.fromUrlQueryToFormValues(location.search)
  if (!includeText) {
    delete toCount.text
  }
  // timeFrom and timeTo will be omitted because Date is consider as empty/non-iterable object
  const nonEmptyFilter = omitBy<FilterFormValues>(toCount, isEmpty)
  return Object.keys(nonEmptyFilter).length
}
