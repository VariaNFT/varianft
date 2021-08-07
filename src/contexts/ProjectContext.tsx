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
  const [inited, setInited] = useState(false)
  const db = useContext(DatabaseContext)!
  const { dispatchAppState } = useContext(AppContext)!
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
    db.projects.get(projectId).then(project => {
      if (project) {
        setState({
          ...project,
          usingData: 0,
        })
      }
    })
  }

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
