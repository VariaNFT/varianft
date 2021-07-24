import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { AppContextProvider } from './contexts/AppContext'
import { DatabaseContextProvider } from './contexts/DatabaseContext'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { ProjectContextProvider } from './contexts/ProjectContext'

const theme = createTheme({
  palette: {
    primary: {
      light: '#b2fef7',
      main: '#4f9a94',
      dark: '#265f58',
      contrastText: '#fff',
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <DatabaseContextProvider>
      <AppContextProvider>
        <ProjectContextProvider>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </ProjectContextProvider>
      </AppContextProvider>
    </DatabaseContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
