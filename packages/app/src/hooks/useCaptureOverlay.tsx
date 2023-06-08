import { PaymentMethod, hasPaymentMethod } from '#components/PaymentMethod'
import {
  Button,
  ListDetails,
  ListDetailsItem,
  Overlay as OverlayElement,
  PageHeading,
  Spacer
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ order: Order; onConfirm: () => void }>
}

export function useCaptureOverlay(): OverlayHook {
  const [isVisible, setIsVisible] = useState(false)

  const show = useCallback(() => {
    setIsVisible(true)
  }, [])

  const Overlay: React.FC<{ order: Order; onConfirm: () => void }> =
    useCallback(
      ({ order, onConfirm }) => {
        return isVisible ? (
          <OverlayElement>
            <PageHeading
              title='Confirm capture'
              onGoBack={() => {
                setIsVisible(false)
              }}
              description='This action cannot be undone, proceed with caution.'
            />

            <Spacer bottom='14'>
              <ListDetails>
                <ListDetailsItem label='Order'>#{order.number}</ListDetailsItem>
                <ListDetailsItem label='Customer'>
                  {order.customer_email}
                </ListDetailsItem>
                <ListDetailsItem label='Payment method'>
                  {hasPaymentMethod(order) ? (
                    <PaymentMethod order={order} />
                  ) : (
                    '-'
                  )}
                </ListDetailsItem>
                <ListDetailsItem label='Amount'>
                  {order.formatted_total_amount}
                </ListDetailsItem>
              </ListDetails>
            </Spacer>
            <Button
              fullWidth
              onClick={() => {
                onConfirm()
                setIsVisible(false)
              }}
            >
              Capture {order.formatted_total_amount}
            </Button>
          </OverlayElement>
        ) : null
      },
      [isVisible]
    )

  return {
    show,
    Overlay
  }
}
