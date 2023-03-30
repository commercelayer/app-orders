import { makeOrder } from '#mocks'
import { type Order } from '@commercelayer/sdk'
import {
  createContext,
  useContext,
  type Dispatch,
  type SetStateAction
} from 'react'

type Context = [Order, Dispatch<SetStateAction<Order>>]

export const OrderContext = createContext<Context>([makeOrder(), () => {}])
export const useOrderContext = (): Context => useContext(OrderContext)
