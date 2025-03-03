import { getUser } from '@/api'
import { Pool, Award, DbUser, Picks } from '@/config/models'
import { AwardsContext } from '@/hooks/awards-context'
import { Card, CardHeader, CardBody } from '@heroui/card'
import { Progress } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { chain, maxBy, map, omit, minBy, find, reject, reduce } from 'lodash'
import { useContext, useState, useEffect } from 'react'
import { PoolUserDisplay } from './pool-user-display'
import { useIsCeremonyOver } from '@/hooks/is-ceremony-over'
import SuperlativesModal from './superlatives-modal'
import { GrayExplanation } from './gray-explanation'
import { toast } from 'sonner'
import { TrophyIcon } from 'lucide-react'
import ConfettiGenerator from 'confetti-js'

type UserRow = {
  photoURL: string | null
  displayName: string | null
  progressColor: any
  points: number
  uid: string
  outOfIt: boolean
}

export function PoolAfter({
  currentUser,
  pool,
}: {
  currentUser: DbUser
  pool: Pool
}) {
  const awards = useContext(AwardsContext)
  const [userRows, setUserRows] = useState<UserRow[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const { isCeremonyOver } = useIsCeremonyOver()

  const {
    data: poolUsers,
    isPending: arePoolUsersPending,
    // error,
  } = useQuery({
    queryKey: ['poolUsers', pool.id],
    queryFn: async () => {
      const promises = pool.users.map(async userId => getUser(userId))
      const users = await Promise.all(promises)
      return users.filter(x => !!x)
    },
  })

  useEffect(() => {
    if (!awards || !poolUsers) {
      return
    }

    const totalPoints = chain(awards)
      .reduce((sum: number, award: Award) => {
        sum += award.points
        return sum
      }, 0)
      .value()

    setTotalPoints(totalPoints)

    const userRows = getUpdatedUsers(poolUsers, awards)
    setUserRows(userRows)

    if (isCeremonyOver) {
      setWinners(userRows)
    }
  }, [awards, poolUsers, isCeremonyOver])

  return (
    <Card className='min-w-[350px] p-4'>
      <CardHeader className='flex-col items-start'>
        <h3 className='text-2xl font-semibold'>{pool.name}</h3>
        <small className='text-default-500'>
          {pool.users.length} member{pool.users.length === 1 ? '' : 's'}
        </small>
        {isCeremonyOver && poolUsers && (
          <SuperlativesModal poolUsers={poolUsers} awards={awards} />
        )}
      </CardHeader>
      <CardBody>
        <ul className='flex flex-col gap-4'>
          {userRows.map(userRow => (
            <motion.li
              key={userRow.uid}
              className={`${userRow.outOfIt ? 'bg-default-200' : ''}`}
              layout
              transition={{ type: 'spring', mass: 0.5, stiffness: 50 }}
            >
              <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                  <PoolUserDisplay
                    displayName={userRow.displayName}
                    photoURL={userRow.photoURL}
                  />
                  {isCeremonyOver && !userRow.outOfIt && (
                    <TrophyIcon className='text-yellow-500' size={25} />
                  )}
                </div>
                <div>{userRow.points}</div>
              </div>
              <Progress
                className='mt-2'
                aria-label='Points'
                size='sm'
                value={userRow.points}
                color={userRow.progressColor}
                maxValue={totalPoints}
              />
              {userRow.outOfIt && userRow.uid === currentUser.uid && (
                <div className='mt-4 flex justify-end'>
                  <GrayExplanation />
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

function getUpdatedUsers(poolUsers: DbUser[], awards: Award[]): UserRow[] {
  const latestAward = maxBy(awards, x => x.winnerStamp?.toMillis())

  if (latestAward?.winner) {
    const winnerObj = find(latestAward.nominees, { id: latestAward.winner })!
    const winnerStr = winnerObj.nominee
      ? `${winnerObj.nominee} has won for ${winnerObj.film}!`
      : `${winnerObj.film} has won!`

    toast(winnerStr, {
      description: latestAward.award,
      duration: 10000,
      icon: <TrophyIcon className='text-yellow-500' size={20} />,
    })
  }

  const users = chain(poolUsers)
    .map(({ picks, displayName, photoURL, uid }) => {
      const points = chain(awards)
        .filter('winner')
        .reduce((sum: number, award: Award) => {
          if (picks[award.id]?.id === award.winner) {
            sum += award.points
          }

          return sum
        }, 0)
        .value()

      let progressColor = 'primary'
      if (latestAward) {
        if (picks[latestAward.id]?.id === latestAward.winner) {
          progressColor = 'success'
        } else {
          progressColor = 'danger'
        }
      }

      return {
        points,
        progressColor,
        outOfIt: false,
        displayName,
        photoURL,
        picks,
        uid,
      }
    })
    .orderBy('points', 'desc')
    .value()

  for (let i = 0; i < users.length; i++) {
    const user1 = users[i]

    for (let j = i + 1; j < users.length; j++) {
      const user2 = users[j]

      const possiblePoints = getPossiblePoints(user1.picks, user2.picks, awards)
      if (possiblePoints < Math.abs(user1.points - user2.points)) {
        const loser = minBy([user1, user2], 'points')
        loser!.outOfIt = true
      }
    }
  }

  return map(users, user => omit(user, 'picks'))
}

function getPossiblePoints(
  picks1: Picks,
  picks2: Picks,
  awards: Award[],
): number {
  return chain(awards)
    .reject('winner')
    .reduce((sum: number, award: Award) => {
      if (picks1[award.id]?.id !== picks2[award.id]?.id) {
        sum += award.points
      }
      return sum
    }, 0)
    .value()
}

function setWinners(userRows: UserRow[]) {
  const winners = reject(userRows, 'outOfIt')
  const winnersStr = reduce(
    winners,
    (finalStr, winner, i) => {
      finalStr += winner.displayName
      if (i !== winners.length - 1) {
        finalStr += ', '
      }

      return finalStr
    },
    '',
  )

  if (winnersStr) {
    toast.success(`Congratulations ${winnersStr}!`, {
      position: 'top-center',
      duration: 15000,
      icon: <TrophyIcon className='text-yellow-500' size={20} />,
    })

    const confetti = new ConfettiGenerator({ target: 'my-canvas' })
    confetti.render()
  }
}
