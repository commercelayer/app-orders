import { getOrderStatusName } from '#data/dictionaries'
import {
  computeFilterLabel,
  filtrableStatus,
  type FilterFormValues
} from '#data/filters'
import { ToggleButtons } from '@commercelayer/app-elements-hook-form'
import { useFormContext } from 'react-hook-form'

export function FilterFieldStatus(): JSX.Element {
  const { watch } = useFormContext<FilterFormValues>()
  const selectedCount = watch().status.length

  return (
    <ToggleButtons
      label={computeFilterLabel({
        label: 'Order status',
        selectedCount,
        totalCount: filtrableStatus.length
      })}
      name='status'
      mode='multi'
      options={filtrableStatus.map((status) => ({
        label: getOrderStatusName(status),
        value: status
      }))}
    />
  )
}
