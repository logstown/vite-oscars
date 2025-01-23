import { AuthContext } from '@/config/auth-provider'
import DefaultLayout from '@/layouts/default'
import { useContext } from 'react'
import LandingPage from './landing'
import { Spinner } from '@heroui/spinner'
import { Pools } from '@/components/pools'

export default function IndexPage() {
  const { currentUser, loading } = useContext(AuthContext)

  return (
    <DefaultLayout>
      {loading ? (
        <div className='flex justify-center mt-12'>
          <Spinner />
        </div>
      ) : currentUser ? (
        <div className='flex flex-col gap-8 items-start'>
          <Pools currentUser={currentUser} />
        </div>
      ) : (
        <LandingPage />
      )}
    </DefaultLayout>
  )
}
