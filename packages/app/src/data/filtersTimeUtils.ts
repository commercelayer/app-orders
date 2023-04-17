import {
  getIsoDateAtDayEdge,
  getIsoDateAtDaysBefore,
  formatDate
} from '@commercelayer/app-elements'
import type { FilterFormValues } from './filters'

export const makeSdkFilterTime = ({
  timePreset,
  timeFrom,
  timeTo,
  timezone
}: Pick<FilterFormValues, 'timePreset' | 'timeFrom' | 'timeTo'> & {
  timezone?: string
}): Record<string, string | undefined> => {
  const now = new Date().toISOString()

  switch (timePreset) {
    case 'today':
      return {
        updated_at_gteq: getIsoDateAtDaysBefore({
          isoString: now,
          days: 0,
          timezone
        })
      }

    case 'last7days':
      return {
        updated_at_gteq: getIsoDateAtDaysBefore({
          isoString: now,
          days: 7,
          timezone
        })
      }

    case 'last30days':
      return {
        updated_at_gteq: getIsoDateAtDaysBefore({
          isoString: now,
          days: 30,
          timezone
        })
      }

    case 'custom':
      return timeFrom != null && timeTo != null
        ? {
            updated_at_gteq: getIsoDateAtDayEdge({
              isoString: timeFrom.toISOString(),
              edge: 'startOfTheDay',
              timezone
            }),
            updated_at_lteq: getIsoDateAtDayEdge({
              isoString: timeTo.toISOString(),
              edge: 'endOfTheDay',
              timezone
            })
          }
        : {}

    case undefined:
      return {}
  }
}

export function getTimeRangeCustomLabel(
  timeFrom: Date,
  timeTo: Date,
  timezone = getDefaultBrowserTimezone()
): string {
  const formattedFrom = formatDate({ isoDate: timeFrom.toString(), timezone })
  const formattedTo = formatDate({ isoDate: timeTo.toString(), timezone })
  const formattedFromMonthFrom = formattedFrom.split(' ')[0] ?? ''
  const formattedToMonthFrom = formattedTo.split(' ')[0] ?? ''

  const dayFrom = timeFrom.getDate()
  const dayTo = timeTo.getDate()

  if (formattedFromMonthFrom === formattedToMonthFrom) {
    return `${dayFrom}-${dayTo} ${formattedFromMonthFrom}`
  }

  return `${formattedFrom} - ${formattedTo}`
}

function getDefaultBrowserTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}
