import {
  ResourceListItem,
  Section,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order, Return } from '@commercelayer/sdk'
import type { SetNonNullable, SetRequired } from 'type-fest'

interface Props {
  order: Order
}

const returnStatuses = [
  'requested',
  'approved',
  'cancelled',
  'shipped',
  'rejected',
  'received'
]

const renderReturn: React.FC<Return> = (returnObj) => {
  const {
    canAccess,
    settings: { mode }
  } = useTokenProvider()

  const navigateToReturn = canAccess('customers')
    ? navigateTo({
        destination: {
          app: 'returns',
          resourceId: returnObj.id,
          mode
        }
      })
    : {}

  if (returnStatuses.includes(returnObj.status))
    return (
      <ResourceListItem
        key={returnObj.id}
        resource={returnObj}
        {...navigateToReturn}
      />
    )
}

function hasReturns(
  order: Order
): order is SetRequired<SetNonNullable<Order, 'returns'>, 'returns'> {
  return (
    order.returns != null &&
    order.returns.length > 0 &&
    order.returns.filter((returnObj) =>
      returnStatuses.includes(returnObj.status)
    ).length > 0
  )
}

export const OrderReturns = withSkeletonTemplate<Props>(({ order }) => {
  if (!hasReturns(order)) {
    return null
  }

  return (
    <Section title='Returns'>
      {order.returns.map((returnObj) => renderReturn(returnObj))}
    </Section>
  )
})
