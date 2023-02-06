import type { JSX } from 'preact'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'
import { ErrorNotFound } from '#components/ErrorNotFound'

export function App(): JSX.Element {
  return (
    <Router base='/orders'>
      <Switch>
        <Route path={appRoutes.home.path}>
          <div>home</div>
        </Route>
        <Route path={appRoutes.filters.path}>
          <div>filter</div>
        </Route>
        <Route path={appRoutes.details.path}>
          <div>details</div>
        </Route>
        <Route>
          <ErrorNotFound />
        </Route>
      </Switch>
    </Router>
  )
}
