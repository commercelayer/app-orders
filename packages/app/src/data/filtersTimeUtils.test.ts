import { makeSdkFilterTime } from './filtersTimeUtils'

describe('makeSdkFilterTime', () => {
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime('2023-04-05T15:20:00.000Z')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('should ignore from and to when preset is not custom', () => {
    expect(
      makeSdkFilterTime({
        timePreset: 'last7days',
        timeFrom: new Date(),
        timeTo: new Date(),
        timezone: 'Europe/Rome'
      })
    ).toStrictEqual({
      updated_at_gteq: '2023-03-28T22:00:00.000Z'
    })
  })

  test('should return a range filter', () => {
    expect(
      makeSdkFilterTime({
        timePreset: 'custom',
        timeFrom: new Date(),
        timeTo: new Date(),
        timezone: 'Europe/Athens'
      })
    ).toStrictEqual({
      updated_at_gteq: '2023-04-04T21:00:00.000Z',
      updated_at_lteq: '2023-04-05T20:59:59.999Z'
    })
  })

  test('should return no filter when preset is custom but range is missing', () => {
    expect(
      makeSdkFilterTime({
        timePreset: 'custom',
        timeFrom: new Date()
      })
    ).toStrictEqual({})

    expect(
      makeSdkFilterTime({
        timePreset: 'custom',
        timeTo: new Date()
      })
    ).toStrictEqual({})

    expect(
      makeSdkFilterTime({
        timePreset: 'custom',
        // @ts-expect-error - testing invalid date
        timeTo: 'abcdef'
      })
    ).toStrictEqual({})
  })
})
