import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useTokenProvider,
  SearchBar,
  Spacer,
  List,
  ListItem,
  Icon,
  Text,
  SkeletonTemplate
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'
import { filtersAdapters } from '#data/filters'
import { useListCounters } from '../metricsApi/useListCounters'

export function Home(): JSX.Element {
  const {
    dashboardUrl,
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const { data: counters, isLoading: isLoadingCounters } = useListCounters()

  return (
    <PageLayout
      title='Orders'
      mode={mode}
      gap='only-top'
      onGoBack={() => {
        window.location.href =
          dashboardUrl != null ? `${dashboardUrl}/hub` : '/'
      }}
    >
      <Spacer top='4' bottom='14'>
        <SearchBar
          placeholder='Search...'
          onClear={() => {}}
          onSearch={(hint) => {
            setLocation(
              appRoutes.listHistory.makePath(
                filtersAdapters.fromFormValuesToUrlQuery({
                  status: [],
                  market: [],
                  fulfillmentStatus: [],
                  paymentStatus: [],
                  text: hint
                })
              )
            )
          }}
        />
      </Spacer>

      <SkeletonTemplate isLoading={isLoadingCounters}>
        <Spacer bottom='14'>
          <List title='Pending'>
            <Link href={appRoutes.listAwaitingApproval.makePath()}>
              <ListItem
                tag='a'
                icon={<Icon name='arrowDown' background='orange' gap='small' />}
              >
                <Text weight='semibold'>
                  Awaiting approval {formatCounter(counters?.awaitingApproval)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={appRoutes.listPaymentToCapture.makePath()}>
              <ListItem
                tag='a'
                icon={
                  <Icon name='creditCard' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  Payment to capture {formatCounter(counters?.paymentToCapture)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>

            <Link href={appRoutes.listFulfillmentInProgress.makePath()}>
              <ListItem
                tag='a'
                icon={
                  <Icon name='arrowClockwise' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  Fulfillment in progress{' '}
                  {formatCounter(counters?.fulfillmentInProgress)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>

        <Spacer bottom='14'>
          <List title='Browse'>
            <Link href={appRoutes.listHistory.makePath()}>
              <ListItem
                tag='a'
                icon={<Icon name='asterisk' background='black' gap='small' />}
              >
                <Text weight='semibold'>Order history</Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
            <Link href={appRoutes.listArchived.makePath()}>
              <ListItem
                tag='a'
                icon={<Icon name='minus' background='gray' gap='small' />}
              >
                <Text weight='semibold'>Archived</Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

function formatCounter(counter = 0): string {
  return `(${Intl.NumberFormat().format(counter)})`
}
