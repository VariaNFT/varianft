import React, { createContext, Dispatch, useReducer } from 'react'
import { Color as AlertColor } from '@material-ui/lab/Alert'

export enum Page {
  PROJECT,
  MINT,
  SETTING,
}

interface AppState {
  usingProject: number | undefined
  page: Page
  toasts: { color: AlertColor, message: string }[]
  previewCanvas: HTMLCanvasElement | undefined
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
  OPEN_PROJECT,
  PUSH_TOAST,
  DROP_TOAST,
  SET_CANVAS,
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
    case AppAction.PUSH_TOAST:
      return {
        ...state,
        toasts: [
          ...state.toasts,
          {
            color: event.payload.color,
            message: event.payload.message
          }
        ]
      }
    case AppAction.DROP_TOAST:
      return {
        ...state,
        toasts: [
          ...state.toasts.filter((_, index) => index !== event.payload.index)
        ]
      }
    case AppAction.SET_CANVAS:
      return { ...state, previewCanvas: event.payload.canvas }
    default:
      console.error('Unknown action called ' + event.action)
      return state
  }
}

export function AppContextProvider (props: {children: React.ReactElement}) {
  const [state, dispatch] = useReducer(reducer, {
    usingProject: undefined,
    page: Page.PROJECT,
    toasts: [],
    previewCanvas: undefined,
  })
  return (
    <AppContext.Provider value={{ appState: state, dispatchAppState: dispatch }}>
      {props.children}
    </AppContext.Provider>
  )
}
