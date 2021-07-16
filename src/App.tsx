import React, { useContext } from 'react'
import styled from 'styled-components'
import Mint from './components/panels/Mint'
import Preview from './components/panels/Preview'
import ProjectExplorer from './components/panels/ProjectExplorer'
import Setting from './components/panels/Setting'
import Sidebar from './components/Sidebar'
import { AppContext } from './contexts/AppContext'
import Page from './types/Page'

const AppContainer = styled.div`
  height: 100%;
`

function App (): React.ReactElement {
  const { appState, dispatchAppState } = useContext(AppContext)!
  return (
    <AppContainer>
      <Sidebar />
      { appState.page === Page.PROJECT && <ProjectExplorer />}
      { appState.page === Page.MINT && <Mint />}
      { appState.page === Page.SETTING && <Setting />}
      <Preview />
    </AppContainer>
  )
}

export default App
