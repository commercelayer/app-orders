import { getTriggerAttributeName } from '#data/dictionaries'
import { getDisplayStatus } from '#data/status'
import {
  Legend,
  OrderSummary as OrderSummaryElement,
  useCoreSdkProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useOrderDetails } from 'src/hooks/useOrderDetails'

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { mutateOrder } = useOrderDetails(order.id)
    const { triggerAttributes } = getDisplayStatus(order)
    const { sdkClient } = useCoreSdkProvider()

    return (
      <>
        <Legend title='Summary' />
        <OrderSummaryElement
          order={order}
          footerActions={triggerAttributes
            .filter(
              (triggerAttribute) =>
                !['_archive', '_unarchive', '_refund'].includes(
                  triggerAttribute
                )
            )
            .map((triggerAttribute) => {
              return {
                label: getTriggerAttributeName(triggerAttribute),
                variant:
                  triggerAttribute === '_cancel' ? 'secondary' : 'primary',
                onClick: () => {
                  void sdkClient?.orders
                    .update({
                      id: order.id,
                      [triggerAttribute]: true
                    })
                    .then(() => {
                      void mutateOrder()
                    })
                }
              }
            })}
        />
      </>
    )
  }
)
