import { Countries } from '@ac-dev/countries-service'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputSelect,
  HookedValidationApiError,
  Spacer
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const zodString = z
  .string({
    required_error: 'Required field',
    invalid_type_error: 'Invalid format'
  })
  .min(1, {
    message: 'Required field'
  })

const addressFormSchema = z.object({
  first_name: zodString,
  last_name: zodString,
  company: z.optional(z.string()),
  line_1: zodString,
  line_2: z.optional(z.string()),
  city: zodString,
  zip_code: z.optional(z.string()),
  state_code: zodString,
  country_code: zodString,
  phone: zodString,
  billing_info: z.optional(z.string())
})

export type AddressFormValues = z.infer<typeof addressFormSchema>

interface Props {
  defaultValues: AddressFormValues
  showBillingInfo?: boolean
  isSubmitting?: boolean
  onSubmit: (
    formValues: AddressFormValues,
    setError: UseFormSetError<AddressFormValues>
  ) => void
  apiError?: any
}

export function AddressForm({
  defaultValues,
  showBillingInfo,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(addressFormSchema)
  })

  const countries = Countries.getCountries().map((country) => ({
    value: country.iso2,
    label: country.name
  }))

  return (
    <HookedForm
      {...methods}
      onSubmit={(formValues) => {
        onSubmit(formValues, methods.setError)
      }}
    >
      <FieldRow columns='2'>
        <HookedInput name='first_name' label='First name' />
        <HookedInput name='last_name' label='Last name' />
      </FieldRow>

      <FieldRow columns='1'>
        <HookedInput name='company' label='Company' />
      </FieldRow>

      <FieldRow columns='1'>
        <HookedInput name='line_1' label='Address line 1' />
      </FieldRow>

      <FieldRow columns='1'>
        <HookedInput name='line_2' label='Address line 2' />
      </FieldRow>

      <FieldRow columns='2'>
        <HookedInput name='city' label='City' />
        <Grid columns='2'>
          <HookedInput name='zip_code' label='ZIP code' />
          <HookedInput name='state_code' label='State code' />
        </Grid>
      </FieldRow>

      <FieldRow columns='1'>
        <HookedInputSelect
          name='country_code'
          label='Country'
          initialValues={countries}
          pathToValue='value'
        />
      </FieldRow>

      <FieldRow columns='1'>
        <HookedInput name='phone' label='Phone' />
      </FieldRow>

      {showBillingInfo === true && (
        <FieldRow columns='1'>
          <HookedInput name='billing_info' label='Billing info' />
        </FieldRow>
      )}

      <Spacer top='14'>
        <Button type='submit' disabled={isSubmitting}>
          Update address
        </Button>
        <HookedValidationApiError apiError={apiError} />
      </Spacer>
    </HookedForm>
  )
}

function FieldRow({
  children,
  columns
}: {
  children: ReactNode
  columns: '1' | '2'
}): JSX.Element {
  return (
    <Spacer bottom='8'>
      <Grid columns={columns}>{children}</Grid>
    </Spacer>
  )
}
