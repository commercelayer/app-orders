import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSkuBundle } from '#components/ListItemSkuBundle'
import {
  PageHeading,
  Spacer,
  useOverlay,
  useResourceFilters
} from '@commercelayer/app-elements'
import type { Bundle, Sku } from '@commercelayer/sdk'
import { navigate, useSearch } from 'wouter/use-location'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ onConfirm: (resource: Sku | Bundle) => void }>
}

export function useAddItemOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()

  return {
    show: open,
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
            title='Add item'
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
              type='skus'
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
              emptyState={<ListEmptyState />}
            />
          </Spacer>
        </OverlayElement>
      )
    }
  }
}
