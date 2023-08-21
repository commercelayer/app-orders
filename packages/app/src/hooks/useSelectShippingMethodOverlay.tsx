import {
  Button,
  Card,
  Hr,
  InputRadioGroup,
  Legend,
  LineItems,
  ListItem,
  Overlay as OverlayElement,
  PageHeading,
  Spacer,
  Text,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useState } from 'react'
import { Controller, Form, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useOrderDetails } from './useOrderDetails'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{
    order: Order
  }>
}

const zodString = z.string({
  required_error: 'Required field'
})

export function useSelectShippingMethodOverlay(): OverlayHook {
  const [isVisible, setIsVisible] = useState(false)

  const show = useCallback(() => {
    setIsVisible(true)
  }, [])

  const Overlay: OverlayHook['Overlay'] = useCallback(
    ({ order }) => {
      const methods = useForm<Record<string, string>>({
        defaultValues:
          order.shipments?.reduce((acc, shipment) => {
            if (shipment.shipping_method?.id == null) {
              return acc
            }

            return {
              ...acc,
              [shipment.id]: shipment.shipping_method?.id
            }
          }, {} satisfies Record<string, string>) ?? {},
        resolver: zodResolver(z.object({}).catchall(zodString))
      })

      const { mutateOrder } = useOrderDetails(order.id)
      const { sdkClient } = useCoreSdkProvider()

      if (!isVisible) {
        return null
      }

      return (
        <OverlayElement>
          <PageHeading
            gap='only-top'
            title='Select a shipping method'
            onGoBack={() => {
              setIsVisible(false)
            }}
          />

          <Form
            control={methods.control}
            onSubmit={(formValues) => {
              void Promise.all(
                Object.entries(formValues.data).map(
                  async ([shipmentId, shippingMethodId]) =>
                    await sdkClient.shipments.update({
                      id: shipmentId,
                      shipping_method: {
                        type: 'shipping_methods',
                        id: shippingMethodId
                      }
                    })
                )
              )
                .then(async () => await mutateOrder())
                .then(() => {
                  setIsVisible(false)
                })
            }}
          >
            {order.shipments?.map((shipment) => {
              if (shipment.number == null) {
                return null
              }

              return (
                <Spacer key={shipment.id} top='14'>
                  <Legend
                    title={`Shipment #${shipment.number}`}
                    border='none'
                  />
                  <Card>
                    <Spacer bottom='4'>
                      <Text variant='info'>Shipping method:</Text>
                    </Spacer>
                    <Controller
                      control={methods.control}
                      name={shipment.id}
                      render={({ field: { name, onChange, value } }) => (
                        <InputRadioGroup
                          name={name}
                          defaultValue={value}
                          onChange={onChange}
                          options={
                            shipment.available_shipping_methods?.map(
                              (availableShippingMethod) => ({
                                content: (
                                  <ListItem
                                    tag='div'
                                    borderStyle='none'
                                    padding='none'
                                  >
                                    <Text weight='semibold'>
                                      {availableShippingMethod.name}
                                    </Text>
                                    <Text weight='semibold'>
                                      {
                                        availableShippingMethod.formatted_price_amount
                                      }
                                    </Text>
                                  </ListItem>
                                ),
                                value: availableShippingMethod.id
                              })
                            ) ?? []
                          }
                        />
                      )}
                    />
                    <Spacer top='6'>
                      <Hr />
                      <LineItems
                        size='small'
                        items={shipment.stock_line_items ?? []}
                      />
                    </Spacer>
                  </Card>
                </Spacer>
              )
            })}
            <Spacer top='14'>
              <Button
                type='submit'
                fullWidth
                disabled={!methods.formState.isValid}
              >
                Continue
              </Button>
            </Spacer>
          </Form>
        </OverlayElement>
      )
    },
    [isVisible]
  )

  return {
    show,
    Overlay
  }
}
