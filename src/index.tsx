import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { AppContextProvider } from './contexts/AppContext'
import { DatabaseContextProvider } from './contexts/DatabaseContext'
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { ProjectContextProvider } from './contexts/ProjectContext'
import { CollectionContextProvider } from './contexts/CollectionContext'
import { DAppProvider, Config, ChainId } from '@usedapp/core'

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

const dAppConfigs: Config = {
  readOnlyChainId: ChainId.Mainnet,
  readOnlyUrls: {
    [ChainId.Mainnet]: 'https://mainnet.infura.io/v3/e94f302a35ad4b62937b9cc6fe6726ba',
    [ChainId.Ropsten]: 'https://ropsten.infura.io/v3/e94f302a35ad4b62937b9cc6fe6726ba',
    [ChainId.Rinkeby]: 'https://rinkeby.infura.io/v3/e94f302a35ad4b62937b9cc6fe6726ba',
    [ChainId.BSC]: 'https://bsc-dataseed.binance.org/',
    97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  },
}

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={dAppConfigs}>
      <DatabaseContextProvider>
        <AppContextProvider>
          <ProjectContextProvider>
            <CollectionContextProvider>
              <ThemeProvider theme={theme}>
                <App />
              </ThemeProvider>
            </CollectionContextProvider>
          </ProjectContextProvider>
        </AppContextProvider>
      </DatabaseContextProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
