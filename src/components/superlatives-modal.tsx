import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  card,
  PopoverTrigger,
  Popover,
  PopoverContent,
} from '@heroui/react'
import { Award, DbUser, Nominee, Picks } from '@/config/models'
import {
  forEach,
  filter,
  map,
  toArray,
  maxBy,
  chain,
  startsWith,
  endsWith,
  reduce,
  isNumber,
} from 'lodash'
import { useMemo } from 'react'
import { Card, CardHeader, CardBody } from '@heroui/card'
import { Avatar, AvatarGroup, Tooltip } from '@heroui/react'
import { InfoIcon, StarIcon } from 'lucide-react'
export default function SuperlativesModal({
  awards,
  poolUsers,
}: {
  awards: Award[]
  poolUsers: DbUser[]
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const superlatives = useMemo(() => {
    return [
      {
        id: 1,
        name: 'Cinephile',
        description:
          'Correctly predicted the most short/feature film categories',
        users: getCinephile(awards, poolUsers),
        possiblePoints: 6,
      },
      {
        id: 2,
        name: 'Acting Out',
        description: 'Correctly predicted the most acting categories',
        users: getKnowsActing(awards, poolUsers),
        possiblePoints: 4,
      },
      {
        id: 3,
        name: 'Dark Horse',
        description:
          'Correct predictions went against the grain of the rest of the pool',
        users: getDarkHorse(awards, poolUsers),
        info: "For each award, one point was divided among the players that got it correct. So if four players correctly predicted the same award, they'd each receive 0.25 points. But if only one player got it, she would receive the full point. Highest score at the end is the winner.",
      },
    ]
  }, [awards, poolUsers])

  return (
    <>
      <Button
        className='w-full mt-6'
        radius='full'
        color='primary'
        onPress={onOpen}
      >
        <StarIcon size={18} fill='currentColor' />
        Superlatives
      </Button>
      <Modal
        isOpen={isOpen}
        scrollBehavior='outside'
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Superlatives
              </ModalHeader>
              <ModalBody>
                {superlatives.map(superlative => (
                  <Card key={superlative.id} className='p-4'>
                    <CardHeader className='flex-col items-start gap-1'>
                      <h3 className='text-2xl font-semibold flex items-center gap-2'>
                        {superlative.name + ' Award'}
                        {superlative.info && (
                          <Popover color='foreground'>
                            <PopoverTrigger>
                              <InfoIcon className='cursor-pointer' size={18} />
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className='max-w-sm p-2'>
                                <p>{superlative.info}</p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </h3>
                      <small className='text-default-500'>
                        {superlative.description}
                      </small>
                    </CardHeader>
                    <CardBody>
                      <div className='flex justify-between items-center pl-2'>
                        <AvatarGroup max={20}>
                          {superlative.users.map(({ user }) => (
                            <Tooltip key={user.uid} content={user.displayName}>
                              <Avatar
                                key={user.uid}
                                src={user.photoURL ?? ''}
                                alt={user.displayName ?? ''}
                              />
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                        {isNumber(superlative.users[0]?.points) && (
                          <div>
                            {superlative.users[0].points} /{' '}
                            {superlative.possiblePoints}
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

function getDarkHorse(
  awards: Award[],
  poolUsers: DbUser[],
): { user: DbUser; points?: number }[] {
  const userPoints = {}
  forEach(awards, (award: Award) => {
    const correctUsers = filter(
      poolUsers,
      (user: DbUser) => user.picks[award.id]?.id === award.winner,
    )

    forEach(correctUsers, user => {
      if (!userPoints[user.uid]) {
        userPoints[user.uid] = {
          user: user,
          points: 0,
        }
      }

      userPoints[user.uid].points += 1 / correctUsers.length
    })
  })

  const userPointsArr: { user: DbUser; points: number }[] = toArray(userPoints)
  const highest = maxBy(userPointsArr, 'points')

  return chain(userPointsArr)
    .filter({ points: highest?.points })
    .map('user')
    .map(user => ({ user }))
    .value()
}

function getKnowsActing(
  awards: Award[],
  poolUsers: DbUser[],
): { user: DbUser; points?: number }[] {
  const actingAwards = filter(awards, x =>
    startsWith(x.award.toLowerCase(), 'act'),
  )

  const userPoints = map(poolUsers, user => {
    const points = reduce(
      actingAwards,
      (total, award) => {
        if (user.picks[award.id]?.id === award.winner) {
          total++
        }
        return total
      },
      0,
    )

    return { user, points }
  })

  const highest = maxBy(userPoints, 'points')
  return filter(userPoints, { points: highest?.points ?? 0 })
}

function getCinephile(
  awards: Award[],
  poolUsers: DbUser[],
): { user: DbUser; points?: number }[] {
  const filmAwards = filter(awards, x =>
    endsWith(x.award.toLowerCase(), 'film'),
  )

  const userPoints = map(poolUsers, user => {
    const points = reduce(
      filmAwards,
      (total, award) => {
        if (user.picks[award.id]?.id === award.winner) {
          total++
        }
        return total
      },
      0,
    )

    return { user, points }
  })

  const highest = maxBy(userPoints, 'points')
  return filter(userPoints, { points: highest?.points ?? 0 })
}
