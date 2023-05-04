import {
  Icon,
  Legend,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { z } from 'zod'

interface Props {
  order: Order
}

const paymentInstrumentType = z.object({
  issuer_type: z.string(),
  card_type: z.string().transform((brand) => {
    return brand
      .toLowerCase()
      .split(' ')
      .map((word) => {
        const firstLetter = word.charAt(0).toUpperCase()
        const rest = word.slice(1).toLowerCase()

        return firstLetter + rest
      })
      .join(' ')
  }),
  card_last_digits: z.string(),
  card_expiry_month: z.string(),
  card_expiry_year: z.string()
})

export const OrderPayment = withSkeletonTemplate<Props>(({ order }) => {
  const paymentInstrument = paymentInstrumentType.safeParse(
    // @ts-expect-error At the moment 'payment_instrument' does not exist on type 'SatispayPayment'.
    order.payment_source?.payment_instrument
  )

  if (order.payment_method?.name == null) {
    return null
  }

  return (
    <>
      <Legend title='Payment method' />
      <ListItem
        key={order.payment_method?.id}
        tag='div'
        icon={<Icon name='creditCard' background='teal' gap='large' />}
      >
        {paymentInstrument.success ? (
          <div>
            <Text tag='div' weight='semibold'>
              {paymentInstrument.data.card_type}{' '}
              {paymentInstrument.data.issuer_type}&nbsp;&nbsp;··
              {paymentInstrument.data.card_last_digits}
            </Text>
            <Text size='small' tag='div' variant='info' weight='medium'>
              {order.payment_method.name}
            </Text>
          </div>
        ) : (
          <div>
            <Text tag='div' weight='semibold'>
              {order.payment_method.name}
            </Text>
          </div>
        )}
      </ListItem>
    </>
  )
})
