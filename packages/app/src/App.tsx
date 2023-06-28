import { EditAddress } from '#pages/EditAddress'
import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Filters } from '#pages/Filters'
import { Home } from '#pages/Home'
import { OrderDetails } from '#pages/OrderDetails'
import { OrderList } from '#pages/OrderList'
import { Refund } from '#pages/Refund'
import {
  CoreSdkProvider,
  ErrorBoundary,
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
          <CoreSdkProvider>
            <Router base='/orders'>
              <Switch>
                <Route path={appRoutes.home.path}>
                  <Home />
                </Route>
                <Route path={appRoutes.list.path}>
                  <OrderList />
                </Route>
                <Route path={appRoutes.filters.path}>
                  <Filters />
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
