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
import { useIsAfterCermony } from '@/hooks/is-after-ceremony'

export default function IndexPage() {
  const { currentUser, loading } = useContext(AuthContext)
  const { currentTime } = useCurrentTime()
  const { isAfterCeremony } = useIsAfterCermony()

  return (
    <DefaultLayout>
      {loading ? (
        <div className='flex justify-center mt-12'>
          <Spinner />
        </div>
      ) : currentUser ? (
        <div className='max-w-2xl mx-auto'>
          {!isAfterCeremony && (
            <Alert
              className='w-auto mb-10 max-w-lg mx-auto'
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
          )}
          <div className='relative flex items-center'>
            <Ballot currentUser={currentUser} />
            <h1 className='text-3xl sm:text-4xl font-bold absolute left-1/2 -translate-x-1/2'>
              Pools
            </h1>
          </div>
          <div className='mb-8 text-center'></div>
          <Pools currentUser={currentUser} />
        </div>
      ) : (
        <LandingPage />
      )}
    </DefaultLayout>
  )
}
