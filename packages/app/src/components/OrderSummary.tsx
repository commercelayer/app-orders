import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useOrderDetails } from '#hooks/useOrderDetails'
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
import { useMemo } from 'react'
import { useCaptureOverlay } from '../hooks/useCaptureOverlay'

interface Props {
  order: Order
}

type FooterActions = NonNullable<
  Parameters<typeof ResourceOrderSummary>[0]['footerActions']
>

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { mutateOrder } = useOrderDetails(order.id)
    const { triggerAttributes } = getOrderDisplayStatus(order)

    const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)

    const { sdkClient } = useCoreSdkProvider()

    const { show: showCaptureOverlay, Overlay: CaptureOverlay } =
      useCaptureOverlay()
    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()

    const hasInvalidShipments =
      (order.shipments?.filter((shipment) => shipment.status === 'draft')
        ?.length ?? 0) > 0

    console.log(hasInvalidShipments)

    const editingFooterActions: FooterActions = useMemo(() => {
      if (order.status !== 'editing') {
        return []
      }

      const cancelAction: FooterActions[number] = {
        label: getOrderTriggerAttributeName('_cancel'),
        variant: 'secondary',
        disabled: isLoading,
        onClick: () => {
          showCancelOverlay()
        }
      }

      const continueAction: FooterActions[number] = {
        label: 'Continue',
        disabled: isLoading,
        onClick: () => {
          alert('Show shipments')
        }
      }

      const finishAction: FooterActions[number] = {
        label: 'Finish',
        disabled: isLoading,
        onClick: () => {
          void dispatch('_stop_editing')
        }
      }

      return [cancelAction, hasInvalidShipments ? continueAction : finishAction]
    }, [
      getOrderTriggerAttributeName,
      isLoading,
      order.status,
      showCancelOverlay
    ])

    const standardFooterActions: FooterActions = useMemo(() => {
      return triggerAttributes
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
            variant: triggerAttribute === '_cancel' ? 'secondary' : 'primary',
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
        })
    }, [
      dispatch,
      getOrderTriggerAttributeName,
      isLoading,
      showCancelOverlay,
      showCaptureOverlay,
      triggerAttributes
    ])

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
                <Button
                  variant='link'
                  onClick={(e) => {
                    e.preventDefault()
                    alert('Show shipments')
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
                  onClick={() => {
                    alert('Add item overlay')
                  }}
                >
                  Add item
                </Button>
              </>
            )}
          </>
        }
      >
        <ResourceOrderSummary
          order={order}
          editable={order.status === 'editing'}
          onChange={() => {
            void mutateOrder()
          }}
          footerActions={[...standardFooterActions, ...editingFooterActions]}
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
