import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { FiltersTimeRange } from '#pages/FiltersTimeRange'
import { OrderDetails } from '#pages/OrderDetails'
import {
  CoreSdkProvider,
  ErrorBoundary,
  TokenProvider
} from '@commercelayer/app-elements'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'
import { OrderList } from '#pages/OrderList'
import { Home } from '#pages/Home'

const isDev = Boolean(import.meta.env.DEV)

export function App(): JSX.Element {
  return (
    <ErrorBoundary hasContainer>
      <TokenProvider
        clientKind={isDev ? 'integration' : 'webapp'}
        currentApp='orders'
        domain={window.clAppConfig.domain}
        reauthenticateOnInvalidAuth={!isDev}
        devMode={isDev}
        loadingElement={<div />}
      >
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
              <Route>
                <ErrorNotFound />
              </Route>
            </Switch>
          </Router>
        </CoreSdkProvider>
      </TokenProvider>
    </ErrorBoundary>
  )
}
