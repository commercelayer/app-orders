import {
  Button,
  Overlay as OverlayElement,
  PageHeading
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useCallback, useState } from 'react'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ order: Order; onConfirm: () => void }>
}

export function useCancelOverlay(): OverlayHook {
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
              title={`Confirm that you want to cancel order ${
                order.market?.name ?? ''
              } #${order.number ?? ''}`}
              onGoBack={() => {
                setIsVisible(false)
              }}
              description='This action cannot be undone, proceed with caution.'
            />

            <Button
              variant='danger'
              fullWidth
              onClick={() => {
                onConfirm()
                setIsVisible(false)
              }}
            >
              Cancel
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
