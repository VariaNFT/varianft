import React, { useContext } from 'react'
import styled from 'styled-components'
import Mint from './components/panels/Mint'
import Preview from './components/Preview'
import Toast from './components/Toast'
import Projects from './components/panels/Projects'
import Setting from './components/panels/Setting'
import Sidebar from './components/Sidebar'
import { AppContext, Page } from './contexts/AppContext'
// @ts-ignore
import MessengerCustomerChat from 'react-messenger-customer-chat'

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
      <MessengerCustomerChat
        pageId="106185488388491"
        appId="360375655656999"
      />
    </AppContainer>
  )
}

export default App
