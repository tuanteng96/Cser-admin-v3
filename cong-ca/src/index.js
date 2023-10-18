import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import App from './app/App'
import reportWebVitals from './reportWebVitals'
import 'react-datepicker/dist/react-datepicker.css'
import { BrowserRouter } from 'react-router-dom'
import store from './redux/store'
import * as _redux from './api/configs'
import http from './api/configs/http'
import { SplashScreenProvider } from './layout/_core/SplashScreen'
import { QueryClient, QueryClientProvider } from 'react-query'

/**
 * Base URL of the website.
 *
 * @see https://facebook.github.io/create-react-app/docs/using-the-public-folder
 */
const { PUBLIC_URL } = process.env

_redux.setupAxios(http, store)

const root = ReactDOM.createRoot(document.getElementById('root'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

root.render(
  <QueryClientProvider client={queryClient}>
    <SplashScreenProvider>
      <BrowserRouter>
        <App store={store} basename={PUBLIC_URL} />
      </BrowserRouter>
    </SplashScreenProvider>
  </QueryClientProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
