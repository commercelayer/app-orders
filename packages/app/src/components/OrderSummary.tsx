import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { useSelectShippingMethodOverlay } from '#hooks/useSelectShippingMethodOverlay'
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

    const { show: showCaptureOverlay, Overlay: CaptureOverlay } =
      useCaptureOverlay()
    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()
    const {
      show: showSelectShippingMethodOverlay,
      Overlay: SelectShippingMethodOverlay
    } = useSelectShippingMethodOverlay()

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
          showSelectShippingMethodOverlay()
        }
      }

      const finishAction: FooterActions[number] = {
        label: 'Finish',
        disabled: isLoading,
        onClick: () => {
          void dispatch('_stop_editing')
        }
      }

      const hasInvalidShipments =
        (order.shipments?.filter((shipment) => shipment.shipping_method == null)
          ?.length ?? 0) > 0

      const hasInvalidOrderAmount = false
      // const hasInvalidOrderAmount = (order.total_amount_cents ?? Infinity) > 9900

      return [
        cancelAction,
        hasInvalidShipments || hasInvalidOrderAmount
          ? continueAction
          : finishAction
      ]
    }, [
      getOrderTriggerAttributeName,
      isLoading,
      order,
      showCancelOverlay,
      dispatch
    ])

    return (
      <Section title='Summary' actionButton={<ActionButton order={order} />}>
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

        <SelectShippingMethodOverlay order={order} />
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

const ActionButton: React.FC<{ order: Order }> = ({ order }) => {
  const { sdkClient } = useCoreSdkProvider()
  const { dispatch } = useTriggerAttribute(order.id)
  const { mutateOrder } = useOrderDetails(order.id)
  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay()

  const canEdit = order.status === 'placed' && order.payment_status !== 'unpaid'
  const isEditing = order.status === 'editing'

  if (canEdit) {
    return (
      <Button
        variant='link'
        onClick={(e) => {
          e.preventDefault()
          void dispatch('_start_editing')
        }}
      >
        Edit
      </Button>
    )
  }

  if (isEditing) {
    return (
      <>
        <AddItemOverlay
          onConfirm={({ type, code }) => {
            void sdkClient.line_items
              .create({
                order: sdkClient.orders.relationship(order.id),
                quantity: 1,
                ...(type === 'skus'
                  ? { sku_code: code }
                  : { bundle_code: code })
              })
              .then(async () => {
                return await mutateOrder()
              })
          }}
        />
        <Button
          variant='link'
          onClick={() => {
            showAddItemOverlay()
          }}
        >
          Add item
        </Button>
      </>
    )
  }

  return null
}
