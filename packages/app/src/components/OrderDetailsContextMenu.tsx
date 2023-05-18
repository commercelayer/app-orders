import { getTriggerAttributeName } from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { getDisplayStatus, type UITriggerAttributes } from '#data/status'
import {
  ContextMenu,
  DropdownMenuItem,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useMemo, type FC } from 'react'
import { useOrderDetails } from 'src/hooks/useOrderDetails'
import { useLocation } from 'wouter'

export const OrderDetailsContextMenu: FC<{ order: Order }> = ({ order }) => {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { mutateOrder } = useOrderDetails(order.id)

  const menuActions = useMemo(() => {
    const { triggerAttributes } = getDisplayStatus(order)
    return getTriggerAttributesForUser(canUser).filter((attr) =>
      triggerAttributes.includes(attr)
    )
  }, [order])

  if (menuActions.length === 0) {
    return null
  }

  return (
    <ContextMenu
      menuItems={menuActions.map((triggerAttribute) => (
        <DropdownMenuItem
          key={triggerAttribute}
          label={getTriggerAttributeName(triggerAttribute)}
          onClick={() => {
            // refund action has its own form page
            if (triggerAttribute === '_refund') {
              setLocation(appRoutes.refund.makePath(order.id))
              return
            }

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
                void mutateOrder(order)
              })
          }}
        />
      ))}
    />
  )
}

type CanUserSignature = ReturnType<typeof useTokenProvider>['canUser']
function getTriggerAttributesForUser(
  canUser: CanUserSignature
): UITriggerAttributes[] {
  const onOrder: UITriggerAttributes[] = canUser('update', 'orders')
    ? ['_archive', '_unarchive']
    : []
  const onCapture: UITriggerAttributes[] = canUser('update', 'captures')
    ? ['_refund']
    : []
  return [...onOrder, ...onCapture]
}
