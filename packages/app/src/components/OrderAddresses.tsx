import { appRoutes } from '#data/routes'
import {
  Section,
  Spacer,
  Stack,
  Text,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Address, Order } from '@commercelayer/sdk'
import { Link } from 'wouter'

interface Props {
  order: Order
}

function renderAddress({
  label,
  address,
  editUrl,
  isSameAsBilling,
  showBillingInfo
}: {
  label: string
  address: Address | undefined | null
  editUrl?: string
  isSameAsBilling?: boolean
  showBillingInfo?: boolean
}): JSX.Element | null {
  if (isSameAsBilling === true) {
    return (
      <div>
        <Spacer bottom='2'>
          <Text tag='div' weight='bold'>
            {label}
          </Text>
        </Spacer>
        <Text tag='div' variant='info'>
          Same as billing
        </Text>
      </div>
    )
  }

  if (address == null) {
    return null
  }

  return (
    <div>
      <Spacer bottom='2'>
        <Text tag='div' weight='bold'>
          {label}
        </Text>
      </Spacer>
      <Spacer bottom='4'>
        <Text tag='div' variant='info'>
          {address.full_name}
          <br />
          {address.line_1} {address.line_2}
          <br />
          {address.city} {address.state_code} {address.zip_code} (
          {address.country_code})
          <br />
          {address.phone}
        </Text>
        {address.billing_info != null && showBillingInfo === true ? (
          <Text tag='div' variant='info'>
            {address.billing_info}
          </Text>
        ) : null}
      </Spacer>
      {editUrl != null ? (
        <Link href={editUrl}>
          <a>Edit</a>
        </Link>
      ) : null}
    </div>
  )
}

export const OrderAddresses = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const { canUser } = useTokenProvider()

    if (order.shipping_address == null && order.billing_address == null) {
      return null
    }

    const makeEditUrl = (addressId?: string): string | undefined =>
      addressId != null && canUser('update', 'addresses')
        ? appRoutes.editAddress.makePath(order.id, addressId)
        : undefined

    const isSameAsBilling =
      order.shipping_address?.id === order.billing_address?.id

    return (
      <Section border='none' title='Addresses'>
        <Stack>
          {renderAddress({
            label: 'Billing address',
            address: order.billing_address,
            showBillingInfo: true,
            editUrl: makeEditUrl(order.billing_address?.id)
          })}
          {renderAddress({
            label: 'Shipping address',
            address: order.shipping_address,
            editUrl: makeEditUrl(order.shipping_address?.id),
            showBillingInfo: false,
            isSameAsBilling
          })}
        </Stack>
      </Section>
    )
  }
)
