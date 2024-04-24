import {
  CoreSdkProvider,
  ErrorBoundary,
  MetaTags,
  PageSkeleton,
  TokenProvider,
  createApp
} from '@commercelayer/app-elements'
import '@commercelayer/app-elements/style.css'
import { StrictMode } from 'react'
import { SWRConfig } from 'swr'
import { App } from './App'

const isDev = Boolean(import.meta.env.DEV)

createApp(
  (props) => (
    <StrictMode>
      <ErrorBoundary hasContainer>
        <SWRConfig
          value={{
            revalidateOnFocus: false
          }}
        >
          <TokenProvider
            kind='orders'
            appSlug='orders'
            devMode={isDev}
            reauthenticateOnInvalidAuth={!isDev && props?.onInvalidAuth == null}
            loadingElement={
              props?.isInDashboard === true ? <PageSkeleton /> : <div />
            }
            {...props}
          >
            <CoreSdkProvider>
              <MetaTags />
              <App routerBase={props?.routerBase} />
            </CoreSdkProvider>
          </TokenProvider>
        </SWRConfig>
      </ErrorBoundary>
    </StrictMode>
  ),
  'orders'
)
