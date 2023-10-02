import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSkuBundle } from '#components/ListItemSkuBundle'
import {
  PageHeading,
  Spacer,
  useOverlay,
  useResourceFilters
} from '@commercelayer/app-elements'
import type { Bundle, Sku } from '@commercelayer/sdk'
import { useRef } from 'react'
import { navigate, useSearch } from 'wouter/use-location'

interface OverlayHook {
  show: (type: 'skus' | 'bundles') => void
  Overlay: React.FC<{ onConfirm: (resource: Sku | Bundle) => void }>
}

export function useAddItemOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const filterType = useRef<'skus' | 'bundles'>('skus')

  return {
    show: (type) => {
      filterType.current = type
      open()
    },
    Overlay: ({ onConfirm }) => {
      const queryString = useSearch()
      const { SearchWithNav, FilteredList } = useResourceFilters({
        instructions: [
          {
            label: 'Search',
            type: 'textSearch',
            sdk: {
              predicate: ['name', 'code'].join('_or_') + '_cont'
            },
            render: {
              component: 'searchBar'
            }
          }
        ]
      })

      return (
        <OverlayElement>
          <PageHeading
            gap='only-top'
            title={filterType.current === 'skus' ? 'Add a SKU' : 'Add a bundle'}
            onGoBack={() => {
              close()
            }}
          />

          <SearchWithNav
            onFilterClick={() => {}}
            onUpdate={(qs) => {
              navigate(`?${qs}`, {
                replace: true
              })
            }}
            queryString={queryString}
            hideFiltersNav
            searchBarPlaceholder='search...'
          />

          <Spacer top='14'>
            <FilteredList
              type={filterType.current}
              ItemTemplate={(props) => (
                <ListItemSkuBundle
                  onSelect={(resource) => {
                    onConfirm(resource)
                    close()
                    navigate(`?`, {
                      replace: true
                    })
                  }}
                  {...props}
                />
              )}
              emptyState={
                <ListEmptyState
                  scope={filterType.current === 'skus' ? 'noSKUs' : 'noBundles'}
                />
              }
            />
          </Spacer>
        </OverlayElement>
      )
    }
  }
}
