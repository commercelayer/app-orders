import { EditAddress } from '#pages/EditAddress'
import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { FiltersTimeRange } from '#pages/FiltersTimeRange'
import { Home } from '#pages/Home'
import { OrderDetails } from '#pages/OrderDetails'
import { OrderList } from '#pages/OrderList'
import { Refund } from '#pages/Refund'
import {
  CoreSdkProvider,
  ErrorBoundary,
  MetaTags,
  TokenProvider
} from '@commercelayer/app-elements'
import { SWRConfig } from 'swr'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

const isDev = Boolean(import.meta.env.DEV)

export function App(): JSX.Element {
  return (
    <ErrorBoundary hasContainer>
      <SWRConfig
        value={{
          revalidateOnFocus: false
        }}
      >
        <TokenProvider
          kind='orders'
          appSlug='orders'
          domain={window.clAppConfig.domain}
          reauthenticateOnInvalidAuth={!isDev}
          devMode={isDev}
          loadingElement={<div />}
        >
          <MetaTags />
          <CoreSdkProvider>
            <Router base='/orders'>
              <Switch>
                <Route path={appRoutes.home.path}>
                  <Home />
                </Route>
                <Route path={appRoutes.listHistory.path}>
                  <OrderList type='history' />
                </Route>
                <Route path={appRoutes.listArchived.path}>
                  <OrderList type='archived' />
                </Route>
                <Route path={appRoutes.listAwaitingApproval.path}>
                  <OrderList type='awaitingApproval' />
                </Route>
                <Route path={appRoutes.listPaymentToCapture.path}>
                  <OrderList type='paymentToCapture' />
                </Route>
                <Route path={appRoutes.listFulfillmentInProgress.path}>
                  <OrderList type='fulfillmentInProgress' />
                </Route>
                <Route path={appRoutes.filters.path}>
                  <Filters />
                </Route>
                <Route path={appRoutes.filtersTimeRange.path}>
                  <FiltersTimeRange />
                </Route>
                <Route path={appRoutes.details.path}>
                  <OrderDetails />
                </Route>
                <Route path={appRoutes.editAddress.path}>
                  <EditAddress />
                </Route>
                <Route path={appRoutes.refund.path}>
                  <Refund />
                </Route>
                <Route>
                  <ErrorNotFound />
                </Route>
              </Switch>
            </Router>
          </CoreSdkProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
