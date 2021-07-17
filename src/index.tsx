import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { AppContextProvider } from './contexts/AppContext'
import { DatabaseContextProvider } from './contexts/DatabaseContext'

ReactDOM.render(
  <React.StrictMode>
    <DatabaseContextProvider>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </DatabaseContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
