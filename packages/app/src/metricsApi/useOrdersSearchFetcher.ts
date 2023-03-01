import useSWR, { SWRResponse } from 'swr'
import { ordersSearchFetcher } from './fetcher'
import { useTokenProvider } from '@commercelayer/app-elements'

export function useOrdersSearchFetcher(): SWRResponse<
  VndApiResponse<MetricsApiOrdersSearchData>
> {
  const {
    settings: { accessToken, organizationSlug }
  } = useTokenProvider()

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      accessToken
    },
    ordersSearchFetcher
  )

  return swrResponse
}
