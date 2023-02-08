interface MetricsApiFetcherParams {
  endpoint: string
  slug: string
  accessToken: string
  body: Record<string, any>
}

const metricsApiFetcher = async <Data>({
  endpoint,
  slug,
  accessToken,
  body
}: MetricsApiFetcherParams): Promise<VndApiResponse<Data>> => {
  const url = `https://${slug}.${window.config.domain}/metrics${endpoint}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.api.v1+json',
      'content-type': 'application/vnd.api+json',
      authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  })
  return await response.json()
}

export const ordersSearchFetcher = async ({
  slug,
  accessToken
}: {
  slug: string
  accessToken: string
}): Promise<VndApiResponse<MetricsApiOrdersSearchData>> =>
  await metricsApiFetcher<MetricsApiOrdersSearchData>({
    endpoint: '/orders/search',
    slug,
    accessToken,
    body: {
      search: {
        fields: [
          'order.id',
          'order.created_at',
          'order.total_amount',
          'customer.email',
          'market.id',
          'market.name',
          'order.status',
          'order.payment_status',
          'order.fulfillment_status'
        ],
        limit: 100
      }
    }
  })
