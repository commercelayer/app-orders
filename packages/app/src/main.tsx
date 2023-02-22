import { render } from 'preact'
import { App } from './App'
import '@commercelayer/app-elements/style.css'

render(<App />, document.getElementById('root') as HTMLElement)
