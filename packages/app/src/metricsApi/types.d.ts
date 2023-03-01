interface MetricsApiOrdersSearchData {
  id: string
  fulfillment_status: 'fulfilled' | 'unfulfilled' | 'in_progress'
  total_amount: number
  payment_status: 'unpaid' | 'authorized' | 'paid' | 'voided' | 'refunded'
  created_at: string
  status: 'draft' | 'pending' | 'placed' | 'approved' | 'cancelled'
  market?: {
    name: string
    id: string
  }
  customer?: {
    email: string
  }
}

interface VndApiResponse<Data extends any> {
  data: Data[]
  meta: {
    pagination: {
      record_count: number
      cursor: string | null
    }
  }
}
