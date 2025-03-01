import { Button } from '@heroui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'

export function GrayExplanation() {
  return (
    <Popover backdrop='opaque'>
      <PopoverTrigger>
        <Button color='primary' size='sm' variant='flat'>
          Why am I gray?
        </Button>
      </PopoverTrigger>
      <PopoverContent className='bg-default-100'>
        <div className='max-w-sm p-4 flex flex-col gap-2'>
          <p>
            Unfortunately, you are out of the running for winning this pool.
            Your future picks do not differ enough from those of the leader to
            gain enough points to catch up.
          </p>
          <p>Thanks for playing though, and come back next year!</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
