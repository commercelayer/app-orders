import { useOrderContext } from '#contexts/OrderContext'
import { getTriggerAttributeName } from '#data/dictionaries'
import { getDisplayStatus } from '#data/status'
import {
  ContextMenu,
  DropdownMenuItem,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useMemo, type FC } from 'react'

export const OrderDetailsContextMenu: FC<{ order: Order }> = ({ order }) => {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const [, setOrder] = useOrderContext()

  const archiveStatus = useMemo(() => {
    const { triggerAttributes } = getDisplayStatus(order)
    const triggerAttribute =
      triggerAttributes.find((attr) => attr === '_archive') ??
      triggerAttributes.find((attr) => attr === '_unarchive')

    if (triggerAttribute == null) {
      return null
    }

    return {
      label: getTriggerAttributeName(triggerAttribute),
      triggerAttribute
    }
  }, [order])

  if (archiveStatus != null) {
    return (
      <ContextMenu
        menuItems={
          <>
            {canUser('update', 'orders') && (
              <DropdownMenuItem
                label={archiveStatus.label}
                onClick={() => {
                  void sdkClient?.orders
                    .update(
                      {
                        id: order.id,
                        [archiveStatus.triggerAttribute]: true
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
                }}
              />
            )}
          </>
        }
      />
    )
  }

  return null
}
