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
          preview: 'data:image/png;base64,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',
          svg: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
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
