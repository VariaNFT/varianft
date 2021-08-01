import React, { createContext } from 'react'
import Dexie from 'dexie'

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
        await this.projects.add({
          name: 'Test Project',
          preview: 'https://i.imgur.com/pM68iou.jpeg',
          svg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
              <path d="M30,1h40l29,29v40l-29,29h-40l-29-29v-40z" stroke="#000" fill="none"/>
              <path d="M31,3h38l28,28v38l-28,28h-38l-28-28v-38z" fill="#a23"/>
              <text x="50" y="68" font-size="48" fill="#FFF" text-anchor="middle"><![CDATA[410]]></text>
            </svg>
          `,
          csv: '',
          data: [],
          attributes: {},
          collection: -1,
        })
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
