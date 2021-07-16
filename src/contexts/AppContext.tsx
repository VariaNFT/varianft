import React, { createContext, Dispatch, useReducer } from 'react'
import Page from '../types/Page'
import { Project } from '../types/Project'

interface AppState {
  projects: Project[]
  records: Object[]
  page: Page
}

export const AppContext = createContext<{
  appState: AppState,
  dispatchAppState: Dispatch<{
    action: AppAction,
    payload: any
  }>
} | undefined>(undefined)

export enum AppAction {
  SWITCH_PAGE
}

function reducer (state: AppState, event: {
  action: AppAction,
  payload: any
}): AppState {
  switch (event.action) {
    case AppAction.SWITCH_PAGE:
      return { ...state, page: event.payload.page }
    default:
      console.error('Unknown action called ' + event.action)
      return state
  }
}

export function AppContextProvider (props: {children: React.ReactElement}) {
  const [state, dispatch] = useReducer(reducer, {
    projects: [],
    records: [],
    page: Page.PROJECT
  })
  return (
    <AppContext.Provider value={{ appState: state, dispatchAppState: dispatch }}>
      {props.children}
    </AppContext.Provider>
  )
}
