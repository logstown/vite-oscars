import { useEffect, useState } from 'react'
import { useCurrentTime } from './current-time'
import { ceremonyStart } from '@/config/constants'

export const useIsAfterCermony = () => {
  const [isAfterCeremony, setIsAfterCeremony] = useState(false)
  const { currentTime } = useCurrentTime()

  useEffect(
    () => setIsAfterCeremony(currentTime > ceremonyStart),
    [currentTime],
  )

  return { isAfterCeremony }
}
