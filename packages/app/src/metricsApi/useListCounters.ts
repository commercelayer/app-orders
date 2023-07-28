import { presets, type ListType } from '#data/lists'
import { useTokenProvider } from '@commercelayer/app-elements'
import type { FormFullValues } from '@commercelayer/app-elements-hook-form/dist/filters/methods/types'
import castArray from 'lodash/castArray'
import useSWR, { type SWRResponse } from 'swr'
import { metricsApiFetcher } from './fetcher'
import { getLastYearIsoRange } from './utils'

const fetchOrderStats = async ({
  slug,
  accessToken,
  filters
}: {
  slug: string
  accessToken: string
  filters: object
}): Promise<VndApiResponse<MetricsApiOrdersStatsData>> =>
  await metricsApiFetcher<MetricsApiOrdersStatsData>({
    endpoint: '/orders/stats',
    slug,
    accessToken,
    body: {
      stats: {
        field: 'order.id',
        operator: 'value_count'
      },
      filter: {
        order: {
          ...getLastYearIsoRange(new Date()),
          date_field: 'updated_at',
          ...filters
        }
      }
    }
  })

const fetchAllCounters = async ({
  slug,
  accessToken
}: {
  slug: string
  accessToken: string
}): Promise<{
  awaitingApproval: number
  paymentToCapture: number
  fulfillmentInProgress: number
}> => {
  function fulfillResult(result?: PromiseSettledResult<number>): number {
    return result?.status === 'fulfilled' ? result.value : 0
  }

  // keep proper order since responses will be assigned for each list in the returned object
  const lists: ListType[] = [
    'awaitingApproval',
    'paymentToCapture',
    'fulfillmentInProgress'
  ]

  const allStats = await Promise.allSettled(
    lists.map(async (listType) => {
      return await fetchOrderStats({
        slug,
        accessToken,
        filters: fromFormValuesToMetricsApi(presets[listType])
      }).then((r) => r.data.value)
    })
  )

  return {
    awaitingApproval: fulfillResult(allStats[0]),
    paymentToCapture: fulfillResult(allStats[1]),
    fulfillmentInProgress: fulfillResult(allStats[2])
  }
}

export function useListCounters(): SWRResponse<{
  awaitingApproval: number
  paymentToCapture: number
  fulfillmentInProgress: number
}> {
  const {
    settings: { accessToken, organizationSlug }
  } = useTokenProvider()

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      accessToken
    },
    fetchAllCounters,
    {
      revalidateOnFocus: false
    }
  )

  return swrResponse
}

/**
 * Covert FilterFormValues in Metrics API filter object.
 * Partial implementation: it only supports status, payment_status and fulfillment_status
 */
function fromFormValuesToMetricsApi(formValues: FormFullValues): object {
  return {
    statuses:
      formValues.status_in != null && castArray(formValues.status_in).length > 0
        ? {
            in: formValues.status_in
          }
        : undefined,
    payment_statuses:
      formValues.payment_status_in != null &&
      castArray(formValues.payment_status_in).length > 0
        ? {
            in: formValues.payment_status_in
          }
        : undefined,
    fulfillment_statuses:
      formValues.fulfillment_status_in != null &&
      castArray(formValues.fulfillment_status_in).length > 0
        ? {
            in: formValues.fulfillment_status_in
          }
        : undefined
  }
}
