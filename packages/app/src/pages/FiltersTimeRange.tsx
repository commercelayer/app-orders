import { filtersAdapters, type FilterFormValues } from '#data/filters'
import { appRoutes } from '#data/routes'
import { Button, PageLayout, Spacer } from '@commercelayer/app-elements'
import { Form, InputDate } from '@commercelayer/app-elements-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'

const validationSchema = z
  .object({
    timeFrom: z.date({
      required_error: 'Please enter a valid "From" date',
      invalid_type_error: 'Please enter a valid "From" date'
    }),
    timeTo: z.date({
      required_error: 'Please enter a valid "To" date',
      invalid_type_error: 'Please enter a valid "To" date'
    })
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.timeFrom > data.timeTo) {
      ctx.addIssue({
        code: 'invalid_date',
        path: ['timeTo'],
        message: 'The "To" date must be greater than the "From" date'
      })
    }
  })

export function FiltersTimeRange(): JSX.Element {
  const [, setLocation] = useLocation()

  const methods = useForm<FilterFormValues>({
    defaultValues: filtersAdapters.fromUrlQueryToFormValues(location.search),
    resolver: zodResolver(validationSchema)
  })
  const timeFrom = methods.watch('timeFrom')

  return (
    <PageLayout
      title='Custom Time Range'
      onGoBack={() => {
        setLocation(
          appRoutes.filters.makePath(
            filtersAdapters.fromFormValuesToUrlQuery({
              ...methods.getValues(),
              timePreset: undefined
            })
          )
        )
      }}
    >
      <Form
        {...methods}
        onSubmit={(formValues) => {
          setLocation(
            appRoutes.filters.makePath(
              filtersAdapters.fromFormValuesToUrlQuery(formValues)
            )
          )
        }}
      >
        <Spacer bottom='14'>
          <InputDate
            name='timeFrom'
            label='From'
            isClearable
            preventOpenOnFocus
          />
        </Spacer>
        <Spacer bottom='14'>
          <InputDate
            name='timeTo'
            label='To'
            minDate={timeFrom ?? undefined}
            isClearable
            preventOpenOnFocus
          />
        </Spacer>

        <Button type='submit'>Apply</Button>
      </Form>
    </PageLayout>
  )
}
