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
import Ballot from '@/components/ballot'

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
        <div className='max-w-2xl mx-auto'>
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
          <div className='mb-8'>
            <Ballot currentUser={currentUser} />
          </div>
          <Pools currentUser={currentUser} />
        </div>
      ) : (
        <LandingPage />
      )}
    </DefaultLayout>
  )
}
