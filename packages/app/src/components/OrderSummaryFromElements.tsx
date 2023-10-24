import { useAddItemOverlay } from '#components/OrderSummary/hooks/useAddItemOverlay'
import { useSelectShippingMethodOverlay } from '#components/OrderSummary/hooks/useSelectShippingMethodOverlay'
import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  ResourceOrderSummary,
  Section,
  Spacer,
  Text,
  formatCentsToCurrency,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate,
  type CurrencyCode
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useMemo } from 'react'
import { useCaptureOverlay } from '../hooks/useCaptureOverlay'
import {
  getTriggerAttributeName,
  getTriggerAttributes
} from './OrderSummary/orderDictionary'

interface Props {
  order: Order
}

type FooterActions = NonNullable<
  Parameters<typeof ResourceOrderSummary>[0]['footerActions']
>

export const OrderSummaryFromElements = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { mutateOrder } = useOrderDetails(order.id)
    const triggerAttributes = getTriggerAttributes(order)

    const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)

    const { show: showCaptureOverlay, Overlay: CaptureOverlay } =
      useCaptureOverlay()
    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()
    const {
      show: showSelectShippingMethodOverlay,
      Overlay: SelectShippingMethodOverlay
    } = useSelectShippingMethodOverlay()

    const diffTotalAndPlacedTotal =
      (order.total_amount_with_taxes_cents ?? 0) -
      (order.place_total_amount_cents ?? 0)

    const isOriginalOrderAmountExceeded =
      order.status === 'editing' && diffTotalAndPlacedTotal > 0

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
            label: getTriggerAttributeName(triggerAttribute),
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
        label: getTriggerAttributeName('_cancel'),
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
        disabled: isLoading || isOriginalOrderAmountExceeded,
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
    }, [isLoading, order, showCancelOverlay, dispatch])

    return (
      <>
        {isOriginalOrderAmountExceeded && order.currency_code != null && (
          <Spacer bottom='14'>
            <Alert status='warning'>
              The new total is {order.formatted_total_amount_with_taxes},{' '}
              {formatCentsToCurrency(
                diffTotalAndPlacedTotal,
                order.currency_code as Uppercase<CurrencyCode>
              )}{' '}
              more than the original total.
              <br />
              Adjust the total to make it equal or less.
            </Alert>
          </Spacer>
        )}
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
      </>
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

function arrayOf<T>(arr: T[]): T[] {
  return arr
}

const ActionButton: React.FC<{ order: Order }> = ({ order }) => {
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()
  const { dispatch } = useTriggerAttribute(order.id)
  const { mutateOrder } = useOrderDetails(order.id)
  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay(order)

  const canEdit =
    order.status === 'placed' &&
    arrayOf<Order['payment_status']>(['free', 'authorized', 'paid']).includes(
      order.payment_status
    ) &&
    canUser('update', 'orders')

  const isEditing = order.status === 'editing' && canUser('update', 'orders')

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
        <Dropdown
          dropdownLabel='Add item'
          dropdownItems={
            <>
              <DropdownItem
                label='Add a SKU'
                onClick={() => {
                  showAddItemOverlay('skus')
                }}
              />
              <DropdownItem
                label='Add a bundle'
                onClick={() => {
                  showAddItemOverlay('bundles')
                }}
              />
            </>
          }
        />
      </>
    )
  }

  return null
}
