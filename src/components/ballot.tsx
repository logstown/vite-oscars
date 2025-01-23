import { Button } from "@heroui/button"
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/drawer"
import { Select, SelectItem, Spinner, useDisclosure } from "@heroui/react"
import { useMutation, useQuery } from '@tanstack/react-query'
import { getPools, getUser, savePicks } from '@/api'
import { useContext, useEffect, useState } from 'react'
import { Award, DbUser, Nominee, Picks } from '@/config/models'
import { MenuIcon } from 'lucide-react'
import { AwardsContext } from '@/hooks/awards-context'
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'
import { BallotAward } from './ballot-award'

export default function Ballot({ currentUser }: { currentUser: DbUser }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const awards = useContext(AwardsContext)
  const [picks, setPicks] = useState<Picks>()
  const [selectedPoolId, setSelectedPoolId] = useState<string>('')
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
      setSelectedPoolId(pools[0].id)
    }
  }, [pools])

  const {
    data: poolUsers,
    isPending: arePoolUsersPending,
    // error,
  } = useQuery({
    queryKey: ['poolUsers', selectedPoolId],
    queryFn: async () => {
      const pool = pools!.find(x => x.id === selectedPoolId)
      const promises = pool!.users.map(async userId => getUser(userId))
      const users = await Promise.all(promises)
      return users.filter(x => !!x)
    },
    enabled: !!selectedPoolId,
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

  const loading = (
    <div className='flex justify-center mt-12'>
      <Spinner />
    </div>
  )

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
                  loading
                ) : (
                  <div>
                    {isAfterCeremony && selectedPoolId && pools && (
                      <div className='text-center'>
                        <Select
                          className='max-w-xs'
                          label='Selected Pool'
                          placeholder='Select a pool'
                          selectedKeys={[selectedPoolId]}
                          variant='bordered'
                          onChange={e => setSelectedPoolId(e.target.value)}
                        >
                          {pools.map(pool => (
                            <SelectItem key={pool.id}>{pool.name}</SelectItem>
                          ))}
                        </Select>
                      </div>
                    )}
                    {isAfterCeremony && arePoolUsersPending ? (
                      loading
                    ) : (
                      <div className='flex flex-col gap-8 mt-6'>
                        {awards?.map(award => (
                          <BallotAward
                            key={award.id}
                            award={award}
                            userPick={currentUser.picks?.[award.id]}
                            poolUsers={poolUsers}
                            isSavePending={isSavePending}
                            setNewPick={setNewPick}
                          />
                        ))}
                      </div>
                    )}
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
