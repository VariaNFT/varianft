import React, { createContext, useContext, useState, useEffect } from 'react'
import { AppAction, AppContext } from './AppContext'
import { DatabaseContext } from './DatabaseContext'

export interface ProjectState {
  id?: number
  name: string
  preview: string // Data URL
  svg: string // SVG Element in string
  csv: string
  data: Array<{ [column: string]: string }>
  attributes: { [name: string]: string } // Template
  collection: number
  usingData: number
}

export const ProjectContext = createContext<{
  projectState: ProjectState,
  setProjectState: React.Dispatch<React.SetStateAction<ProjectState>>,
  loadProject(projectId: number): any,
    } | undefined>(undefined)

export function ProjectContextProvider (props: {children: React.ReactElement}) {
  const db = useContext(DatabaseContext)!
  const [state, setState] = useState<ProjectState>({
    id: -1,
    name: '',
    preview: '',
    svg: '',
    csv: '',
    data: [],
    attributes: {},
    collection: -1, // -2 for Rarible
    usingData: 0,
  })
  function loadProject (projectId: number) {
    if (projectId === -1) {
      return setState({
        id: -1,
        name: '',
        preview: '',
        svg: '',
        csv: '',
        data: [],
        attributes: {},
        collection: -1, // -2 for Rarible
        usingData: 0,
      })
    }
    return db.projects.get(projectId).then(project => {
      if (project) {
        setState({
          ...project,
          usingData: 0,
        })
      }
    })
  }

  useEffect(() => {
    db.projects.update(state, state).then(status => {
      if (status === 0) {
        console.warn('Not update')
      } else {
        console.log(state)
      }
    })
  }, [state])

  return (
    <ProjectContext.Provider value={{
      projectState: state,
      setProjectState: setState,
      loadProject,
    }}>
      {props.children}
    </ProjectContext.Provider>
  )
}
