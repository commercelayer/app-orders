import '@commercelayer/app-elements/style.css'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'

const defaultBasePath =
  import.meta.env.PUBLIC_PROJECT_PATH != null
    ? `/${import.meta.env.PUBLIC_PROJECT_PATH}`
    : undefined

window.clAppOrders = {
  init: (node, options) => {
    if (node == null) {
      return
    }

    const root = ReactDOM.createRoot(node)
    root.render(
      <StrictMode>
        <App
          basePath={options?.basePath ?? defaultBasePath}
          organizationSlug={
            import.meta.env.PUBLIC_SELF_HOSTED_SLUG ?? options?.organizationSlug
          }
          onInvalidAuth={options?.onInvalidAuth}
        />
      </StrictMode>
    )
    return root
  }
}
