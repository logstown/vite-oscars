import { AuthContext } from '@/config/auth-provider'
import DefaultLayout from '@/layouts/default'
import { useContext } from 'react'
import LandingPage from './landing'
import { Spinner } from '@heroui/spinner'
import { Pools } from '@/components/pools'
import { useCurrentTime } from '@/hooks/current-time'
import { formatDistance } from 'date-fns'
import { ceremonyStart } from '@/config/constants'
import { Alert } from '@heroui/react'

export default function IndexPage() {
  const { currentUser, loading } = useContext(AuthContext)
  const { currentTime } = useCurrentTime()

  return (
    <DefaultLayout>
      {loading ? (
        <div className='flex justify-center mt-12'>
          <Spinner />
        </div>
      ) : currentUser ? (
        <div>
          <Alert
            className='w-auto mb-20 max-w-lg mx-auto'
            color='primary'
            isClosable
            title={
              <span>
                The ceremony starts in{' '}
                <span className='font-bold text-medium'>
                  {formatDistance(currentTime, ceremonyStart)}
                </span>
              </span>
            }
          />
          <Pools currentUser={currentUser} />
        </div>
      ) : (
        <LandingPage />
      )}
    </DefaultLayout>
  )
}
