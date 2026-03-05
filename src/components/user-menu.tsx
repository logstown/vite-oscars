import { doSignOut } from '@/config/auth'
import { DbUser } from '@/config/models'
import { Avatar } from '@heroui/avatar'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Switch,
  useDisclosure,
} from '@heroui/react'
import { useState } from 'react'

export const useNeoMode = () => {
  const [neoMode, setNeoMode] = useState<boolean>(() => {
    return localStorage.getItem('neo-mode') === 'true'
  })

  const toggle = (value: boolean) => {
    localStorage.setItem('neo-mode', String(value))
    setNeoMode(value)
  }

  return { neoMode, toggle }
}

export default function UserMenu({
  currentUser: { displayName, photoURL },
}: {
  currentUser: DbUser
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { neoMode, toggle } = useNeoMode()

  return (
    <>
      <Dropdown placement='bottom-end'>
        <DropdownTrigger>
          <Avatar
            isBordered
            showFallback
            as='button'
            className='transition-transform'
            color='primary'
            name={displayName || undefined}
            size='sm'
            src={photoURL || undefined}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label='Profile Actions!' variant='flat'>
          <DropdownItem key='profile' className='h-14 gap-2' textValue='dummy'>
            <p className='font-semibold'>Signed in as</p>
            <p className='font-semibold'>{displayName}</p>
          </DropdownItem>
          <DropdownItem key='settings' onPress={onOpen} textValue='Settings'>
            Settings
          </DropdownItem>
          <DropdownItem
            key='logout'
            color='danger'
            onPress={doSignOut}
            textValue='dummy'
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Settings</ModalHeader>
              <ModalBody>
                <div className='flex items-center justify-between py-2'>
                  <div>
                    <p className='font-semibold'>Neo Mode</p>
                    <p className='text-small text-default-500'>
                      Enable to see which players are no longer in contention to
                      win
                    </p>
                  </div>
                  <Switch isSelected={neoMode} onValueChange={toggle} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='primary' onPress={onClose}>
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
