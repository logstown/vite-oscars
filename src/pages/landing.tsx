import { Link } from '@heroui/link'
import { button as buttonStyles } from '@heroui/theme'

import { title, subtitle } from '@/components/primitives'
import { LogInIcon, UserPlusIcon } from 'lucide-react'

export default function LandingPage() {
  return (
    <section className='flex flex-col items-center justify-center gap-4 py-8 md:py-10'>
      <div className='inline-block max-w-lg text-center justify-center'>
        <span className={title()}>Oscar&nbsp;</span>
        <span className={title({ color: 'green' })}>Showdown&nbsp;</span>
        <div className={subtitle({ class: 'mt-4' })}>
          Compete against friends and family and be named Movie king/queen
        </div>
      </div>

      <div className='flex gap-3'>
        <Link
          className={buttonStyles({
            color: 'primary',
            radius: 'full',
            variant: 'shadow',
            size: 'lg',
          })}
          href='/login'
        >
          Login
          <LogInIcon size={18} />
        </Link>
        {/* <Link
          className={buttonStyles({
            variant: 'bordered',
            radius: 'full',
            size: 'lg',
          })}
          href='/register'
        >
          Sign Up
          <UserPlusIcon size={18} />
        </Link> */}
      </div>

      {/* <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">pages/index.tsx</Code>
          </span>
        </Snippet>
      </div> */}
    </section>
  )
}
