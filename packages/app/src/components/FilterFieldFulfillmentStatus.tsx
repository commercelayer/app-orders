import { getFulfillmentStatusName } from '#data/dictionaries'
import {
  computeFilterLabel,
  filtrableFulfillmentStatus,
  type FilterFormValues
} from '#data/filters'
import { ToggleButtons } from '@commercelayer/app-elements-hook-form'
import { useFormContext } from 'react-hook-form'

export function FilterFieldFulfillmentStatus(): JSX.Element {
  const { watch } = useFormContext<FilterFormValues>()
  const selectedCount = watch().fulfillmentStatus.length

  return (
    <ToggleButtons
      label={computeFilterLabel({
        label: 'Fulfillment status',
        selectedCount,
        totalCount: filtrableFulfillmentStatus.length
      })}
      name='fulfillmentStatus'
      mode='multi'
      options={filtrableFulfillmentStatus.map((status) => ({
        label: getFulfillmentStatusName(status),
        value: status
      }))}
    />
  )
}
