import { presets, type ListType } from '#data/lists'
import {
  getLastYearIsoRange,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import castArray from 'lodash/castArray'
import useSWR, { type SWRResponse } from 'swr'
import { metricsApiFetcher } from './fetcher'

const fetchOrderStats = async ({
  slug,
  accessToken,
  filters,
  domain
}: {
  slug: string
  accessToken: string
  filters: object
  domain: string
}): Promise<VndApiResponse<MetricsApiOrdersStatsData>> =>
  await metricsApiFetcher<MetricsApiOrdersStatsData>({
    endpoint: '/orders/stats',
    domain,
    slug,
    accessToken,
    body: {
      stats: {
        field: 'order.id',
        operator: 'value_count'
      },
      filter: {
        order: {
          ...getLastYearIsoRange({
            now: new Date(),
            showMilliseconds: false
          }),
          date_field: 'updated_at',
          ...filters
        }
      }
    }
  })

const fetchAllCounters = async ({
  domain,
  slug,
  accessToken
}: {
  domain: string
  slug: string
  accessToken: string
}): Promise<{
  awaitingApproval: number
  editing: number
  paymentToCapture: number
  fulfillmentInProgress: number
}> => {
  function fulfillResult(result?: PromiseSettledResult<number>): number {
    return result?.status === 'fulfilled' ? result.value : 0
  }

  // keep proper order since responses will be assigned for each list in the returned object
  const lists: ListType[] = [
    'awaitingApproval',
    'editing',
    'paymentToCapture',
    'fulfillmentInProgress'
  ]

  const allStats = await Promise.allSettled(
    lists.map(async (listType) => {
      return await fetchOrderStats({
        domain,
        slug,
        accessToken,
        filters: fromFormValuesToMetricsApi(presets[listType])
      }).then((r) => r.data.value)
    })
  )

  return {
    awaitingApproval: fulfillResult(allStats[0]),
    editing: fulfillResult(allStats[1]),
    paymentToCapture: fulfillResult(allStats[2]),
    fulfillmentInProgress: fulfillResult(allStats[3])
  }
}

export function useListCounters(): SWRResponse<{
  awaitingApproval: number
  editing: number
  paymentToCapture: number
  fulfillmentInProgress: number
}> {
  const {
    settings: { accessToken, organizationSlug, domain }
  } = useTokenProvider()

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      domain,
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
