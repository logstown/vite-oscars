import { Button } from '@nextui-org/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@nextui-org/drawer'
import {
  Avatar,
  AvatarGroup,
  Card,
  CardBody,
  Radio,
  Tooltip,
  RadioGroup,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from '@nextui-org/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getPools, getUser, savePicks } from '@/api'
import { useContext, useEffect, useState } from 'react'
import { Award, DbUser, Nominee, Picks, Pool } from '@/config/models'
import { MenuIcon, TrophyIcon } from 'lucide-react'
import { AwardsContext } from '@/hooks/awards-context'
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'

export default function Ballot({ currentUser }: { currentUser: DbUser }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const awards = useContext(AwardsContext)
  const [picks, setPicks] = useState<Picks>()
  const [selectedPool, setSelectedPool] = useState<string>('')
  const { isAfterCeremony } = useIsAfterCermony()

  const { mutate: save, isPending: isSavePending } = useMutation({
    mutationFn: (onClose: () => void) => savePicks(currentUser!.uid, picks!),
    onSuccess: (data, onClose) => closeAndReset(onClose),
  })

  const {
    data: pools,
    // isPending: arePoolUsersPending,
    // error,
  } = useQuery({
    queryKey: ['userPools', currentUser.uid],
    queryFn: async () => getPools(currentUser.uid),
    enabled: isAfterCeremony,
  })

  useEffect(() => {
    if (pools) {
      setSelectedPool(pools[0].id)
    }
  }, [pools])

  const {
    data: poolUsers,
    isPending: arePoolUsersPending,
    // error,
  } = useQuery({
    queryKey: ['poolUsers', selectedPool],
    queryFn: async () => {
      const pool = pools!.find(x => x.id === selectedPool)
      const promises = pool!.users.map(async userId => getUser(userId))
      const users = await Promise.all(promises)
      return users.filter(x => !!x)
    },
    enabled: !!selectedPool,
  })

  const setNewPick = (nomineeId: string, award: Award) => {
    const nominee = award.nominees.find((x: Nominee) => x.id === nomineeId)
    const currentPicks = picks ? picks : currentUser!.picks

    setPicks({ ...currentPicks, [award.id]: nominee } as Picks)
  }

  const closeAndReset = (onClose: () => void) => {
    setPicks(undefined)
    onClose()
  }

  return (
    <>
      <Button
        startContent={<MenuIcon className='hidden sm:inline-flex' size={20} />}
        size='sm'
        variant='ghost'
        onPress={onOpen}
      >
        Ballot
      </Button>
      <Drawer
        isOpen={isOpen}
        size='lg'
        placement='left'
        hideCloseButton={!!picks}
        isDismissable={!picks}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {onClose => (
            <>
              <DrawerHeader className='justify-center'>Ballot</DrawerHeader>
              <DrawerBody>
                {!currentUser ? (
                  <Spinner />
                ) : (
                  <div>
                    {isAfterCeremony && selectedPool && pools && (
                      <div className='text-center'>
                        <Select
                          className='max-w-xs'
                          label='Selected Pool'
                          placeholder='Select a pool'
                          selectedKeys={[selectedPool]}
                          variant='bordered'
                          onChange={e => setSelectedPool(e.target.value)}
                        >
                          {pools.map(pool => (
                            <SelectItem key={pool.id}>{pool.name}</SelectItem>
                          ))}
                        </Select>
                      </div>
                    )}
                    <div className='flex flex-col gap-8 mt-6'>
                      {awards?.map(award => (
                        <Card key={award.id} className='p-2'>
                          {/* <CardHeader className="font-bold">{x.award}</CardHeader> */}
                          <CardBody>
                            <RadioGroup
                              isDisabled={isSavePending || isAfterCeremony}
                              color='primary'
                              label={award.award}
                              defaultValue={currentUser.picks[award.id]?.id}
                              onValueChange={nomineeId =>
                                setNewPick(nomineeId, award)
                              }
                            >
                              {award.nominees.map((nominee: Nominee) => (
                                <div key={nominee.id}>
                                  <Radio
                                    description={nominee.nominee}
                                    value={nominee.id}
                                  >
                                    {nominee.film}
                                  </Radio>
                                  {isAfterCeremony && (
                                    <div
                                      className={`flex items-center gap-4 ${award.winner === nominee.id ? 'pl-8' : 'pl-9'}`}
                                    >
                                      {nominee.id === award.winner && (
                                        <TrophyIcon
                                          className='text-yellow-500'
                                          size={34}
                                        />
                                      )}
                                      <AvatarGroup max={20}>
                                        {poolUsers
                                          ?.filter(
                                            x =>
                                              x.picks[award.id]?.id ===
                                              nominee.id,
                                          )
                                          .map(user => (
                                            <Tooltip
                                              key={user.uid}
                                              content={user.displayName}
                                            >
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
                      ))}
                    </div>
                  </div>
                )}
              </DrawerBody>
              {picks && (
                <DrawerFooter className='border-t-3'>
                  <Button
                    color='primary'
                    isLoading={isSavePending}
                    onPress={() => save(onClose)}
                  >
                    Save
                  </Button>
                  <Button
                    variant='light'
                    color='danger'
                    onPress={() => closeAndReset(onClose)}
                  >
                    Cancel
                  </Button>
                </DrawerFooter>
              )}
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
