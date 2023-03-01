import { ErrorNotFound } from '#components/ErrorNotFound'
import { OrderHistory } from '#components/OrderHistory'
import {
  CoreSdkProvider,
  ErrorBoundary,
  TokenProvider
} from '@commercelayer/app-elements'
import type { JSX } from 'preact'
import { Link, Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

const isDev = Boolean(import.meta.env.DEV)

export function App(): JSX.Element {
  return (
    <ErrorBoundary hasContainer>
      <TokenProvider
        clientKind='integration'
        currentApp='orders'
        domain={window.config.domain}
        reauthenticateOnInvalidAuth={!isDev}
        devMode={isDev}
      >
        <CoreSdkProvider>
          <Router base='/orders'>
            <Switch>
              <Route path={appRoutes.home.path}>
                <div>
                  <div>Home</div>
                  <Link to={appRoutes.filters.makePath()}>History</Link>
                </div>
              </Route>
              <Route path={appRoutes.filters.path}>
                <OrderHistory />
              </Route>
              <Route path={appRoutes.details.path}>
                <div>details</div>
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
