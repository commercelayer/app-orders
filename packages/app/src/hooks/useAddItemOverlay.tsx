import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSkuBundle } from '#components/ListItemSkuBundle'
import {
  Overlay as OverlayElement,
  PageHeading,
  Spacer
} from '@commercelayer/app-elements'
import { useFilters } from '@commercelayer/app-elements-hook-form'
import type { Bundle, Sku } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'
import { navigate, useSearch } from 'wouter/use-location'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ onConfirm: (resource: Sku | Bundle) => void }>
}

export function useAddItemOverlay(): OverlayHook {
  const [isVisible, setIsVisible] = useState(false)

  const show = useCallback(() => {
    setIsVisible(true)
  }, [])

  const Overlay: OverlayHook['Overlay'] = useCallback(
    ({ onConfirm }) => {
      const queryString = useSearch()
      const { SearchWithNav, FilteredList } = useFilters({
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

      return isVisible ? (
        <OverlayElement>
          <PageHeading
            gap='only-top'
            title='Add item'
            onGoBack={() => {
              setIsVisible(false)
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
              type='skus'
              Item={(props) => (
                <ListItemSkuBundle
                  onSelect={(resource) => {
                    onConfirm(resource)
                    setIsVisible(false)
                    navigate(`?`, {
                      replace: true
                    })
                  }}
                  {...props}
                />
              )}
              emptyState={<ListEmptyState />}
            />
          </Spacer>
        </OverlayElement>
      ) : null
    },
    [isVisible]
  )

  return {
    show,
    Overlay
  }
}
