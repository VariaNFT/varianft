import { useLiveQuery } from 'dexie-react-hooks'
import React, { createContext, useContext } from 'react'
import { CollectionModel, DatabaseContext } from './DatabaseContext'

interface Props {
  collections: CollectionModel[]
}

export const CollectionContext = createContext<Props | undefined>(undefined)

export function CollectionContextProvider (props: {children: React.ReactElement}) {
  const db = useContext(DatabaseContext)!
  const collections = useLiveQuery(
    () => db.collections.toArray()
  ) || []

  return (
    <CollectionContext.Provider value={{
      collections,
    }}>
      {props.children}
    </CollectionContext.Provider>
  )
}
