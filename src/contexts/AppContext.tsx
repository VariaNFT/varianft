import React, { createContext, Dispatch, useReducer } from 'react'
import Page from '../types/Page'
import { Project } from '../types/Project'

interface AppState {
  projects: Project[]
  records: Object[]
  page: Page
}

export const AppContext = createContext<{ appState: AppState, dispatchAppState: Dispatch<AppAction> } | undefined>(undefined)

export enum AppAction {
}

function reducer (state: AppState, action: AppAction): AppState {
  return state
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
