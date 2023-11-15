import { appRoutes } from '#data/routes'
import { useReturnableList } from '#hooks/useReturnableList'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  Dropdown,
  DropdownItem,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useMemo, type FC } from 'react'
import { useLocation } from 'wouter'
import {
  getTriggerAttributeName,
  getTriggerAttributes
} from './OrderSummary/orderDictionary'

export const OrderDetailsContextMenu: FC<{ order: Order }> = ({ order }) => {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  const returnableLineItems = useReturnableList(order)

  const showReturnDropDownItem =
    canUser('create', 'returns') &&
    order.fulfillment_status === 'fulfilled' &&
    returnableLineItems.length > 0

  const createReturnDropDownItem = useMemo(() => {
    return showReturnDropDownItem ? (
      <DropdownItem
        key='request-return'
        label='Request return'
        onClick={() => {
          setLocation(appRoutes.return.makePath(order.id))
        }}
      />
    ) : undefined
  }, [order, returnableLineItems, showReturnDropDownItem])

  const { dispatch } = useTriggerAttribute(order.id)

  const triggerMenuActions = useMemo(() => {
    const triggerAttributes = getTriggerAttributes(order)
    return getTriggerAttributesForUser(canUser).filter((attr) =>
      triggerAttributes.includes(attr)
    )
  }, [order])

  const triggerDropDownItems = triggerMenuActions.map((triggerAttribute) => (
    <DropdownItem
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
  ))

  if (!showReturnDropDownItem && triggerMenuActions.length === 0) {
    return null
  }

  return (
    <>
      <Dropdown
        dropdownItems={[createReturnDropDownItem, ...triggerDropDownItems]}
      />
    </>
  )
}

type UITriggerAttributes = Parameters<typeof getTriggerAttributeName>[0]

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
