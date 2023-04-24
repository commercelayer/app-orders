import { filtersAdapters, computeFilterLabel } from './filters'
import { getActiveFilterCountFromUrl } from '#data/filters'

const {
  fromFormValuesToUrlQuery,
  fromFormValuesToSdk,
  fromUrlQueryToFormValues,
  fromUrlQueryToSdk,
  fromUrlQueryToUrlQuery
} = filtersAdapters

describe('fromFormValuesToUrlQuery', () => {
  test('should build proper query string alphabetically sorted', () => {
    expect(
      fromFormValuesToUrlQuery({
        status: ['cancelled'],
        market: ['dFDdasdgAN', 'KToVGDooQp'],
        paymentStatus: [],
        fulfillmentStatus: [],
        archived: 'hide'
      })
    ).toBe('archived=hide&market=dFDdasdgAN&market=KToVGDooQp&status=cancelled')
  })

  test('should handle time range with preset', () => {
    expect(
      fromFormValuesToUrlQuery({
        status: ['cancelled'],
        market: ['dFDdasdgAN', 'KToVGDooQp'],
        paymentStatus: [],
        fulfillmentStatus: [],
        archived: 'hide',
        timePreset: 'today'
      })
    ).toBe(
      'archived=hide&market=dFDdasdgAN&market=KToVGDooQp&status=cancelled&timePreset=today'
    )
  })

  test('should accept empty values', () => {
    expect(
      fromFormValuesToUrlQuery({
        market: [],
        status: [],
        paymentStatus: [],
        fulfillmentStatus: []
      })
    ).toBe('')
  })
})

describe('fromFormValuesToSdk', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime('2023-04-05T15:20:00.000Z')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should build proper sdk filter object', () => {
    expect(
      fromFormValuesToSdk({
        market: ['dFDdasdgAN', 'KToVGDooQp'],
        status: ['cancelled'],
        paymentStatus: ['paid', 'refunded'],
        fulfillmentStatus: ['fulfilled']
      })
    ).toStrictEqual({
      market_id_in: 'dFDdasdgAN,KToVGDooQp',
      status_in: 'cancelled',
      payment_status_in: 'paid,refunded',
      fulfillment_status_in: 'fulfilled',
      archived_at_null: true
    })
  })

  test('should return object to filter only archived orders', () => {
    expect(
      fromFormValuesToSdk({
        market: [],
        status: [],
        paymentStatus: [],
        fulfillmentStatus: [],
        archived: 'only'
      })
    ).toStrictEqual({
      archived_at_null: false,
      status_in: 'placed,approved,cancelled'
    })
  })

  test('should return default object on empty form values', () => {
    expect(
      fromFormValuesToSdk({
        market: [],
        status: [],
        paymentStatus: [],
        fulfillmentStatus: [],
        archived: undefined
      })
    ).toStrictEqual({
      archived_at_null: true,
      status_in: 'placed,approved,cancelled'
    })
  })

  test('should return handle time range preset', () => {
    expect(
      fromFormValuesToSdk({
        market: [],
        status: [],
        paymentStatus: [],
        fulfillmentStatus: [],
        archived: undefined,
        timePreset: 'today'
      })
    ).toStrictEqual({
      archived_at_null: true,
      status_in: 'placed,approved,cancelled',
      updated_at_gteq: '2023-04-05T00:00:00.000Z'
    })
  })

  test('should handle different timezone', () => {
    expect(
      fromFormValuesToSdk(
        {
          market: [],
          status: [],
          paymentStatus: [],
          fulfillmentStatus: [],
          archived: undefined,
          timePreset: 'today'
        },
        'Australia/Sydney'
      )
    ).toStrictEqual({
      archived_at_null: true,
      status_in: 'placed,approved,cancelled',
      updated_at_gteq: '2023-04-05T14:00:00.000Z'
    })
  })

  test('should return handle time range custom with timezone', () => {
    expect(
      fromFormValuesToSdk(
        {
          market: [],
          status: [],
          paymentStatus: [],
          fulfillmentStatus: [],
          archived: undefined,
          timePreset: 'custom',
          timeFrom: new Date('2023-02-01T16:35:00.000Z'),
          timeTo: new Date('2023-02-28T16:35:20.000Z')
        },
        'Europe/Rome'
      )
    ).toStrictEqual({
      archived_at_null: true,
      status_in: 'placed,approved,cancelled',
      updated_at_gteq: '2023-01-31T23:00:00.000Z',
      updated_at_lteq: '2023-02-28T22:59:59.999Z'
    })
  })
})

describe('fromUrlQueryToFormValues', () => {
  test('should build proper form value object', () => {
    expect(
      fromUrlQueryToFormValues(
        'market=dFDdasdgAN&market=KToVGDooQp&status=cancelled&text=foobar'
      )
    ).toStrictEqual({
      market: ['dFDdasdgAN', 'KToVGDooQp'],
      status: ['cancelled'],
      paymentStatus: [],
      fulfillmentStatus: [],
      archived: undefined,
      timePreset: undefined,
      timeFrom: undefined,
      timeTo: undefined,
      text: 'foobar'
    })
  })

  test('should build proper form value object when partially empty', () => {
    expect(fromUrlQueryToFormValues('market=&status=approved')).toStrictEqual({
      market: [],
      status: ['approved'],
      paymentStatus: [],
      fulfillmentStatus: [],
      archived: undefined,
      timePreset: undefined,
      timeFrom: undefined,
      timeTo: undefined,
      text: undefined
    })
  })

  test('should build proper form value object when empty', () => {
    expect(fromUrlQueryToFormValues('')).toStrictEqual({
      market: [],
      status: [],
      paymentStatus: [],
      fulfillmentStatus: [],
      archived: undefined,
      timePreset: undefined,
      timeFrom: undefined,
      timeTo: undefined,
      text: undefined
    })
  })

  test('should build proper form value object when data are wrong', () => {
    expect(
      fromUrlQueryToFormValues(
        'paymentStatus=invalid-value&status=draft&status=placed'
      )
    ).toStrictEqual({
      market: [],
      status: ['placed'],
      paymentStatus: [],
      fulfillmentStatus: [],
      archived: undefined,
      timePreset: undefined,
      timeFrom: undefined,
      timeTo: undefined,
      text: undefined
    })
  })
})

describe('fromUrlQueryToSdk', () => {
  test('should return a valid SDK filter object', () => {
    expect(
      fromUrlQueryToSdk('market=dlQbPhNNop&status=approved&status=cancelled')
    ).toStrictEqual({
      market_id_in: 'dlQbPhNNop',
      status_in: 'approved,cancelled',
      archived_at_null: true
    })
  })

  test('should ignore empty values', () => {
    expect(
      fromUrlQueryToSdk('market=&status=approved&status=cancelled')
    ).toStrictEqual({
      status_in: 'approved,cancelled',
      archived_at_null: true
    })
  })

  test('should return invalid status preset if not in url ', () => {
    expect(fromUrlQueryToSdk('paymentStatus=authorized')).toStrictEqual({
      status_in: 'placed,approved,cancelled',
      payment_status_in: 'authorized',
      archived_at_null: true
    })
  })

  test('should return invalid status preset when query string is empty or undefined', () => {
    expect(fromUrlQueryToSdk('')).toStrictEqual({
      status_in: 'placed,approved,cancelled',
      archived_at_null: true
    })
  })

  test('should ignore invalid values in query string', () => {
    expect(
      fromUrlQueryToSdk(
        'status=approved&paymentStatus=not-existing&status=draft'
      )
    ).toStrictEqual({
      status_in: 'approved',
      archived_at_null: true
    })
  })
})

describe('fromUrlQueryToUrlQuery', () => {
  test('should return same string', () => {
    expect(
      fromUrlQueryToUrlQuery('market=abc123&status=approved&status=cancelled')
    ).toBe('market=abc123&status=approved&status=cancelled')
  })

  test('should re-sort query params alphabetically same string', () => {
    expect(
      fromUrlQueryToUrlQuery('status=approved&market=abc123&status=cancelled')
    ).toBe('market=abc123&status=approved&status=cancelled')
  })

  test('should cleanup empty values', () => {
    expect(
      fromUrlQueryToUrlQuery('market=&status=approved&status=cancelled')
    ).toBe('status=approved&status=cancelled')
  })

  test('should ignore invalid values', () => {
    expect(
      fromUrlQueryToUrlQuery(
        'status=approved&paymentStatus=not-existing&status=draft'
      )
    ).toBe('status=approved')
  })
})

describe('computeFilterLabel', () => {
  test('should return valid computed label', () => {
    expect(
      computeFilterLabel({
        label: 'Markets',
        selectedCount: 0,
        totalCount: 4
      })
    ).toBe('Markets · 4')
  })

  test('should return selected count in computed label', () => {
    expect(
      computeFilterLabel({
        label: 'Payment status',
        selectedCount: 2,
        totalCount: 6
      })
    ).toBe('Payment status · 2 of 6')
  })
})

describe('getActiveFilterCountFromUrl', () => {
  const { location } = window
  beforeEach(function clearLocation() {
    delete (window as any).location
    ;(window as any).location = {
      ...location,
      search: ''
    }
  })
  afterEach(function resetLocation() {
    window.location = location
  })

  test('should read current URL query string', () => {
    window.location.search = '?market=abc123&status=approved&status=cancelled'
    expect(getActiveFilterCountFromUrl({})).toBe(2)
  })

  test('should return 0 when no filters are in query string', () => {
    window.location.search = ''
    expect(getActiveFilterCountFromUrl({})).toBe(0)
  })

  test('should ignore params that are not a filter', () => {
    window.location.search = '?status=approved&not-a-filter=yeah'
    expect(getActiveFilterCountFromUrl({})).toBe(1)
  })

  test('should ignore text filter', () => {
    window.location.search = '?status=approved&text=foobar'
    expect(getActiveFilterCountFromUrl({ includeText: false })).toBe(1)
  })

  test('should include text filter when asked', () => {
    window.location.search = '?status=approved&text=foobar'
    expect(getActiveFilterCountFromUrl({ includeText: true })).toBe(2)
  })
})
