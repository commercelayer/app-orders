import { getTriggerAttributeName } from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { getDisplayStatus, type UITriggerAttributes } from '#data/status'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  ContextMenu,
  DropdownMenuItem,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useMemo, type FC } from 'react'
import { useLocation } from 'wouter'

export const OrderDetailsContextMenu: FC<{ order: Order }> = ({ order }) => {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { dispatch } = useTriggerAttribute(order.id)

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
            void dispatch(triggerAttribute)
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
  const onCapture: UITriggerAttributes[] = canUser('update', 'transactions')
    ? ['_refund']
    : []
  return [...onOrder, ...onCapture]
}
