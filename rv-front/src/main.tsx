import React from 'react'
import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import { store } from './store/store'

import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/riscv-themed-frontend/service_worker.js")
      .then(() => console.log("SW registered"))
      .catch(err => console.log("SW not registered", err))
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)