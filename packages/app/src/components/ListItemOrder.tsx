/* eslint-disable @typescript-eslint/naming-convention */
import type { JSX } from 'preact/jsx-runtime'
import {
  Icon,
  ListItem,
  Text,
  formatDate,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { appRoutes } from '#data/routes'
import { Link } from 'wouter'

interface Props {
  order: Order
}

export function ListItemOrder({ order }: Props): JSX.Element {
  const {
    settings: { timezone }
  } = useTokenProvider()

  return (
    <Link href={appRoutes.details.makePath(order.id)} key={order.id}>
      <ListItem
        icon={
          <OrderIcon
            status={order.status}
            payment_status={order.payment_status}
          />
        }
      >
        <div>
          <Text tag='div' weight='semibold'>
            {order.market?.name} #{order.id}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {order.status} · {order.customer?.email} ·{' '}
            {formatDate({ isoDate: order.updated_at, timezone })}
          </Text>
          <ActionHint order={order} />
        </div>
        <div>
          <Text tag='div' weight='semibold'>
            {formatPrice({
              cents: order.total_amount_cents,
              currency: order.currency_code
            })}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {order.payment_status}
          </Text>
        </div>
      </ListItem>
    </Link>
  )
}

function OrderIcon({
  status,
  payment_status
}: Pick<Order, 'status' | 'payment_status'>): JSX.Element {
  if (status === 'cancelled') {
    return <Icon name='x' background='gray' gap='large' />
  }

  if (payment_status === 'authorized') {
    return <Icon name='arrowDown' background='orange' gap='large' />
  }

  if (status === 'approved') {
    return <Icon name='check' background='green' gap='large' />
  }

  return <Icon name='arrowClockwise' background='orange' gap='large' />
}

function ActionHint({
  order: { status, payment_status, fulfillment_status }
}: {
  order: Order
}): JSX.Element {
  return (
    <>
      {status === 'placed' &&
      payment_status === 'authorized' &&
      fulfillment_status === 'unfulfilled' ? (
        <Text tag='div' weight='bold' size='small' variant='warning'>
          Awaiting approval
        </Text>
      ) : null}

      {fulfillment_status === 'in_progress' ? 'Fulfillment in progress' : null}
    </>
  )
}

function formatPrice({
  cents,
  currency
}: {
  cents?: number
  currency?: string
}): string {
  if (cents == null) {
    return 'Free'
  }

  if (currency == null) {
    return Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(cents / 100)
  }

  return Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(cents / 100)
}
