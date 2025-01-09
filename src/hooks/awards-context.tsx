import { listenToAwards } from '@/api'
import { Award } from '@/config/models'
import React, { createContext, useEffect, useState } from 'react'

export const AwardsContext = createContext<Award[]>([])

export const AwardsProvider = ({ children }: { children: React.ReactNode }) => {
  const [awards, setAwards] = useState<Award[]>([])

  useEffect(() => {
    const unsub = listenToAwards(awards => setAwards(awards))

    return () => {
      unsub()
    }
  }, [])

  return (
    <AwardsContext.Provider value={awards}>{children}</AwardsContext.Provider>
  )
}
