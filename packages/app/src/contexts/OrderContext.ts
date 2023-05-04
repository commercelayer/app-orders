import { makeOrder } from '#mocks'
import { type Order } from '@commercelayer/sdk'
import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction
} from 'react'

interface Context {
  order: Order
  setOrder: Dispatch<SetStateAction<Order>>
  refreshOrder: () => void
}

export const OrderContext = createContext<Context>({
  order: makeOrder(),
  setOrder: () => {},
  refreshOrder: () => {}
})

export const useOrderContext = (): Context => useContext(OrderContext)
