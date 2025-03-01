import { useState } from 'react'
import { Card, CardBody } from '@heroui/card'
import { Avatar, Tooltip } from '@heroui/react'
import { CalendarIcon, TrophyIcon } from 'lucide-react'
import { Button } from '@heroui/button'
import { find } from 'lodash'
import DefaultLayout from '@/layouts/default'
const realData = [
  {
    displayName: 'Isabelle Jenkins',
    photoURL: '',
    winningYears: [2016, 2017, 2021, 2022],
  },
  {
    displayName: 'Celie Jenkins',
    photoURL:
      'https://lh3.googleusercontent.com/a-/AOh14Ggs1R-B3Lsm4xFcJzt1iqizcx60Dc9_POGLMHTNQu4=s96-c',
    winningYears: [2014],
  },
  {
    displayName: 'Kate Sullivan',
    photoURL: '',
    winningYears: [2015],
  },
  {
    displayName: 'Niles Radl',
    photoURL:
      'https://lh3.googleusercontent.com/a-/AAuE7mBEruXnSZk_G-28nVZGIM8FqAwyQDQp89sDoRDW',
    winningYears: [2018, 2024],
  },
  {
    displayName: 'Maggie Radl',
    photoURL: '',
    winningYears: [2019],
  },
  {
    displayName: 'Amanda Forry',
    photoURL: '',
    winningYears: [2020, 2021, 2023],
  },
]

type YearData = {
  year: number
  users: { displayName: string; photoURL: string; winningYears: number[] }[]
}

export default function HallOfFamePage() {
  const [view, setView] = useState<'byYear' | 'byWins'>('byYear')

  const winnersByYear = realData
    .reduce((years, user) => {
      user.winningYears.forEach(year => {
        const foundYear = find(years, { year })
        if (foundYear) {
          foundYear.users.push(user)
        } else {
          years.push({
            year,
            users: [user],
          })
        }
      })
      return years
    }, [] as YearData[])
    .sort((a, b) => a.year - b.year)

  const winnersByTotal = realData.sort(
    (a, b) => b.winningYears.length - a.winningYears.length,
  )

  return (
    <DefaultLayout>
      <div className='w-full max-w-2xl mx-auto p-4 sm:p-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 mb-8'>
          <h1 className='text-3xl sm:text-4xl font-bold'>Hall of Fame</h1>
          <div className='flex gap-2'>
            <Button
              size='sm'
              color={view === 'byYear' ? 'primary' : 'default'}
              onPress={() => setView('byYear')}
            >
              <CalendarIcon size={16} className='hidden sm:block' />
              By Year
            </Button>
            <Button
              size='sm'
              color={view === 'byWins' ? 'primary' : 'default'}
              onPress={() => setView('byWins')}
            >
              <TrophyIcon size={16} className='hidden sm:block' />
              By Wins
            </Button>
          </div>
        </div>

        {view === 'byYear' ? (
          <div className='space-y-4'>
            {winnersByYear.map(winner => (
              <Card key={winner.year} className='w-full'>
                <CardBody className='p-4'>
                  <div
                    className={`flex gap-4 ${winner.users.length > 1 ? 'items-start' : 'items-center'}`}
                  >
                    <div
                      className={`w-20 text-xl sm:text-2xl font-bold text-center ${winner.users.length > 1 ? 'pt-2' : ''}`}
                    >
                      {winner.year}
                    </div>
                    <div className='flex flex-col gap-2 w-full'>
                      {winner.users.map(user => (
                        <div
                          key={user.displayName}
                          className='flex justify-between'
                        >
                          <div className='flex items-center gap-3'>
                            <Tooltip content={user.displayName}>
                              <Avatar
                                name={user.displayName}
                                src={user.photoURL}
                                className='w-10 h-10 sm:w-12 sm:h-12'
                              />
                            </Tooltip>
                            <div className='font-medium'>
                              {user.displayName}
                            </div>
                          </div>
                          <div className='hidden sm:flex items-center gap-2 text-default-500'>
                            <TrophyIcon size={16} />
                            <span>{user.winningYears.length}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <div className='space-y-4'>
            {winnersByTotal.map(winner => (
              <Card key={winner.displayName} className='w-full'>
                <CardBody className='p-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <Tooltip content={winner.displayName}>
                        <Avatar
                          src={winner.photoURL}
                          name={winner.displayName}
                          className='w-10 h-10 sm:w-12 sm:h-12'
                        />
                      </Tooltip>
                      <div>
                        <div className='font-medium'>{winner.displayName}</div>
                        <div className='text-sm text-default-500'>
                          {winner.winningYears.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <TrophyIcon className='text-yellow-500' size={20} />
                      <span className='text-xl sm:text-2xl font-bold'>
                        {winner.winningYears.length}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  )
}
