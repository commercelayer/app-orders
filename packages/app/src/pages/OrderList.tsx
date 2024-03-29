import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemOrder } from '#components/ListItemOrder'
import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

function OrderList(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const isUserCustomFiltered =
    hasActiveFilter && viewTitle === presets.history.viewTitle
  const hideFiltersNav = !(
    viewTitle == null || viewTitle === presets.history.viewTitle
  )

  return (
    <PageLayout
      title={viewTitle ?? presets.history.viewTitle}
      mode={mode}
      gap='only-top'
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        },
        label: 'Orders',
        icon: 'arrowLeft'
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath({}, queryString))
        }}
        hideFiltersNav={hideFiltersNav}
        searchBarDebounceMs={1000}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='orders'
          ItemTemplate={ListItemOrder}
          metricsQuery={{
            search: {
              limit: 25,
              sort: 'desc',
              sort_by: 'order.updated_at',
              fields: ['order.*', 'billing_address.*', 'market.*']
            }
          }}
          emptyState={
            <ListEmptyState
              scope={
                isUserCustomFiltered
                  ? 'userFiltered'
                  : viewTitle !== presets.history.viewTitle
                    ? 'presetView'
                    : 'history'
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}

export default OrderList
