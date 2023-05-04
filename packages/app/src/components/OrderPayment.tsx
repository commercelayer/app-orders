import {
  Icon,
  Legend,
  ListItem,
  Spacer,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order, PaymentMethod } from '@commercelayer/sdk'
import { z } from 'zod'

interface Props {
  order: Order
}

const paymentInstrumentType = z.object({
  issuer_type: z.string(),
  card_type: z
    .string()
    .optional()
    .transform((brand) => {
      if (brand == null) {
        return brand
      }

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
  card_last_digits: z.string().optional(),
  card_expiry_month: z.string().optional(),
  card_expiry_year: z.string().optional()
})

const renderPayment = (
  order: Order & { payment_method: PaymentMethod }
): JSX.Element => {
  const paymentInstrument = paymentInstrumentType.safeParse(
    // @ts-expect-error At the moment 'payment_instrument' does not exist on type 'SatispayPayment'.
    order.payment_source?.payment_instrument
  )

  return paymentInstrument.success ? (
    <div>
      <Text tag='div' weight='semibold'>
        {paymentInstrument.data.card_type != null ? (
          <span>
            {paymentInstrument.data.card_type}{' '}
            {paymentInstrument.data.issuer_type}
            <Spacer left='2' style={{ display: 'inline-block' }}>
              ··{paymentInstrument.data.card_last_digits}
            </Spacer>
          </span>
        ) : (
          paymentInstrument.data.issuer_type
        )}
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
  )
}

function hasPaymentMethod(
  order: Order
): order is Order & { payment_method: PaymentMethod } {
  return order.payment_method?.name != null
}

export const OrderPayment = withSkeletonTemplate<Props>(({ order }) => {
  return (
    <>
      <Legend title='Payment method' />
      {hasPaymentMethod(order) ? (
        <ListItem
          key={order.payment_method?.id}
          tag='div'
          icon={<Icon name='creditCard' background='teal' gap='large' />}
        >
          {renderPayment(order)}
        </ListItem>
      ) : (
        <Spacer top='6' bottom='6'>
          {' '}
          This order doesn't have a payment method.
        </Spacer>
      )}
    </>
  )
})
