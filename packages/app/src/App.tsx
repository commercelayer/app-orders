import { ErrorNotFound } from '#pages/ErrorNotFound'
import { Home } from '#pages/Home'
import { Refund } from '#pages/Refund'
import {
  CoreSdkProvider,
  ErrorBoundary,
  GTMProvider,
  MetaTags,
  TokenProvider
} from '@commercelayer/app-elements'
import { Suspense, lazy, type FC } from 'react'
import { SWRConfig } from 'swr'
import { Route, Router, Switch } from 'wouter'
import { appRoutes } from './data/routes'

const OrderDetails = lazy(async () => await import('#pages/OrderDetails'))
const CreateReturn = lazy(async () => await import('#pages/CreateReturn'))
const Filters = lazy(async () => await import('#pages/Filters'))
const OrderList = lazy(async () => await import('#pages/OrderList'))

const isDev = Boolean(import.meta.env.DEV)

export interface AppProps {
  basePath?: string
  organizationSlug?: string
  onInvalidAuth?: () => void
}

export const App: FC<AppProps> = ({
  basePath,
  organizationSlug,
  onInvalidAuth
}) => {
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
          // TODO: restore correct behavior in final version
          reauthenticateOnInvalidAuth={false}
          onInvalidAuth={() => {
            onInvalidAuth?.()
          }}
          devMode={isDev}
          loadingElement={<div />}
          organizationSlug={organizationSlug}
        >
          <GTMProvider gtmId={window.clAppConfig.gtmId}>
            <MetaTags />
            <CoreSdkProvider>
              <Suspense>
                <Router base={basePath}>
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
                    <Route path={appRoutes.refund.path}>
                      <Refund />
                    </Route>
                    <Route path={appRoutes.return.path}>
                      <CreateReturn />
                    </Route>
                    <Route>
                      <ErrorNotFound />
                    </Route>
                  </Switch>
                </Router>
              </Suspense>
            </CoreSdkProvider>
          </GTMProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
