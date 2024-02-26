import { Routes } from '#components/Routes'
import {
  CoreSdkProvider,
  ErrorBoundary,
  GTMProvider,
  MetaTags,
  TokenProvider
} from '@commercelayer/app-elements'
import { SWRConfig } from 'swr'
import { Router } from 'wouter'
import { appRoutes } from './data/routes'

const isDev = Boolean(import.meta.env.DEV)
const basePath =
  import.meta.env.PUBLIC_PROJECT_PATH != null
    ? `/${import.meta.env.PUBLIC_PROJECT_PATH}`
    : undefined

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
          organizationSlug={import.meta.env.PUBLIC_SELF_HOSTED_SLUG}
        >
          <GTMProvider gtmId={window.clAppConfig.gtmId}>
            <MetaTags />
            <CoreSdkProvider>
              <Router base={basePath}>
                <Routes
                  routes={appRoutes}
                  list={{
                    home: {
                      component: async () => await import('#pages/Home')
                    },
                    list: {
                      component: async () => await import('#pages/OrderList')
                    },
                    filters: {
                      component: async () => await import('#pages/Filters')
                    },
                    details: {
                      component: async () => await import('#pages/OrderDetails')
                    },
                    refund: {
                      component: async () => await import('#pages/Refund')
                    },
                    return: {
                      component: async () => await import('#pages/CreateReturn')
                    }
                  }}
                />
              </Router>
            </CoreSdkProvider>
          </GTMProvider>
        </TokenProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
