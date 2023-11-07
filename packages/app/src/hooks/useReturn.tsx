import { isMock } from '#mocks'
import { useCoreApi, useCoreSdkProvider } from '@commercelayer/app-elements'
import type { Order, Return } from '@commercelayer/sdk'
import { useEffect, useState } from 'react'

export function useReturn(order: Order): Return | undefined {
  const [returnObj, setReturnObj] = useState<Return>()
  const [returnNeedsCreation, setReturnNeedsCreation] = useState(false)

  const { sdkClient } = useCoreSdkProvider()
  const { data: createdReturnObj } = useCoreApi(
    'returns',
    'create',
    returnNeedsCreation
      ? [
          {
            order: sdkClient.orders.relationship(order.id)
          },
          {
            include: ['origin_address', 'destination_address']
          }
        ]
      : null
  )

  useEffect(() => {
    if (!isMock(order)) {
      const draftReturnObject = order.returns?.filter(
        (returnObj) =>
          returnObj.status === 'draft' &&
          (returnObj.return_line_items ?? []).length === 0
      )[0]
      if (draftReturnObject != null) {
        setReturnObj(draftReturnObject)
      } else {
        setReturnNeedsCreation(true)
      }
    }
  }, [order])

  useEffect(() => {
    if (createdReturnObj != null) {
      setReturnObj(createdReturnObj)
    }
  }, [createdReturnObj])

  return returnObj
}
