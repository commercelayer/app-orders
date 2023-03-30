import {
  Legend,
  withSkeletonTemplate,
  OrderSummary as OrderSummaryElement,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { getDisplayStatus } from '#data/status'
import { useOrderContext } from '#contexts/OrderContext'
import { getTriggerAttributeName } from '#data/dictionaries'

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const [, setOrder] = useOrderContext()
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
                triggerAttribute !== '_archive' &&
                triggerAttribute !== '_unarchive'
            )
            .map((triggerAttribute) => {
              return {
                label: getTriggerAttributeName(triggerAttribute),
                onClick: () => {
                  void sdkClient?.orders
                    .update(
                      {
                        id: order.id,
                        [triggerAttribute]: true
                      },
                      {
                        include: [
                          'market',
                          'customer',
                          'line_items',
                          'shipping_address',
                          'billing_address',
                          'shipments'
                        ]
                      }
                    )
                    .then((order) => {
                      setOrder(order)
                    })
                }
              }
            })}
        />
      </>
    )
  }
)
