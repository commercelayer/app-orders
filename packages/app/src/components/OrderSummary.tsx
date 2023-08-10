import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  Button,
  ResourceOrderSummary,
  Section,
  Spacer,
  Text,
  getOrderDisplayStatus,
  getOrderTriggerAttributeName,
  useCoreSdkProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useCaptureOverlay } from '../hooks/useCaptureOverlay'

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { triggerAttributes } = getOrderDisplayStatus(order)

    const { sdkClient } = useCoreSdkProvider()

    const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)

    const { show: showCaptureOverlay, Overlay: CaptureOverlay } =
      useCaptureOverlay()
    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()

    const hasInvalidShipments =
      (order.shipments?.filter((shipment) => shipment.status === 'draft')
        ?.length ?? 0) > 0

    console.log(hasInvalidShipments)

    return (
      <Section
        title='Summary'
        actionButton={
          <>
            {order.status === 'placed' && (
              <>
                <Button
                  variant='link'
                  onClick={(e) => {
                    e.preventDefault()
                    void dispatch('_start_editing')
                  }}
                >
                  Edit
                </Button>
              </>
            )}

            {order.status === 'editing' && (
              <>
                <Button
                  variant='link'
                  onClick={(e) => {
                    e.preventDefault()
                    const lineItem = order.line_items?.filter(
                      (l) => l.item_type === 'skus'
                    )?.[0]

                    if (lineItem != null) {
                      void sdkClient.line_items.update({
                        id: lineItem.id,
                        quantity: lineItem.quantity
                      })

                      console.log('lineItemId', lineItem.id)
                    }
                  }}
                >
                  Update
                </Button>
                &nbsp;
                {hasInvalidShipments ? (
                  <Button
                    variant='link'
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Show shipments')
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant='link'
                    onClick={(e) => {
                      e.preventDefault()
                      void dispatch('_stop_editing')
                    }}
                  >
                    Finish
                  </Button>
                )}
              </>
            )}
          </>
        }
      >
        <ResourceOrderSummary
          order={order}
          footerActions={triggerAttributes
            .filter(
              (
                triggerAttribute
              ): triggerAttribute is Exclude<
                typeof triggerAttribute,
                '_archive' | '_unarchive' | '_refund' | '_return'
              > =>
                !['_archive', '_unarchive', '_refund', '_return'].includes(
                  triggerAttribute
                )
            )
            .map((triggerAttribute) => {
              return {
                label: getOrderTriggerAttributeName(triggerAttribute),
                variant:
                  triggerAttribute === '_cancel' ? 'secondary' : 'primary',
                disabled: isLoading,
                onClick: () => {
                  if (triggerAttribute === '_capture') {
                    showCaptureOverlay()
                    return
                  }
                  if (triggerAttribute === '_cancel') {
                    showCancelOverlay()
                    return
                  }

                  void dispatch(triggerAttribute)
                }
              }
            })}
        />

        {renderErrorMessages(errors)}

        <CaptureOverlay
          order={order}
          onConfirm={() => {
            void dispatch('_capture')
          }}
        />

        <CancelOverlay
          order={order}
          onConfirm={() => {
            void dispatch('_cancel')
          }}
        />
      </Section>
    )
  }
)

function renderErrorMessages(errors?: string[]): JSX.Element {
  return errors != null && errors.length > 0 ? (
    <Spacer top='4'>
      {errors.map((message, idx) => (
        <Text key={idx} variant='danger'>
          {message}
        </Text>
      ))}
    </Spacer>
  ) : (
    <></>
  )
}
