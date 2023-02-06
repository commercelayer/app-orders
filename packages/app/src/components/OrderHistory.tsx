import type { JSX } from 'preact/jsx-runtime'
import useSWR from 'swr'
import { ordersSearchFetcher } from '../metricsApi/fetcher'
import { PageLayout } from '@commercelayer/app-elements'

const slug = 'demo-store'
const accessToken =
  'eyJhbGciOiJIUzUxMiJ9.eyJvcmdhbml6YXRpb24iOnsiaWQiOiJleW9aT0Z2UHBSIiwic2x1ZyI6ImRlbW8tc3RvcmUiLCJlbnRlcnByaXNlIjpmYWxzZX0sImFwcGxpY2F0aW9uIjp7ImlkIjoiYXBFbWFpblhLcCIsImtpbmQiOiJpbnRlZ3JhdGlvbiIsInB1YmxpYyI6ZmFsc2V9LCJ0ZXN0Ijp0cnVlLCJleHAiOjE2NzU3MDUxMzksInJhbmQiOjAuNDQ1MjU4MjIxNDMxNTU2Mn0.uLWTcIjuOeTgfrA3lyBTVaUku4pb6arVuoHBtajx0rHo_dcaBvTAWaZL4mxabfnBuYUF4OEFCFIsQhaKVY7w4w'

export function OrderHistory(): JSX.Element {
  const {
    data: response,
    isLoading,
    error
  } = useSWR(
    {
      slug,
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
    <PageLayout title='Order history'>
      {response.data.map((order) => (
        <div key={order.id}>{order.id}</div>
      ))}
    </PageLayout>
  )
}
