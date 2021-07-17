import React, { useContext } from 'react'
import { AppAction, AppContext } from '../contexts/AppContext'
import { Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

export default function Toast (): React.ReactElement {
  const { appState, dispatchAppState } = useContext(AppContext)!
  function closeToast (index: number) {
    dispatchAppState({
      action: AppAction.DROP_TOAST,
      payload: { index }
    })
  }
  return (
    <>
      {appState.toasts.map((toast, index) => (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => closeToast(index)} key={index}>
          <Alert onClose={() => closeToast(index)} severity={toast.color}>
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}
