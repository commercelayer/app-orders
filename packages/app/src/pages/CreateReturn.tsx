import { FormReturn } from '#components/FormReturn'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import { useCreateReturnLineItems } from '#hooks/useCreateReturnLineItems'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { useReturn } from '#hooks/useReturn'
import { useReturnableList } from '#hooks/useReturnableList'
import { isMock } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  ResourceAddress,
  Section,
  SkeletonTemplate,
  Spacer,
  Stack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

export function CreateReturn(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.return.path)

  const orderId = params?.orderId
  const goBackUrl =
    orderId != null
      ? appRoutes.details.makePath(orderId)
      : appRoutes.home.makePath()

  const { order, isLoading, mutateOrder } = useOrderDetails(orderId ?? '')
  const returnObj = useReturn(order)

  const returnableLineItems = useReturnableList(order)
  const {
    createReturnLineItemsError,
    createReturnLineItems,
    isCreatingReturnLineItems
  } = useCreateReturnLineItems()

  if (returnObj == null || isMock(order)) return <></>

  if (
    order.fulfillment_status !== 'fulfilled' ||
    returnableLineItems.length === 0 ||
    !canUser('create', 'returns')
  ) {
    return (
      <PageLayout
        title='Request return'
        onGoBack={() => {
          setLocation(goBackUrl)
        }}
      >
        <EmptyState
          title='Permission Denied'
          description='You cannot create a return for this order or you are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          Request return
        </SkeletonTemplate>
      }
      onGoBack={() => {
        setLocation(goBackUrl)
      }}
    >
      <ScrollToTop />
      {returnableLineItems != null && returnableLineItems.length !== 0 && (
        <>
          <Spacer bottom='12'>
            <FormReturn
              defaultValues={{
                items: returnableLineItems?.map((item) => ({
                  quantity: item.quantity,
                  value: item.id
                }))
              }}
              lineItems={returnableLineItems}
              apiError={createReturnLineItemsError}
              onSubmit={(formValues) => {
                void createReturnLineItems(returnObj, formValues).then(() => {
                  void mutateOrder().finally(() => {
                    setLocation(goBackUrl)
                  })
                })
              }}
            />
          </Spacer>
          {returnObj.origin_address != null &&
            returnObj.destination_address != null && (
              <Spacer bottom='12'>
                <Section title='Addresses' border='none'>
                  <Stack>
                    <ResourceAddress
                      title='Origin'
                      resource={returnObj.origin_address}
                      editable
                      editPosition='bottom'
                    />
                    <ResourceAddress
                      title='Destination'
                      resource={returnObj.destination_address}
                      editable
                      editPosition='bottom'
                    />
                  </Stack>
                </Section>
              </Spacer>
            )}
          <Button
            type='submit'
            form='return-creation-form'
            fullWidth
            disabled={isCreatingReturnLineItems}
          >
            Request return
          </Button>
        </>
      )}
    </PageLayout>
  )
}
