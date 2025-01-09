import { createPool } from '@/api'
import { DbUser } from '@/config/models'
import { Button } from '@nextui-org/button'
import { Input } from '@nextui-org/input'
import { Popover, PopoverContent, PopoverTrigger } from '@nextui-org/popover'
import { Form } from '@nextui-org/react'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'

export function CreatePoolButton({ currentUser }: { currentUser: DbUser }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const onSubmit = async (e: any) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))

    setIsLoading(true)
    try {
      await createPool(currentUser.uid, data.name as string)
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover
      showArrow
      offset={10}
      placement='bottom'
      isOpen={isOpen}
      onOpenChange={open => setIsOpen(open)}
    >
      <PopoverTrigger>
        <Button
          size='lg'
          className='bg-gradient-to-tr from-primary-500 to-secondary-500 text-white shadow-lg'
          endContent={<PlusIcon size={20} />}
        >
          New Pool
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Form
          validationBehavior='native'
          onSubmit={onSubmit}
          className='p-4 w-full gap-6 items-end'
        >
          <Input
            label='Name'
            isRequired
            name='name'
            autoFocus
            variant='bordered'
          />
          <Button color='primary' type='submit' isLoading={isLoading}>
            Save
          </Button>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
