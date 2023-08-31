import { AddressForm, type AddressFormValues } from '#components/AddressForm'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import { isMock, makeOrder } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import {
  type Address,
  type AddressUpdate,
  type Order
} from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function EditAddress(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string; addressId: string }>(
    appRoutes.editAddress.path
  )

  const [order, setOrder] = useState<Order | null>(makeOrder())
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)
  const isLoading = useMemo(() => order != null && isMock(order), [order])

  const orderId = params?.orderId
  const addressId = params?.addressId
  const goBackUrl =
    orderId != null
      ? appRoutes.details.makePath(orderId)
      : appRoutes.home.makePath()

  useEffect(() => {
    if (orderId != null) {
      sdkClient.orders
        .retrieve(orderId, {
          fields: ['shipping_address', 'billing_address'],
          include: ['shipping_address', 'billing_address']
        })
        .then(setOrder)
        .catch(() => {
          setOrder(null)
        })
    }
  }, [orderId])

  const { address, type } = getAddressById(order, addressId)
  const isInvalidAddress = !isLoading && address == null

  if (isInvalidAddress || !canUser('update', 'addresses')) {
    return (
      <PageLayout
        title='Edit address'
        onGoBack={() => {
          setLocation(goBackUrl)
        }}
      >
        <EmptyState
          title='Not found'
          description='Address is invalid or you are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle =
    type === 'shipping_address'
      ? 'Edit shipping address'
      : 'Edit billing address'

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      onGoBack={() => {
        setLocation(goBackUrl)
      }}
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        {address != null && type != null ? (
          <AddressForm
            defaultValues={adaptAddressToFormValues(address)}
            showBillingInfo={type === 'billing_address'}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              void sdkClient.addresses
                .update(adaptFormValuesToAddress(formValues, address.id))
                .then(() => {
                  setLocation(goBackUrl)
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

function adaptAddressToFormValues(address?: Address): AddressFormValues {
  return {
    first_name: address?.first_name ?? '',
    last_name: address?.last_name ?? '',
    company: address?.company ?? '',
    line_1: address?.line_1 ?? '',
    line_2: address?.line_2 ?? '',
    city: address?.city ?? '',
    zip_code: address?.zip_code ?? '',
    state_code: address?.state_code ?? '',
    country_code: address?.country_code ?? '',
    phone: address?.phone ?? '',
    billing_info: address?.billing_info ?? ''
  }
}

function adaptFormValuesToAddress(
  formValues: AddressFormValues,
  addressId: string
): AddressUpdate {
  return {
    id: addressId,
    ...formValues
  }
}

function getAddressById(
  order: Order | null,
  addressId?: string
): {
  type?: 'shipping_address' | 'billing_address'
  address?: Address | null
} {
  if (order == null) {
    return {}
  }

  const type =
    order.billing_address?.id === addressId
      ? 'billing_address'
      : order.shipping_address?.id === addressId
      ? 'shipping_address'
      : undefined

  const address = type != null && order != null ? order[type] : null

  return {
    type,
    address
  }
}
