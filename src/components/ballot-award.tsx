import { cancelWinnerFB, setWinnerFB } from '@/api'
import { AuthContext } from '@/config/auth-provider'
import { Award, DbUser, Nominee } from '@/config/models'
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'
import { Card, CardBody } from '@heroui/card'
import {
  Avatar,
  AvatarGroup,
  Button,
  Radio,
  RadioGroup,
  Tooltip,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { TrophyIcon } from 'lucide-react'
import { useContext } from 'react'

export function BallotAward({
  award,
  userPick,
  poolUsers,
  isSavePending,
  setNewPick,
}: {
  award: Award
  userPick?: Nominee
  poolUsers?: DbUser[]
  isSavePending: boolean
  setNewPick: (nomineeId: string, award: Award) => void
}) {
  const { isAfterCeremony } = useIsAfterCermony()
  const { currentUser } = useContext(AuthContext)
  const userIsAdmin = import.meta.env.VITE_ADMIN_ID === currentUser?.uid

  const awardHasPerson = (award: Award) => award.points === 3

  const { mutate: setWinner, isPending } = useMutation({
    mutationFn: (nominee: Nominee) => setWinnerFB(award.id, nominee.id),
  })

  const cancelWinner = () => {
    if (!userIsAdmin) return

    if (confirm('Cancel Winner?')) {
      cancelWinnerFB(award.id)
    }
  }

  return (
    <Card key={award.id} className='p-2'>
      {/* <CardHeader className="font-bold">{x.award}</CardHeader> */}
      <CardBody>
        <RadioGroup
          isDisabled={isSavePending || isAfterCeremony}
          color='primary'
          classNames={{
            label: 'order-first',
            description: 'order-2',
            wrapper: 'order-3',
          }}
          label={award.award}
          description={`${award.points} point${award.points === 1 ? '' : 's'}`}
          defaultValue={userPick?.id}
          onValueChange={nomineeId => setNewPick(nomineeId, award)}
        >
          {award.nominees.map((nominee: Nominee) => (
            <div key={nominee.id}>
              <Radio
                description={
                  awardHasPerson(award) ? nominee.film : nominee.nominee
                }
                value={nominee.id}
              >
                {awardHasPerson(award) ? nominee.nominee : nominee.film}
              </Radio>
              {isAfterCeremony && (
                <div
                  className={`flex items-center gap-4 ${award.winner === nominee.id ? 'pl-8' : 'pl-9'}`}
                >
                  {nominee.id === award.winner && (
                    <TrophyIcon
                      className='text-yellow-500'
                      onClick={cancelWinner}
                      size={28}
                    />
                  )}
                  <AvatarGroup max={20}>
                    {poolUsers
                      ?.filter(x => x.picks[award.id]?.id === nominee.id)
                      .map(user => (
                        <Tooltip key={user.uid} content={user.displayName}>
                          <Avatar
                            key={user.uid}
                            src={user.photoURL ?? ''}
                            alt={user.displayName ?? ''}
                          />
                        </Tooltip>
                      ))}
                  </AvatarGroup>
                  {!award.winner && userIsAdmin && (
                    <Button
                      isIconOnly
                      size='sm'
                      variant='ghost'
                      onPress={() => setWinner(nominee)}
                    >
                      <TrophyIcon size={18} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardBody>
    </Card>
  )
}
