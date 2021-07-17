import React, { createContext } from 'react'
import Dexie from 'dexie'

export const DatabaseContext = createContext<Database | undefined>(undefined)

class Database extends Dexie {
  projects: Dexie.Table<ProjectModel, number>
  collections: Dexie.Table<CollectionModel, number>

  constructor () {
    super('Memberory')
    this.version(1).stores({
      projects: '++id,name,preview,svg,csv,attributes,collection',
      collections: '++id,name,address',
    })

    this.projects = this.table('projects')
    this.collections = this.table('collections')
  }
}

export interface ProjectModel {
  id?: number
  name: string
  preview: string // Data URL
  svg: string // SVG Element in string
  csv: Array<{ [column: string]: string }>[]
  attributes: { [name: string]: string } // Template
  collection: number
}

export interface CollectionModel {
  id?: number
  name: string
  address: string
}

export function DatabaseContextProvider (props: {children: React.ReactElement}) {
  const db = new Database()

  return (
    <DatabaseContext.Provider value={db}>
      {props.children}
    </DatabaseContext.Provider>
  )
}
