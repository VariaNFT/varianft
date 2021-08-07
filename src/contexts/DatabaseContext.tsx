import React, { createContext } from 'react'
import Dexie from 'dexie'
import defaultData from './defaultData.json'

export const DatabaseContext = createContext<Database | undefined>(undefined)

export class Database extends Dexie {
  projects: Dexie.Table<ProjectModel, number>
  collections: Dexie.Table<CollectionModel, number>

  constructor () {
    super('VariaNFT')
    this.version(1).stores({
      projects: '++id,name,preview,svg,csv,data,attributes,collection',
      collections: '++id,name,address,chainId',
    })

    this.projects = this.table('projects')
    this.collections = this.table('collections')

    this.on('populate', async () => {
      if ((await this.projects.toArray()).length === 0) {
        await this.projects.add(defaultData)
      }
    })
  }
}

export interface ProjectModel {
  id?: number
  name: string
  preview: string // Data URL
  svg: string // SVG Element in string
  csv: string // Original csv file
  data: Array<{ [column: string]: string }> // Parsed records
  attributes: { [name: string]: string } // Template
  collection: number
}

export interface CollectionModel {
  id?: number
  name: string
  address: string
  chainId: number
}

export function DatabaseContextProvider (props: {children: React.ReactElement}) {
  const db = new Database()

  return (
    <DatabaseContext.Provider value={db}>
      {props.children}
    </DatabaseContext.Provider>
  )
}
