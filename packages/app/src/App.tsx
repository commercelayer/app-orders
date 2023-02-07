import type { JSX } from 'preact'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'
import { ErrorNotFound } from '#components/ErrorNotFound'
import { TokenProvider } from '@commercelayer/app-elements'
import { OrderHistory } from '#components/OrderHistory'

export function App(): JSX.Element {
  return (
    <TokenProvider
      clientKind='integration'
      onInvalidAuth={() => {}}
      currentApp='orders'
      devMode
    >
      <Router base='/orders'>
        <Switch>
          <Route path={appRoutes.home.path}>
            <div>home</div>
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
    </TokenProvider>
  )
}
