import type { AppProps } from 'src/App'

export {}

declare global {
  interface Window {
    clAppConfig: {
      /**
       * Specific domain to use for Commerce Layer API requests.
       * It must be set as `commercelayer.io`.
       */
      domain: string
      /**
       * Enable Google Tag Manager for the provided GTM ID.
       */
      gtmId?: string
    }
    clAppOrders: {
      init: (node?: HTMLElement, options?: AppProps) => void
    }
  }
}
