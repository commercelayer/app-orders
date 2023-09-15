import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  ResourceOrderSummary,
  Section,
  Spacer,
  Text,
  getOrderDisplayStatus,
  getOrderTriggerAttributeName,
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

    const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)

    const { show: showCaptureOverlay, Overlay: CaptureOverlay } =
      useCaptureOverlay()
    const { show: showCancelOverlay, Overlay: CancelOverlay } =
      useCancelOverlay()

    return (
      <Section title='Summary'>
        <ResourceOrderSummary
          order={order}
          footerActions={triggerAttributes
            .filter(
              (triggerAttribute) =>
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
