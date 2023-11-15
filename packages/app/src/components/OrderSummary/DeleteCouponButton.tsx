import {
  RemoveButton,
  useCoreSdkProvider,
  withSkeletonTemplate,
  type ResourceOrderSummaryProps
} from '@commercelayer/app-elements'
import { useState } from 'react'

export const DeleteCouponButton = withSkeletonTemplate<
  Pick<ResourceOrderSummaryProps, 'onChange' | 'order'>
>(({ order, onChange }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [isDeleting, setIsDeleting] = useState(false)
  return (
    <RemoveButton
      disabled={isDeleting}
      onClick={() => {
        setIsDeleting(true)
        void sdkClient.orders
          .update({
            id: order.id,
            coupon_code: null
          })
          .finally(() => {
            setIsDeleting(false)
            onChange?.()
          })
      }}
    />
  )
})
