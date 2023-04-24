interface MetricsApiFetcherParams {
  endpoint: string
  slug: string
  accessToken: string
  body: Record<string, any>
}

export const metricsApiFetcher = async <Data>({
  endpoint,
  slug,
  accessToken,
  body
}: MetricsApiFetcherParams): Promise<VndApiResponse<Data>> => {
  const url = `https://${slug}.${window.clAppConfig.domain}/metrics${endpoint}`
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
