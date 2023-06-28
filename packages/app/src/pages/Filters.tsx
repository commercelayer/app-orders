import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { PageLayout } from '@commercelayer/app-elements'
import { useFilters } from '@commercelayer/app-elements-hook-form'
import { useLocation } from 'wouter'

export function Filters(): JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useFilters({
    instructions
  })

  return (
    <PageLayout
      title='Filters'
      onGoBack={() => {
        setLocation(
          appRoutes.list.makePath(
            adapters.adaptUrlQueryToUrlQuery({
              queryString: location.search
            })
          )
        )
      }}
    >
      <FiltersForm
        onSubmit={(filtersQueryString) => {
          setLocation(appRoutes.list.makePath(filtersQueryString))
        }}
      />
    </PageLayout>
  )
}
