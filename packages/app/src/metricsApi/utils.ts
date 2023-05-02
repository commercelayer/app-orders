function removeMilliseconds(isoDate: string): string {
  return (isoDate.split('.')[0] ?? '') + 'Z'
}

/**
 * Returns one year date range ready to be used in  Metrics APIs request body.
 * It will remove milliseconds from the Date ISO strings.
 * Example:
 * ```
 * { date_from: '2022-04-24T13:45:00Z', date_to: '2023-04-24T13:45:00Z' }
 * ```
 */
export function getLastYearIsoRange(now: Date): {
  date_from: string
  date_to: string
} {
  const to = removeMilliseconds(now.toISOString())
  const nowYear = now.getFullYear()
  const from = to.replace(`${nowYear}`, (nowYear - 1).toString())
  return {
    date_from: from,
    date_to: to
  }
}
