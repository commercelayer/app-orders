import {
  Legend,
  Spacer,
  Stack,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Address, Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

function renderAddress(
  label: string,
  address: Address | undefined | null
): JSX.Element | null {
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
      <Text tag='div' variant='info'>
        {address.full_name}
        <br />
        {address.line_1} {address.line_2}
        <br />
        {address.city} {address.state_code} {address.zip_code} (
        {address.country_code})
      </Text>
    </div>
  )
}

export const OrderAddresses = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    if (order.shipping_address == null && order.billing_address == null) {
      return null
    }

    return (
      <>
        <Legend border='none' title='Addresses' />
        <Stack>
          {renderAddress('Shipping address', order.shipping_address)}
          {renderAddress('Billing address', order.billing_address)}
        </Stack>
      </>
    )
  }
)
