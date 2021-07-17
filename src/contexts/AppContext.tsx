import React, { createContext, Dispatch, useReducer } from 'react'
import Page from '../types/Page'

interface AppState {
  usingProject: number | undefined
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
  SWITCH_PAGE,
  OPEN_PROJECT
}

function reducer (state: AppState, event: {
  action: AppAction,
  payload: any
}): AppState {
  switch (event.action) {
    case AppAction.SWITCH_PAGE:
      return { ...state, page: event.payload.page }
    case AppAction.OPEN_PROJECT:
      return { ...state, usingProject: event.payload.projectId }
    default:
      console.error('Unknown action called ' + event.action)
      return state
  }
}

export function AppContextProvider (props: {children: React.ReactElement}) {
  const [state, dispatch] = useReducer(reducer, {
    usingProject: undefined,
    page: Page.PROJECT,
  })
  return (
    <AppContext.Provider value={{ appState: state, dispatchAppState: dispatch }}>
      {props.children}
    </AppContext.Provider>
  )
}
