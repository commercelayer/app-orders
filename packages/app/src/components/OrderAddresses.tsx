import {
  Legend,
  Spacer,
  Stack,
  Text,
  withinSkeleton
} from '@commercelayer/app-elements'
import type { Address, Order } from '@commercelayer/sdk'
import type { JSX } from 'preact/jsx-runtime'

interface Props {
  order: Order
}

function renderAddress(address?: Address): JSX.Element | null {
  if (address === undefined) {
    return null
  }

  return (
    <>
      {address.full_name}
      <br />
      {address.line_1} {address.line_2}
      <br />
      {address.city} {address.state_code} {address.zip_code} (
      {address.country_code})
    </>
  )
}

export const OrderAddresses = withinSkeleton<Props>(
  ({ order }): JSX.Element => {
    return (
      <>
        <Legend border='none' title='Addresses' />
        <Stack>
          <div>
            <Spacer bottom='2'>
              <Text tag='div' weight='bold'>
                Shipping address
              </Text>
            </Spacer>
            <Text tag='div' variant='info'>
              {renderAddress(order.shipping_address)}
            </Text>
          </div>
          <div>
            <Spacer bottom='2'>
              <Text tag='div' weight='bold'>
                Billing address
              </Text>
            </Spacer>
            <Text tag='div' variant='info'>
              {renderAddress(order.billing_address)}
            </Text>
          </div>
        </Stack>
      </>
    )
  }
)
