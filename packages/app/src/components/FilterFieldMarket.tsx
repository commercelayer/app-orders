import { computeFilterLabel, type FilterFormValues } from '#data/filters'
import { makeMarket, repeat } from '#mocks'
import {
  Avatar,
  Card,
  InputCheckbox,
  SkeletonTemplate,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import { InputSelect } from '@commercelayer/app-elements-hook-form'
import type { CommerceLayerClient, Market } from '@commercelayer/sdk'
import type { ListResponse } from '@commercelayer/sdk/lib/cjs/resource'
import { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

export function FilterFieldMarket(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const [fetchedMarket, setFetchedMarket] = useState<
    ListResponse<Market> | undefined
  >()

  useEffect(() => {
    if (sdkClient != null) {
      void fetchMarkets({
        sdkClient
      }).then(setFetchedMarket)
    }
  }, [sdkClient])

  if (fetchedMarket === undefined) {
    return <List options={repeat(5, makeMarket)} isLoading />
  }

  return fetchedMarket.length > 5 ? (
    <Select options={fetchedMarket} />
  ) : (
    <List options={fetchedMarket} />
  )
}

function List({
  options,
  isLoading
}: {
  options: Market[]
  isLoading?: boolean
}): JSX.Element {
  const { control, watch } = useFormContext<FilterFormValues>()
  const selectedCount = watch().market.length

  return (
    <div>
      <Spacer bottom='4'>
        <SkeletonTemplate isLoading={isLoading}>
          <Text variant='info' weight='medium'>
            {computeFilterLabel({
              label: 'Markets',
              selectedCount,
              totalCount: options.length
            })}
          </Text>
        </SkeletonTemplate>
      </Spacer>
      <Controller
        name='market'
        control={control}
        render={({ field }) => (
          <SkeletonTemplate isLoading={isLoading}>
            <Card>
              {options.map((market, idx) => {
                const hasBottomGap = idx + 1 < options.length
                const isChecked = field.value.includes(market.id)
                return (
                  <Spacer
                    key={market.id}
                    bottom={hasBottomGap ? '4' : undefined}
                  >
                    <InputCheckbox
                      checked={isChecked}
                      onChange={() => {
                        field.onChange(
                          isChecked
                            ? field.value.filter((v) => v !== market.id)
                            : [...field.value, market.id]
                        )
                      }}
                    >
                      <Avatar
                        size='small'
                        shape='circle'
                        src={makeGravatarUrl(market.name, idx)}
                        alt={market.name}
                      />
                      <Text weight='semibold'>{market.name}</Text>
                    </InputCheckbox>
                  </Spacer>
                )
              })}
            </Card>
          </SkeletonTemplate>
        )}
      />
    </div>
  )
}

function Select({ options }: { options: Market[] }): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()

  if (sdkClient == null) {
    return null
  }

  return (
    <InputSelect
      label='Markets'
      name='market'
      initialValues={options.map((market) => ({
        value: market.id,
        label: market.name
      }))}
      placeholder='Type to search for market'
      isMulti
      isClearable
      pathToValue='value'
      loadAsyncValues={async (hint) => {
        const list = await fetchMarkets({ sdkClient, hint })
        return list.map((market) => ({
          value: market.id,
          label: market.name
        }))
      }}
    />
  )
}

async function fetchMarkets({
  hint,
  sdkClient
}: {
  hint?: string
  sdkClient: CommerceLayerClient
}): Promise<ListResponse<Market>> {
  const list = await sdkClient.markets.list({
    fields: ['id', 'name'],
    pageSize: 10,
    filters:
      hint != null
        ? {
            name_cont: hint
          }
        : undefined,
    sort: {
      name: 'asc'
    }
  })
  return list
}

const colors = ['FF656B', '055463', 'FFAB2E', '282929', '001993']
function makeGravatarUrl(name: string, index: number): `https://${string}` {
  const bgColor = colors[Math.min(index, colors.length - 1)] ?? 'FF656B'
  const letters = name.substring(0, 2)
  return `https://ui-avatars.com/api/${letters}/160/${bgColor}/FFFFFF/2/0.33/false/true/true`
}
