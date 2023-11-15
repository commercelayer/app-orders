import {
  Button,
  HookedForm,
  HookedInputCurrency,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useOverlay,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { CommerceLayerClient, Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getManualAdjustment, manualAdjustmentReferenceOrigin } from '../utils'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAdjustTotalOverlay(order: Order, onChange?: () => void) {
  const currencyCode = order.currency_code as Uppercase<CurrencyCode>
  const manualAdjustment = getManualAdjustment(order)
  const { sdkClient } = useCoreSdkProvider()
  const { Overlay, open, close } = useOverlay()

  const validationSchema = useMemo(
    () =>
      z.object({
        adjustTotal: z.number({
          required_error: 'Please enter a negative or positive value.',
          invalid_type_error: 'Please enter a negative or positive value.'
        })
      }),
    []
  )
  const formMethods = useForm({
    defaultValues: {
      adjustTotal: manualAdjustment?.total_amount_cents
    },
    resolver: zodResolver(validationSchema)
  })
  const {
    formState: { isSubmitting }
  } = formMethods

  return {
    close,
    open,
    Overlay: () => (
      <Overlay>
        <HookedForm
          {...formMethods}
          onSubmit={async (values) => {
            if (manualAdjustment == null) {
              await createManualAdjustmentLineItem({
                sdkClient,
                order,
                amount: values.adjustTotal ?? 0
              }).then(() => {
                onChange?.()
                close()
              })
            } else {
              await updateManualAdjustmentLineItem({
                sdkClient,
                order,
                lineItemId: manualAdjustment.id,
                amount: values.adjustTotal ?? 0
              }).then(() => {
                onChange?.()
                close()
              })
            }
          }}
        >
          <PageLayout
            title='Adjust total'
            onGoBack={() => {
              close()
            }}
          >
            <Spacer bottom='8'>
              <HookedInputCurrency
                isClearable
                sign='-+'
                disabled={isSubmitting}
                currencyCode={currencyCode}
                label='Amount'
                name='adjustTotal'
              />
            </Spacer>
            <Button type='submit' fullWidth disabled={isSubmitting}>
              Apply
            </Button>
          </PageLayout>
        </HookedForm>
      </Overlay>
    )
  }
}

async function createManualAdjustmentLineItem({
  sdkClient,
  amount,
  order
}: {
  sdkClient: CommerceLayerClient
  amount: number
  order: Order
}): Promise<void> {
  const currencyCode = order.currency_code as Uppercase<CurrencyCode>

  const adjustment = await sdkClient.adjustments.create({
    currency_code: currencyCode,
    amount_cents: amount,
    name: 'Manual adjustment',
    reference_origin: manualAdjustmentReferenceOrigin
  })

  await sdkClient.line_items.create({
    order: sdkClient.orders.relationship(order.id),
    quantity: 1,
    item: adjustment,
    reference_origin: manualAdjustmentReferenceOrigin
  })
}

async function updateManualAdjustmentLineItem({
  sdkClient,
  amount,
  lineItemId,
  order
}: {
  sdkClient: CommerceLayerClient
  amount: number
  lineItemId: string
  order: Order
}): Promise<void> {
  const lineItem = await sdkClient.line_items.retrieve(lineItemId, {
    include: ['item']
  })

  if (lineItem.item != null) {
    if (amount === 0) {
      await sdkClient.adjustments.delete(lineItem.item.id)
      await sdkClient.line_items.delete(lineItemId)
    } else {
      const adjustment = await sdkClient.adjustments.update({
        id: lineItem.item.id,
        amount_cents: amount
      })

      await sdkClient.line_items.delete(lineItemId)
      await sdkClient.line_items.create({
        order: sdkClient.orders.relationship(order.id),
        quantity: 1,
        item: adjustment,
        reference_origin: manualAdjustmentReferenceOrigin
      })
    }
  }
}
