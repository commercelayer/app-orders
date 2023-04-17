import { FilterFieldFulfillmentStatus } from '#components/FilterFieldFulfillmentStatus'
import { FilterFieldMarket } from '#components/FilterFieldMarket'
import { FilterFieldPaymentStatus } from '#components/FilterFieldPaymentStatus'
import { FilterFieldStatus } from '#components/FilterFieldStatus'
import { FilterFieldTimePreset } from '#components/FilterFieldTimePreset'
import { filtersAdapters, type FilterFormValues } from '#data/filters'
import { appRoutes } from '#data/routes'
import { Button, PageLayout, Spacer } from '@commercelayer/app-elements'
import { Form } from '@commercelayer/app-elements-hook-form'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'

export function Filters(): JSX.Element {
  const [, setLocation] = useLocation()

  const methods = useForm<FilterFormValues>({
    defaultValues: filtersAdapters.fromUrlQueryToFormValues(location.search)
  })

  const timePreset = methods.watch('timePreset')
  const timeFrom = methods.watch('timeFrom')
  const timeTo = methods.watch('timeTo')

  useEffect(
    function navigateToTimeRangeCustom() {
      const isRangeNotSet = timeFrom == null || timeTo == null
      if (timePreset === 'custom' && isRangeNotSet) {
        setLocation(
          appRoutes.filtersTimeRange.makePath(
            filtersAdapters.fromFormValuesToUrlQuery(methods.getValues())
          )
        )
      }
    },
    [timePreset]
  )

  useEffect(
    function resetTimeRangeOnPreset() {
      if (timePreset !== 'custom') {
        methods.setValue('timeFrom', null)
        methods.setValue('timeTo', null)
      }
    },
    [timePreset]
  )

  return (
    <PageLayout
      title='Filters'
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
          <FilterFieldTimePreset />
        </Spacer>

        <Spacer bottom='14'>
          <Button type='submit'>Apply filters</Button>
        </Spacer>
      </Form>
    </PageLayout>
  )
}
