import { Button } from '@heroui/button'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@heroui/drawer'
import {
  Input,
  Progress,
  Select,
  SelectItem,
  Spinner,
  useDisclosure,
} from '@heroui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getPools, getUser, savePicks } from '@/api'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Award, DbUser, Nominee, Picks } from '@/config/models'
import { MenuIcon, SearchIcon } from 'lucide-react'
import { AwardsContext } from '@/hooks/awards-context'
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'
import { BallotAward } from './ballot-award'
import { toast } from 'sonner'

export default function Ballot({ currentUser }: { currentUser: DbUser }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const awards = useContext(AwardsContext)
  const [picks, setPicks] = useState<Picks>({})
  const [selectedPoolId, setSelectedPoolId] = useState<string>('')
  const { isAfterCeremony } = useIsAfterCermony()
  const [searchTerm, setSearchTerm] = useState('')

  const { mutate: save, isPending: isSavePending } = useMutation({
    mutationFn: (onClose: () => void) => savePicks(currentUser!.uid, picks),
    onSuccess: (data, onClose) => {
      if ((Object.keys(picks).length || 0) === awards.length) {
        toast.success('All awards chosen! You are ready for Oscars night!')
      }
      closeAndReset(onClose)
    },
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

  const awardsToDisplay = useMemo(() => {
    if (!awards) return []
    if (searchTerm.length <= 2) return awards

    return awards.filter(
      award =>
        award.award.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.nominees.some(
          nominee =>
            nominee.nominee.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nominee.film.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
  }, [awards, searchTerm])

  const setNewPick = (nomineeId: string, award: Award) => {
    const nominee = award.nominees.find((x: Nominee) => x.id === nomineeId)
    const currentPicks = isEmpty(picks) ? currentUser!.picks : picks

    setPicks({ ...currentPicks, [award.id]: nominee } as Picks)
  }

  const closeAndReset = (onClose: () => void) => {
    setPicks({})
    setSearchTerm('')
    onClose()
  }

  const getPicksPercentage = () => {
    const thesePicks = isEmpty(picks) ? currentUser!.picks : picks
    return Math.floor((Object.keys(thesePicks).length / awards.length) * 100)
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
        hideCloseButton={!isEmpty(picks)}
        isDismissable={isEmpty(picks)}
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
                      <div className='text-center mb-6'>
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
                    <div className='text-center'>
                      <Input
                        type='search'
                        placeholder='Search'
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        startContent={<SearchIcon size={20} />}
                      />
                    </div>
                    {isAfterCeremony && arePoolUsersPending ? (
                      loading
                    ) : (
                      <div className='flex flex-col gap-8 mt-6'>
                        {awardsToDisplay.map(award => (
                          <BallotAward
                            key={award.id}
                            award={award}
                            userPick={currentUser.picks[award.id]}
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
              {!isAfterCeremony && (
                <div className='sticky flex flex-row bottom-0 px-6 py-4 border-t-2 border-default-100'>
                  <Progress
                    aria-label='Progress'
                    className='max-w-md'
                    color={getPicksPercentage() < 100 ? 'warning' : 'success'}
                    showValueLabel={true}
                    size='sm'
                    value={getPicksPercentage()}
                  />
                </div>
              )}
              {!isEmpty(picks) && (
                <DrawerFooter>
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

function isEmpty(obj: object) {
  return Object.keys(obj).length === 0
}
