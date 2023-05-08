import { useOrderContext } from '#contexts/OrderContext'
import { getTransactionPastTense } from '#data/dictionaries'
import {
  Legend,
  Spacer,
  Timeline,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate,
  type TimelineEvent
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useEffect, useReducer, type Reducer } from 'react'

interface Props {
  order: Order
}

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
    function addArchived() {
      if (order.archived_at != null) {
        dispatch({
          type: 'add',
          payload: {
            date: order.archived_at,
            message: 'Archived'
          }
        })
      }
    },
    [order.archived_at]
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
      if (order.transactions != null) {
        order.transactions.forEach((transaction) => {
          const name = getTransactionPastTense(transaction.type)

          dispatch({
            type: 'add',
            payload: {
              date: transaction.created_at,
              message: `Payment of ${transaction.formatted_amount} ${name}`
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
  const [events] = useTimelineReducer(order)
  const { sdkClient } = useCoreSdkProvider()
  const {
    user: { displayName }
  } = useTokenProvider()
  const { refreshOrder } = useOrderContext()

  return (
    <>
      <Legend title='Timeline' />
      <Spacer top='8'>
        <Timeline
          events={events}
          onKeyDown={(event) => {
            if (event.code === 'Enter' && event.currentTarget.value !== '') {
              if (displayName != null && displayName !== '') {
                void sdkClient.attachments
                  .create({
                    name: displayName,
                    description: event.currentTarget.value,
                    attachable: { type: 'orders', id: order.id }
                  })
                  .then(() => {
                    refreshOrder()
                  })
              } else {
                console.warn(
                  `Cannot create the attachment: token does not contain a valid "user".`
                )
              }

              event.currentTarget.value = ''
            }
          }}
        />
      </Spacer>
    </>
  )
})
