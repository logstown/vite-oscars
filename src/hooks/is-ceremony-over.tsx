import { every } from 'lodash'
import { AwardsContext } from './awards-context'
import { useContext, useEffect, useState } from 'react'

export const useIsCeremonyOver = () => {
  const awards = useContext(AwardsContext)
  const [isCeremonyOver, setIsCeremonyOver] = useState(false)

  useEffect(() => setIsCeremonyOver(every(awards, 'winner')), [awards])

  return { isCeremonyOver }
}
