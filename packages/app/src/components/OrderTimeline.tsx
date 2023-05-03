import { getTransactionPastTense } from '#data/dictionaries'
import {
  Legend,
  Spacer,
  Timeline,
  formatDate,
  timeSeparator,
  useTokenProvider,
  withSkeletonTemplate,
  type TimelineEvent
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useEffect, useReducer, type Reducer } from 'react'
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

function createTimelineEvent({
  date,
  message,
  note,
  timezone
}: {
  date: string
  message: string
  note?: string
  timezone?: string
}): TimelineEvent {
  return {
    date,
    note,
    message: `${message} ${timeSeparator} ${formatDate({
      format: 'time',
      isoDate: date,
      timezone
    })}`
  }
}

const timelineReducer: Reducer<
  TimelineEvent[],
  { type: 'add'; payload: TimelineEvent }
> = (state, action) => {
  switch (action.type) {
    case 'add':
      if (state.find((s) => s.date === action.payload.date) != null) {
        return state
      }

      return [...state, action.payload]
    default:
      return state
  }
}

export const OrderTimeline = withSkeletonTemplate<Props>(({ order }) => {
  const {
    settings: { timezone }
  } = useTokenProvider()

  const [events, dispatch] = useReducer(timelineReducer, [])

  useEffect(
    function addPlacedAt() {
      if (order.placed_at != null) {
        dispatch({
          type: 'add',
          payload: createTimelineEvent({
            date: order.placed_at,
            message: `Placed`,
            timezone
          })
        })
      }
    },
    [order.placed_at]
  )

  useEffect(
    function addCancelledAt() {
      if (order.cancelled_at != null) {
        dispatch({
          type: 'add',
          payload: createTimelineEvent({
            date: order.cancelled_at,
            message: `Cancelled`,
            timezone
          })
        })
      }
    },
    [order.cancelled_at]
  )

  useEffect(
    function addFulfillmentStatus() {
      if (
        order.fulfillment_updated_at != null &&
        order.fulfillment_status !== 'unfulfilled'
      ) {
        dispatch({
          type: 'add',
          payload: createTimelineEvent({
            date: order.fulfillment_updated_at,
            message:
              order.fulfillment_status === 'fulfilled'
                ? 'Fulfilled'
                : order.fulfillment_status === 'in_progress'
                ? 'Fulfillment in progress'
                : order.fulfillment_status === 'not_required'
                ? 'Fulfillment not required'
                : '',
            timezone
          })
        })
      }
    },
    [order.fulfillment_updated_at, order.fulfillment_status]
  )

  useEffect(
    function addTransactions() {
      const paymentMethodName =
        order.payment_method?.name != null ? order.payment_method?.name : ''

      let paymentInfo = `on ${paymentMethodName}`

      const paymentInstrument = paymentInstrumentType.safeParse(
        // @ts-expect-error At the moment 'payment_instrument' does not exist on type 'SatispayPayment'.
        order.payment_source?.payment_instrument
      )

      if (paymentInstrument.success) {
        paymentInfo = `on ${paymentInstrument.data.card_type} ending in ${paymentInstrument.data.card_last_digits} (via ${paymentMethodName})`
      }

      if (order.transactions != null) {
        order.transactions.forEach((transaction) => {
          const name = getTransactionPastTense(transaction.type)

          dispatch({
            type: 'add',
            payload: createTimelineEvent({
              date: transaction.created_at,
              message: `Payment of ${transaction.formatted_amount} ${name} ${paymentInfo}`,
              timezone
            })
          })
        })
      }
    },
    [order.transactions]
  )

  useEffect(
    function addAttachments() {
      if (order.attachments != null) {
        order.attachments.forEach((attachment) => {
          dispatch({
            type: 'add',
            payload: createTimelineEvent({
              date: attachment.created_at,
              message: `${attachment.name} left a note`,
              note: attachment.description ?? '',
              timezone
            })
          })
        })
      }
    },
    [order.attachments]
  )

  useEffect(
    function addApprovedAt() {
      if (order.approved_at != null) {
        dispatch({
          type: 'add',
          payload: createTimelineEvent({
            date: order.approved_at,
            message: 'Approved',
            timezone
          })
        })
      }
    },
    [order.approved_at]
  )

  return (
    <>
      <Legend title='Timeline' />
      <Spacer top='8'>
        <Timeline
          events={events}
          onKeyDown={(event) => {
            if (event.code === 'Enter') {
              dispatch({
                type: 'add',
                payload: createTimelineEvent({
                  date: new Date().toISOString(),
                  message: `Marco left a note`,
                  note: event.currentTarget.value,
                  timezone
                })
              })

              event.currentTarget.value = ''
            }
          }}
        />
      </Spacer>
    </>
  )
})
