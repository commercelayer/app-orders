import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  ActionButtons,
  Alert,
  Button,
  ResourceLineItems,
  Section,
  Spacer,
  Text,
  useTokenProvider,
  withSkeletonTemplate,
  type ResourceLineItemsProps
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { DeleteCouponButton } from './DeleteCouponButton'
import { HeaderActions } from './HeaderActions'
import { SummaryRows } from './SummaryRows'
import { useAddCouponOverlay } from './hooks/useAddCouponOverlay'
import { useFooterActions } from './hooks/useFooterActions'
import { useOrderStatus } from './hooks/useOrderStatus'
import { renderTotalRow } from './utils'

interface Props {
  order: Order
}

export const OrderSummary = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    const { canUser } = useTokenProvider()
    const { mutateOrder } = useOrderDetails(order.id)
    const {
      actions,
      errors,
      dispatch,
      CancelOverlay,
      CaptureOverlay,
      SelectShippingMethodOverlay
    } = useFooterActions({ order })

    const { isEditing, diffTotalAndPlacedTotal } = useOrderStatus(order)

    const { Overlay: AddCouponOverlay, open: openAddCouponOverlay } =
      useAddCouponOverlay(order, () => {
        void mutateOrder()
      })

    const footer: ResourceLineItemsProps['footer'] = []

    if (isEditing || order.coupon_code != null) {
      footer.push({
        key: 'coupon',
        element: (
          <Spacer top='4' bottom='4'>
            <AddCouponOverlay />
            {renderTotalRow({
              label: 'Coupon',
              value:
                order.coupon_code == null ? (
                  <Button
                    variant='link'
                    onClick={() => {
                      openAddCouponOverlay()
                    }}
                  >
                    Add coupon
                  </Button>
                ) : (
                  <div className='flex gap-3'>
                    {order.coupon_code}
                    {isEditing && (
                      <DeleteCouponButton
                        order={order}
                        onChange={() => {
                          void mutateOrder()
                        }}
                      />
                    )}
                  </div>
                )
            })}
          </Spacer>
        )
      })
    }

    footer.push({
      key: 'summary',
      element: (
        <>
          <SummaryRows order={order} editable={isEditing} />
          {diffTotalAndPlacedTotal != null && (
            <Spacer bottom='8'>
              <Alert status='warning'>
                The new total is {order.formatted_total_amount_with_taxes},{' '}
                {diffTotalAndPlacedTotal} more than the original total.
                <br />
                Adjust the total to make it equal or less.
              </Alert>
            </Spacer>
          )}
        </>
      )
    })

    return (
      <Section title='Summary' actionButton={<HeaderActions order={order} />}>
        <ResourceLineItems
          items={order.line_items ?? []}
          editable={isEditing}
          onChange={() => {
            void mutateOrder()
          }}
          footer={footer}
        />

        {canUser('update', 'orders') && <ActionButtons actions={actions} />}

        {renderErrorMessages(errors)}

        <CaptureOverlay
          order={order}
          onConfirm={() => {
            void dispatch('_capture')
          }}
        />

        <CancelOverlay
          order={order}
          onConfirm={() => {
            void dispatch('_cancel')
          }}
        />

        <SelectShippingMethodOverlay order={order} />
      </Section>
    )
  }
)

function renderErrorMessages(errors?: string[]): JSX.Element {
  return errors != null && errors.length > 0 ? (
    <Spacer top='4'>
      {errors.map((message, idx) => (
        <Text key={idx} variant='danger'>
          {message}
        </Text>
      ))}
    </Spacer>
  ) : (
    <></>
  )
}
