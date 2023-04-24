import { getLastYearIsoRange } from './utils'
describe('getLastYearIsoRange', () => {
  test('should return last year range', () => {
    const now = new Date('2023-04-24T13:45:00.000Z')
    const result = getLastYearIsoRange(now)
    expect(result).toEqual({
      date_from: '2022-04-24T13:45:00Z',
      date_to: '2023-04-24T13:45:00Z'
    })
  })
})
