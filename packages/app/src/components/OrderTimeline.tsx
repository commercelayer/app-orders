import { getTransactionPastTense } from '#data/dictionaries'
import {
  Legend,
  Spacer,
  Timeline,
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

interface TimelineReducerAction {
  type: 'add'
  payload: TimelineEvent
}

function getFulfillmentMessage(status: Order['fulfillment_status']): string {
  switch (status) {
    case 'fulfilled':
      return 'Fulfilled'
    case 'in_progress':
      return 'Fulfillment in progress'
    case 'not_required':
      return 'Fulfillment not required'
    case 'unfulfilled':
      return 'Unfulfilled'
  }
}

const timelineReducer: Reducer<TimelineEvent[], TimelineReducerAction> = (
  state,
  action
) => {
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

const useTimelineReducer = (
  order: Order
): [TimelineEvent[], React.Dispatch<TimelineReducerAction>] => {
  const [events, dispatch] = useReducer(timelineReducer, [])

  useEffect(
    function addPlaced() {
      if (order.placed_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: order.placed_at,
            message: 'Placed'
          }
        })
      }
    },
    [order.placed_at]
  )

  useEffect(
    function addCancelled() {
      if (order.cancelled_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: order.cancelled_at,
            message: 'Cancelled'
          }
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
          payload: {
            date: order.fulfillment_updated_at,
            message: getFulfillmentMessage(order.fulfillment_status)
          }
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
            payload: {
              date: transaction.created_at,
              message: `Payment of ${transaction.formatted_amount} ${name} ${paymentInfo}`
            }
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
          if (attachment.description != null) {
            dispatch({
              type: 'add',
              payload: {
                date: attachment.updated_at,
                message: (
                  <span>
                    <b>{attachment.name}</b> left a note
                  </span>
                ),
                note: attachment.description
              }
            })
          }
        })
      }
    },
    [order.attachments]
  )

  useEffect(
    function addApproved() {
      if (order.approved_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: order.approved_at,
            message: 'Approved'
          }
        })
      }
    },
    [order.approved_at]
  )

  return [events, dispatch]
}

export const OrderTimeline = withSkeletonTemplate<Props>(({ order }) => {
  const [events, dispatch] = useTimelineReducer(order)

  return (
    <>
      <Legend title='Timeline' />
      <Spacer top='8'>
        <Timeline
          events={events}
          onKeyDown={(event) => {
            if (event.code === 'Enter' && event.currentTarget.value !== '') {
              dispatch({
                type: 'add',
                payload: {
                  date: new Date().toISOString(),
                  message: (
                    <span>
                      <b>M. Montalbano</b> left a note
                    </span>
                  ),
                  note: event.currentTarget.value
                }
              })

              event.currentTarget.value = ''
            }
          }}
        />
      </Spacer>
    </>
  )
})
