import { getPaymentStatusName } from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { getDisplayStatus } from '#data/status'
import { makeOrder } from '#mocks'
import {
  Icon,
  ListItem,
  Text,
  formatDate,
  formatDisplayName,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import { Link } from 'wouter'

interface Props {
  resource?: Order
}

function ListItemOrderComponent({
  resource = makeOrder()
}: Props): JSX.Element {
  const { user } = useTokenProvider()

  const displayStatus = getDisplayStatus(resource)
  const billingAddress = resource.billing_address

  return (
    <Link href={appRoutes.details.makePath(resource.id)}>
      <ListItem
        tag='a'
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
            {resource.market?.name} #{resource.number}
          </Text>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {formatDate({
              format: 'date',
              isoDate: resource.updated_at,
              timezone: user?.timezone
            })}
            {' · '}
            {!isEmpty(billingAddress?.company)
              ? billingAddress?.company
              : formatDisplayName(
                  billingAddress?.first_name ?? '',
                  billingAddress?.last_name ?? ''
                )}
            {' · '}
            {displayStatus.task != null ? (
              <Text weight='bold' size='small' variant='warning'>
                {displayStatus.task}
              </Text>
            ) : (
              displayStatus.label
            )}
          </Text>
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
    </Link>
  )
}

export const ListItemOrder = withSkeletonTemplate(ListItemOrderComponent)
