import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  Icon,
  List,
  ListItem,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useFilters } from '@commercelayer/app-elements-hook-form'
import { Link, useLocation } from 'wouter'
import { useSearch } from 'wouter/use-location'
import { useListCounters } from '../metricsApi/useListCounters'

export function Home(): JSX.Element {
  const {
    dashboardUrl,
    settings: { mode }
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const search = useSearch()
  const { data: counters, isLoading: isLoadingCounters } = useListCounters()

  const { adapters, SearchWithNav } = useFilters({
    instructions
  })

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
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.list.makePath(qs))
        }}
        queryString={search}
      />

      <SkeletonTemplate isLoading={isLoadingCounters}>
        <Spacer bottom='14'>
          <List title='Pending'>
            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.awaitingApproval
                })
              )}
            >
              <ListItem
                tag='a'
                icon={<Icon name='arrowDown' background='orange' gap='small' />}
              >
                <Text weight='semibold'>
                  {presets.awaitingApproval.viewTitle}{' '}
                  {formatCounter(counters?.awaitingApproval)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.paymentToCapture
                })
              )}
            >
              <ListItem
                tag='a'
                icon={
                  <Icon name='creditCard' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  {presets.paymentToCapture.viewTitle}{' '}
                  {formatCounter(counters?.paymentToCapture)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.fulfillmentInProgress
                })
              )}
            >
              <ListItem
                tag='a'
                icon={
                  <Icon name='arrowClockwise' background='orange' gap='small' />
                }
              >
                <Text weight='semibold'>
                  {presets.fulfillmentInProgress.viewTitle}{' '}
                  {formatCounter(counters?.fulfillmentInProgress)}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
          </List>
        </Spacer>

        <Spacer bottom='14'>
          <List title='Browse'>
            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.history
                })
              )}
            >
              <ListItem
                tag='a'
                icon={<Icon name='asterisk' background='black' gap='small' />}
              >
                <Text weight='semibold'>{presets.history.viewTitle}</Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.archived
                })
              )}
            >
              <ListItem
                tag='a'
                icon={<Icon name='minus' background='gray' gap='small' />}
              >
                <Text weight='semibold'>{presets.archived.viewTitle}</Text>
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
