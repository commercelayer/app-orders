import { ListItemOrder } from '#components/ListItemOrder'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  EmptyState,
  PageLayout,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useFilters } from '@commercelayer/app-elements-hook-form'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-location'

export function OrderList(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle } = useFilters({
    instructions
  })
  const hideSearchBar = !['Archived', 'Order history'].includes(viewTitle ?? '')
  const hideFiltersNav = viewTitle !== 'Order history'

  return (
    <PageLayout
      title={viewTitle ?? 'Order history'}
      mode={mode}
      gap={hideSearchBar ? undefined : 'only-top'}
      onGoBack={() => {
        setLocation(appRoutes.home.makePath())
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
        hideSearchBar={hideSearchBar}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='orders'
          Item={ListItemOrder}
          query={{
            fields: {
              orders: [
                'id',
                'number',
                'updated_at',
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
            <EmptyState
              // TODO: use ListEmptyState
              title='No orders found!'
              description={
                <div>
                  <p>
                    We didn't find any orders matching the current selection.
                  </p>
                </div>
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}
