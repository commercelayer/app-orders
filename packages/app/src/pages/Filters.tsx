import { FilterFieldFulfillmentStatus } from '#components/FilterFieldFulfillmentStatus'
import { FilterFieldMarket } from '#components/FilterFieldMarket'
import { FilterFieldPaymentStatus } from '#components/FilterFieldPaymentStatus'
import { FilterFieldStatus } from '#components/FilterFieldStatus'
import { filtersAdapters, type FilterFormValues } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  Button,
  PageLayout,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Form } from '@commercelayer/app-elements-hook-form'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'

export function Filters(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const methods = useForm<FilterFormValues>({
    defaultValues: filtersAdapters.fromUrlQueryToFormValues(location.search)
  })

  return (
    <PageLayout
      title='Filters'
      mode={mode}
      onGoBack={() => {
        setLocation(
          appRoutes.history.makePath(
            filtersAdapters.fromUrlQueryToUrlQuery(location.search)
          )
        )
      }}
    >
      <Form
        {...methods}
        onSubmit={(formValues) => {
          setLocation(
            appRoutes.history.makePath(
              filtersAdapters.fromFormValuesToUrlQuery(formValues)
            )
          )
        }}
      >
        <Spacer bottom='14'>
          <FilterFieldMarket />
        </Spacer>

        <Spacer bottom='14'>
          <FilterFieldStatus />
        </Spacer>

        <Spacer bottom='14'>
          <FilterFieldPaymentStatus />
        </Spacer>

        <Spacer bottom='14'>
          <FilterFieldFulfillmentStatus />
        </Spacer>

        <Spacer bottom='14'>
          <Button type='submit'>Apply filters</Button>
        </Spacer>
      </Form>
    </PageLayout>
  )
}
