import { doSignOut } from '@/config/auth'
import { DbUser } from '@/config/models'
import { Avatar } from "@heroui/avatar"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"

export default function UserMenu({
  currentUser: { displayName, photoURL },
}: {
  currentUser: DbUser
}) {
  return (
    <Dropdown placement='bottom-end'>
      <DropdownTrigger>
        <Avatar
          isBordered
          showFallback
          as='button'
          className='transition-transform'
          color='secondary'
          name={displayName || undefined}
          size='sm'
          src={photoURL || undefined}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label='Profile Actions' variant='flat'>
        <DropdownItem key='profile' className='h-14 gap-2'>
          <p className='font-semibold'>Signed in as</p>
          <p className='font-semibold'>{displayName}</p>
        </DropdownItem>
        <DropdownItem key='logout' color='danger' onPress={doSignOut}>
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
