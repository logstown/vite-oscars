import { Button } from "@heroui/button"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Input } from "@heroui/input"
import { Link } from "@heroui/link"
import { LockIcon, MailIcon } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className='flex justify-center p-20'>
      <Card className='w-full max-w-sm'>
        <CardHeader>Create a New Account</CardHeader>
        <CardBody className='flex flex-col gap-4'>
          <Input
            endContent={
              <MailIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
            }
            label='Email'
            variant='bordered'
          />
          <Input
            endContent={
              <LockIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
            }
            label='Password'
            type='password'
            variant='bordered'
          />
          <Input
            endContent={
              <LockIcon className='text-2xl text-default-400 pointer-events-none flex-shrink-0' />
            }
            label='Confirm Password'
            type='password'
            variant='bordered'
          />
          <Button size='lg' color='primary' fullWidth>
            Sign Up
          </Button>
          <p className='text-center'>
            Already have an account? <Link href='/login'>Continue</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
