import React, { useContext } from 'react'
import styled from 'styled-components'
import Mint from './components/panels/Mint'
import Preview from './components/Preview'
import Toast from './components/Toast'
import Projects from './components/panels/Projects'
import Setting from './components/panels/Setting'
import Sidebar from './components/Sidebar'
import { AppContext } from './contexts/AppContext'
import Page from './types/Page'

const AppContainer = styled.div`
  height: 100%;
`

function App (): React.ReactElement {
  const { appState } = useContext(AppContext)!
  return (
    <AppContainer>
      <Sidebar />
      { appState.page === Page.PROJECT && <Projects />}
      { appState.page === Page.MINT && <Mint />}
      { appState.page === Page.SETTING && <Setting />}
      <Preview />
      <Toast />
    </AppContainer>
  )
}

export default App
