import { getPaymentStatusName } from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { getDisplayStatus } from '#data/status'
import {
  Icon,
  ListItem,
  Text,
  formatDate,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { Link } from 'wouter'

interface Props {
  order: Order
}

export function ListItemOrder({ order }: Props): JSX.Element {
  const {
    settings: { timezone }
  } = useTokenProvider()

  const displayStatus = getDisplayStatus(order)
  return (
    <Link href={appRoutes.details.makePath(order.id)} key={order.id}>
      <ListItem
        icon={
          <Icon
            name={displayStatus.icon}
            background={displayStatus.color}
            gap='large'
          />
        }
      >
        <div>
          <Text tag='div' weight='semibold'>
            {order.market?.name} #{order.number}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {displayStatus.label} · {order.customer?.email} ·{' '}
            {formatDate({ isoDate: order.updated_at, timezone })}
          </Text>
          {displayStatus.task != null && (
            <Text tag='div' weight='bold' size='small' variant='warning'>
              {displayStatus.task}
            </Text>
          )}
        </div>
        <div>
          <Text tag='div' weight='semibold'>
            {order.formatted_total_amount}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {getPaymentStatusName(order.payment_status)}
          </Text>
        </div>
      </ListItem>
    </Link>
  )
}
