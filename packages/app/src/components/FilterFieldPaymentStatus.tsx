import { getPaymentStatusName } from '#data/dictionaries'
import {
  computeFilterLabel,
  filtrablePaymentStatus,
  type FilterFormValues
} from '#data/filters'
import { ToggleButtons } from '@commercelayer/app-elements-hook-form'
import { useFormContext } from 'react-hook-form'

export function FilterFieldPaymentStatus(): JSX.Element {
  const { watch } = useFormContext<FilterFormValues>()
  const selectedCount = watch().paymentStatus.length

  return (
    <ToggleButtons
      label={computeFilterLabel({
        label: 'Payment status',
        selectedCount,
        totalCount: filtrablePaymentStatus.length
      })}
      name='paymentStatus'
      mode='multi'
      options={filtrablePaymentStatus.map((status) => ({
        label: getPaymentStatusName(status),
        value: status
      }))}
    />
  )
}
