import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  List,
  ListItem,
  PageLayout,
  RadialProgress,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
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

  const { adapters, SearchWithNav } = useResourceFilters({
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
          <List title='Open'>
            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.awaitingApproval
                })
              )}
            >
              <ListItem
                tag='a'
                icon={
                  <StatusIcon
                    name='arrowDown'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.awaitingApproval.viewTitle}{' '}
                  {formatCounter(counters?.awaitingApproval)}
                </Text>
                <StatusIcon name='caretRight' />
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
                  <StatusIcon
                    name='creditCard'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.paymentToCapture.viewTitle}{' '}
                  {formatCounter(counters?.paymentToCapture)}
                </Text>
                <StatusIcon name='caretRight' />
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
                  <StatusIcon
                    name='arrowClockwise'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.fulfillmentInProgress.viewTitle}{' '}
                  {formatCounter(counters?.fulfillmentInProgress)}
                </Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>

            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.editing
                })
              )}
            >
              <ListItem
                tag='a'
                icon={
                  <StatusIcon
                    name='pencilSimple'
                    background='orange'
                    gap='small'
                  />
                }
              >
                <Text weight='semibold'>
                  {presets.editing.viewTitle} {formatCounter(counters?.editing)}
                </Text>
                <StatusIcon name='caretRight' />
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
                icon={
                  <StatusIcon name='asterisk' background='black' gap='small' />
                }
              >
                <Text weight='semibold'>{presets.history.viewTitle}</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
            <Link
              href={appRoutes.list.makePath(
                adapters.adaptFormValuesToUrlQuery({
                  formValues: presets.pending
                })
              )}
            >
              <ListItem tag='a' icon={<RadialProgress size='small' />}>
                <Text weight='semibold'>{presets.pending.viewTitle}</Text>
                <StatusIcon name='caretRight' />
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
                icon={<StatusIcon name='minus' background='gray' gap='small' />}
              >
                <Text weight='semibold'>{presets.archived.viewTitle}</Text>
                <StatusIcon name='caretRight' />
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
