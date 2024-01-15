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
import { navigate, useSearch } from 'wouter/use-location'

export function OrderList(): JSX.Element {
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
          setLocation(appRoutes.home.makePath())
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
          setLocation(appRoutes.filters.makePath(queryString))
        }}
        hideFiltersNav={hideFiltersNav}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='orders'
          ItemTemplate={ListItemOrder}
          query={{
            fields: {
              orders: [
                'id',
                'number',
                'updated_at',
                'placed_at',
                'formatted_total_amount',
                'status',
                'payment_status',
                'fulfillment_status',
                'market',
                'billing_address',
                'shipping_address'
              ],
              markets: ['id', 'name']
            },
            include: ['market', 'billing_address'],
            pageSize: 25,
            sort: {
              updated_at: 'desc'
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
