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
        clientKind='integration'
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
              <Route path={appRoutes.history.path}>
                <OrderList type='history' />
              </Route>
              <Route path={appRoutes.archived.path}>
                <OrderList type='archived' />
              </Route>
              <Route path={appRoutes.awaitingApproval.path}>
                <OrderList type='awaitingApproval' />
              </Route>
              <Route path={appRoutes.paymentToCapture.path}>
                <OrderList type='paymentToCapture' />
              </Route>
              <Route path={appRoutes.fulfillmentInProgress.path}>
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
