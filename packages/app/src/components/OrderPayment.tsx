import {
  Avatar,
  Icon,
  Legend,
  ListItem,
  Spacer,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { AvatarProps } from '@commercelayer/app-elements/dist/ui/atoms/Avatar'
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

function getAvatarSrc(
  paymentType: string | null | undefined
): AvatarProps['src'] | undefined {
  switch (paymentType) {
    case 'adyen_payments':
      return 'payments:adyen'
    case 'axerve_payments':
      return 'payments:axerve'
    case 'braintree_payments':
      return 'payments:braintree'
    case 'checkout_com_payments':
      return 'payments:checkout'
    case 'klarna_payments':
      return 'payments:klarna'
    case 'paypal_payments':
      return 'payments:paypal'
    case 'satispay_payments':
      return 'payments:satispay'
    case 'stripe_payments':
      return 'payments:stripe'
    default:
      return undefined
  }
}

export const OrderPayment = withSkeletonTemplate<Props>(({ order }) => {
  const avatarSrc = getAvatarSrc(order.payment_method?.payment_source_type)
  const icon =
    avatarSrc != null ? (
      <Avatar
        src={avatarSrc}
        alt={order.payment_method?.name ?? ''}
        shape='circle'
        size='small'
      />
    ) : (
      <Icon name='creditCard' background='teal' gap='large' />
    )
  return (
    <>
      <Legend title='Payment method' />
      {hasPaymentMethod(order) ? (
        <ListItem tag='div' icon={icon}>
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
