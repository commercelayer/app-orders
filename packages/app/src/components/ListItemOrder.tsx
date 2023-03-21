import { getPaymentStatusName } from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { getDisplayStatus } from '#data/status'
import {
  Icon,
  ListItem,
  Text,
  formatDate,
  useTokenProvider,
  withinSkeleton
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: Order
}

const mockedOrder: Order = {
  id: 'PZrIfTsOXL',
  created_at: '2023-03-15T13:57:06.856Z',
  updated_at: '2023-03-15T13:57:06.856Z',
  type: 'orders',
  number: 12332323,
  status: 'placed',
  payment_status: 'paid',
  fulfillment_status: 'unfulfilled',
  formatted_total_amount: '$99.99',
  customer: {
    id: 'PZrIfTsOXL',
    created_at: '2023-03-15T13:57:06.856Z',
    updated_at: '2023-03-15T13:57:06.856Z',
    type: 'customers',
    email: 'email@commercelayer.io'
  },
  market: {
    id: 'PZrIfTsOXL',
    created_at: '2023-03-15T13:57:06.856Z',
    updated_at: '2023-03-15T13:57:06.856Z',
    type: 'markets',
    name: 'CommerceLayer'
  }
}

function ListItemOrderComponent({
  resource = mockedOrder
}: Props): JSX.Element {
  const {
    settings: { timezone }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const displayStatus = getDisplayStatus(resource)
  return (
    <ListItem
      icon={
        <Icon
          name={displayStatus.icon}
          background={displayStatus.color}
          gap='large'
        />
      }
      onClick={() => setLocation(appRoutes.details.makePath(resource.id))}
    >
      <div>
        <Text tag='div' weight='semibold'>
          {resource.market?.name} #{resource.number}
        </Text>
        <Text tag='div' weight='medium' size='small' variant='info'>
          {displayStatus.label} · {resource.customer?.email} ·{' '}
          {formatDate({ isoDate: resource.updated_at, timezone })}
        </Text>
        {displayStatus.task != null && (
          <Text tag='div' weight='bold' size='small' variant='warning'>
            {displayStatus.task}
          </Text>
        )}
      </div>
      <div>
        <Text tag='div' weight='semibold'>
          {resource.formatted_total_amount}
        </Text>
        <Text tag='div' weight='medium' size='small' variant='info'>
          {getPaymentStatusName(resource.payment_status)}
        </Text>
      </div>
    </ListItem>
  )
}

export const ListItemOrder = withinSkeleton(ListItemOrderComponent)
