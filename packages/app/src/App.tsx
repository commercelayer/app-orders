import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { FiltersTimeRange } from '#pages/FiltersTimeRange'
import { OrderDetails } from '#pages/OrderDetails'
import { OrderHistory } from '#pages/OrderHistory'
import {
  CoreSdkProvider,
  ErrorBoundary,
  TokenProvider
} from '@commercelayer/app-elements'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

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
                <OrderHistory />
              </Route>
              <Route path={appRoutes.history.path}>
                <OrderHistory />
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
