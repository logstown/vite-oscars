import { DbUser, Pool } from '@/config/models'
import { CreatePoolButton } from './create-pool-button'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { PoolBefore } from './pool-before'
import { PoolAfter } from './pool-after'
import { useQueryClient } from '@tanstack/react-query'
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'

export function Pools({ currentUser }: { currentUser: DbUser }) {
  const [pools, setPools] = useState<Pool[]>([])
  const { isAfterCeremony } = useIsAfterCermony()
  const queryClient = useQueryClient()

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

      queryClient.invalidateQueries({ queryKey: ['userPools'] })
    })

    return () => {
      unsubscribe()
    }
  }, [currentUser])

  return (
    <>
      <div className='flex gap-8 items-start justify-center w-full'>
        {pools.map(pool =>
          isAfterCeremony ? (
            <PoolAfter currentUser={currentUser} pool={pool} key={pool.id} />
          ) : (
            <PoolBefore currentUser={currentUser} pool={pool} key={pool.id} />
          ),
        )}
      </div>
      {!isAfterCeremony && (
        <div className='text-center w-full mt-8'>
          <CreatePoolButton currentUser={currentUser} />
        </div>
      )}
    </>
  )
}
