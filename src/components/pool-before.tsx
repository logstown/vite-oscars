import { deletePool, removeUserFromPool } from '@/api'
import { DbUser, Pool } from '@/config/models'
import { Card, CardHeader, CardBody } from '@heroui/card'
import { useMutation } from '@tanstack/react-query'
import { EllipsisVerticalIcon, LogOutIcon, ShareIcon } from 'lucide-react'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown'
import copy from 'clipboard-copy'
import { PoolUser } from './pool-user'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useContext } from 'react'
import { AwardsContext } from '@/hooks/awards-context'

export function PoolBefore({
  currentUser,
  pool,
}: {
  currentUser: DbUser
  pool: Pool
}) {
  const isCurrentUserCreator = currentUser.uid === pool.creator
  const awards = useContext(AwardsContext)

  const { mutate: leavePool, isPending: isLeavePending } = useMutation({
    mutationFn: () => {
      if (isCurrentUserCreator) {
        if (confirm('Delete Pool? All users will be removed.')) {
          return deletePool(pool.id)
        } else {
          return Promise.resolve(null)
        }
      } else {
        if (confirm('Leave Pool?')) {
          return removeUserFromPool(currentUser.uid, pool.id)
        } else {
          return Promise.resolve(null)
        }
      }
    },
  })

  const copyLink = () => {
    copy(`${window.location.origin}/join-pool/${pool.id}`)
    toast.info('Link copied to clipboard!')
  }

  return (
    <Card className='p-4'>
      <CardHeader className='justify-between items-start gap-10'>
        <div className='flex-col items-start'>
          <h3 className='text-2xl font-semibold'>{pool.name}</h3>
          <small className='text-default-500'>
            {pool.users.length} member{pool.users.length === 1 ? '' : 's'}
          </small>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant='light'>
              <EllipsisVerticalIcon className='text-default-500' />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label='Dropdown menu with icons' variant='faded'>
            <DropdownItem
              startContent={<ShareIcon />}
              onPress={copyLink}
              key='share'
            >
              Copy Link to join Pool
            </DropdownItem>
            <DropdownItem
              startContent={<LogOutIcon />}
              onPress={() => leavePool()}
              key='delete'
              className='text-danger'
              color='danger'
            >
              Leave Pool
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody className='max-h-[533px]'>
        <ul className='flex flex-col gap-4'>
          {pool.users.map(uid => (
            <motion.li
              key={uid}
              layout
              transition={{ type: 'spring', mass: 0.5, stiffness: 50 }}
            >
              <PoolUser
                key={uid}
                uid={uid}
                pool={pool}
                isCurrentUserCreator={isCurrentUserCreator}
                awardsLength={awards?.length ?? 0}
              />
            </motion.li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}
