import { filtersAdapters, computeFilterLabel } from './filters'

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
        fulfillmentStatus: []
      })
    ).toBe('market=dFDdasdgAN&market=KToVGDooQp&status=cancelled')
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
      fulfillment_status_in: 'fulfilled'
    })
  })

  test('should return empty object on empty form values', () => {
    expect(
      fromFormValuesToSdk({
        market: [],
        status: [],
        paymentStatus: [],
        fulfillmentStatus: []
      })
    ).toStrictEqual({})
  })
})

describe('fromUrlQueryToFormValues', () => {
  test('should build proper form value object', () => {
    expect(
      fromUrlQueryToFormValues(
        'market=dFDdasdgAN&market=KToVGDooQp&status=cancelled'
      )
    ).toStrictEqual({
      market: ['dFDdasdgAN', 'KToVGDooQp'],
      status: ['cancelled'],
      paymentStatus: [],
      fulfillmentStatus: []
    })
  })

  test('should build proper form value object when partially empty', () => {
    expect(fromUrlQueryToFormValues('market=&status=approved')).toStrictEqual({
      market: [],
      status: ['approved'],
      paymentStatus: [],
      fulfillmentStatus: []
    })
  })

  test('should build proper form value object when empty', () => {
    expect(fromUrlQueryToFormValues('')).toStrictEqual({
      market: [],
      status: [],
      paymentStatus: [],
      fulfillmentStatus: []
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
      fulfillmentStatus: []
    })
  })
})

describe('fromUrlQueryToSdk', () => {
  test('should return a valid SDK filter object', () => {
    expect(
      fromUrlQueryToSdk('market=dlQbPhNNop&status=approved&status=cancelled')
    ).toStrictEqual({
      market_id_in: 'dlQbPhNNop',
      status_in: 'approved,cancelled'
    })
  })

  test('should ignore empty values', () => {
    expect(
      fromUrlQueryToSdk('market=&status=approved&status=cancelled')
    ).toStrictEqual({
      status_in: 'approved,cancelled'
    })
  })

  test('should return invalid status preset if not in url ', () => {
    expect(fromUrlQueryToSdk('paymentStatus=authorized')).toStrictEqual({
      status_in: 'placed,approved,cancelled',
      payment_status_in: 'authorized'
    })
  })

  test('should return invalid status preset when query string is empty or undefined', () => {
    expect(fromUrlQueryToSdk('')).toStrictEqual({
      status_in: 'placed,approved,cancelled'
    })
  })

  test('should ignore invalid values in query string', () => {
    expect(
      fromUrlQueryToSdk(
        'status=approved&paymentStatus=not-existing&status=draft'
      )
    ).toStrictEqual({
      status_in: 'approved'
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
