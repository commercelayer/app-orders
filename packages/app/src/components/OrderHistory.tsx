import type { JSX } from 'preact/jsx-runtime'
import useSWR from 'swr'
import { ordersSearchFetcher } from '../metricsApi/fetcher'
import { PageLayout, useTokenProvider } from '@commercelayer/app-elements'

export function OrderHistory(): JSX.Element {
  const {
    settings: { accessToken, mode, organizationSlug }
  } = useTokenProvider()
  const {
    data: response,
    isLoading,
    error
  } = useSWR(
    {
      slug: organizationSlug,
      accessToken
    },
    ordersSearchFetcher
  )

  if (isLoading) {
    return <div>Loading</div>
  }

  if (error != null) {
    return <div>Error</div>
  }

  if (response === undefined) {
    return <div>No data</div>
  }

  return (
    <PageLayout title='Order history' mode={mode}>
      {response.data.map((order) => (
        <div key={order.id}>{order.id}</div>
      ))}
    </PageLayout>
  )
}
