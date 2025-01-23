import { Award, DbUser, Nominee } from '@/config/models'
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'
import { Card, CardBody } from "@heroui/card"
import {
  Avatar,
  AvatarGroup,
  Radio,
  RadioGroup,
  Tooltip,
} from "@heroui/react"
import { TrophyIcon } from 'lucide-react'

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

  return (
    <Card key={award.id} className='p-2'>
      {/* <CardHeader className="font-bold">{x.award}</CardHeader> */}
      <CardBody>
        <RadioGroup
          isDisabled={isSavePending || isAfterCeremony}
          color='primary'
          label={award.award}
          defaultValue={userPick?.id}
          onValueChange={nomineeId => setNewPick(nomineeId, award)}
        >
          {award.nominees.map((nominee: Nominee) => (
            <div key={nominee.id}>
              <Radio description={nominee.nominee} value={nominee.id}>
                {nominee.film}
              </Radio>
              {isAfterCeremony && (
                <div
                  className={`flex items-center gap-4 ${award.winner === nominee.id ? 'pl-8' : 'pl-9'}`}
                >
                  {nominee.id === award.winner && (
                    <TrophyIcon className='text-yellow-500' size={34} />
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
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardBody>
    </Card>
  )
}
