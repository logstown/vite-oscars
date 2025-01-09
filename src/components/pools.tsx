import { DbUser, Pool } from '@/config/models'
import { CreatePoolButton } from './create-pool-button'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { PoolBefore } from './pool-before'
import { AwardsProvider } from '@/hooks/awards-context'
import { useCurrentTime } from '@/hooks/current-time'
import { ceremonyStart } from '@/config/constants'
import { PoolAfter } from './pool-after'

export function Pools({ currentUser }: { currentUser: DbUser }) {
  const [pools, setPools] = useState<Pool[]>([])
  const { currentTime } = useCurrentTime()

  useEffect(() => {
    const q = query(
      collection(db, 'pools'),
      where('users', 'array-contains', currentUser.uid),
    )
    const unsubscribe = onSnapshot(q, querySnapshot => {
      const poolsArr: Pool[] = []
      querySnapshot.forEach(doc => {
        poolsArr.push(doc.data() as Pool)
      })

      setPools(poolsArr)
    })

    return () => {
      unsubscribe()
    }
  }, [currentUser])

  return (
    <>
      <div className='flex  gap-8 items-start justify-center w-full'>
        {pools.map(pool =>
          currentTime > ceremonyStart ? (
            <PoolBefore currentUser={currentUser} pool={pool} key={pool.id} />
          ) : (
            <PoolAfter pool={pool} key={pool.id} />
          ),
        )}
      </div>
      {currentTime > ceremonyStart && (
        <div className='text-center w-full mt-8'>
          <CreatePoolButton currentUser={currentUser} />
        </div>
      )}
    </>
  )
}
