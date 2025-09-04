import { useCsv } from '@/hooks/useCsv'
import { useEffect, useMemo, useState } from 'react'
import _ from 'lodash'
import {
  Accordion,
  AccordionItem,
  Avatar,
  Chip,
  Input,
  Listbox,
  ListboxItem,
  Select,
  SelectItem,
  Slider,
} from '@heroui/react'
import { TrophyIcon } from 'lucide-react'

type NomineeRaw = {
  canon_category: string
  category: string
  ceremony: number
  film: string
  name: string
  winner: string
  year_ceremony: number
  year_film: number
}

export default function HistoryPage() {
  const [selectedCategories, setSelectedCategories] = useState<any>(new Set([]))
  const [movieFilter, setMovieFilter] = useState<string>('')
  const [openCeremonies, setOpenCeremonies] = useState<any>(new Set([]))
  const [yearRange, setYearRange] = useState<[number, number]>([1928, 2025])
  const { data, loading, error } = useCsv<NomineeRaw>('the_oscar_award.csv')

  const realData = useMemo(() => {
    if (!data) return []
    const filteredData = _.chain(data)
      .map(item => ({
        ...item,
        isWinner: item.winner === 'True',
        film: item.film || '',
      }))
      .filter(
        item =>
          selectedCategories.size === 0 ||
          selectedCategories.has(item.canon_category),
      )
      .filter(
        item =>
          item.year_ceremony >= yearRange[0] &&
          item.year_ceremony <= yearRange[1],
      )
      .groupBy('ceremony')
      .map((nominees, ceremony) => ({
        ceremony,
        year: nominees[0].year_ceremony,
        categories: _.chain(nominees)
          .groupBy('category')
          .map((nominees, category) => ({
            category,
            nominees,
            winner: nominees.find(nominee => nominee.isWinner),
          }))
          .filter(category =>
            _.some(category.nominees, nominee =>
              String(nominee.film || '')
                .toLowerCase()
                .includes(movieFilter.toLowerCase()),
            ),
          )
          .value(),
      }))
      .reject(item => item.categories.length === 0)
      .value()
    return filteredData
  }, [data, selectedCategories, yearRange, movieFilter])

  const canonCategories = useMemo(() => {
    return _.chain(data).map('canon_category').uniq().value()
  }, [realData])

  useEffect(() => {
    if (
      (selectedCategories.size === 0 && movieFilter === '') ||
      realData.length === 0
    ) {
      setOpenCeremonies(new Set([]))
    } else {
      const ceremonies = _.chain(realData)
        .map(item => item.ceremony.toString())
        // .uniq()
        .value()

      setOpenCeremonies(new Set(ceremonies))
    }
  }, [selectedCategories, realData])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <Select
        className='max-w-xs'
        label='Category'
        placeholder='Select an category'
        selectionMode='multiple'
        selectedKeys={selectedCategories}
        onSelectionChange={setSelectedCategories}
        isClearable={true}
      >
        {canonCategories.map(category => (
          <SelectItem key={category}>{category}</SelectItem>
        ))}
      </Select>
      <Slider
        className='max-w-md'
        label='Year Range'
        formatOptions={{ useGrouping: false }}
        maxValue={2025}
        minValue={1928}
        value={yearRange}
        onChange={value => setYearRange(value as [number, number])}
        step={1}
      />
      <Input
        label='Movie'
        type='search'
        placeholder='Filter movie'
        value={movieFilter}
        onValueChange={setMovieFilter}
        isClearable
      />
      <Accordion
        selectionMode='multiple'
        variant='splitted'
        selectedKeys={openCeremonies}
        onSelectionChange={setOpenCeremonies}
      >
        {realData.map(item => (
          <AccordionItem
            key={item.ceremony}
            aria-label='Chung Miller'
            startContent={<Chip># {item.ceremony.toString()}</Chip>}
            title={item.year.toString()}
          >
            <Accordion selectionMode='multiple'>
              {item.categories.map(subItem => (
                <AccordionItem
                  key={subItem.category}
                  title={subItem.category}
                  subtitle={
                    <>
                      {subItem.winner?.name}
                      {subItem.winner?.film && (
                        <>
                          <span>{' - '}</span>
                          <span className='font-medium italic'>
                            {subItem.winner?.film}
                          </span>
                        </>
                      )}
                    </>
                  }
                >
                  {/* {subItem.map(nominee => (
                  <div key={nominee.name} className='flex items-center gap-2'>
                    {nominee.name}
                    {nominee.winner && (
                      <TrophyIcon size={18} className='text-yellow-500' />
                    )}
                  </div>
                ))} */}
                  <Listbox aria-label='Actions' onAction={key => alert(key)}>
                    {subItem.nominees.map(nominee => (
                      <ListboxItem
                        textValue={nominee.name + ' - ' + nominee.film}
                        key={nominee.name + nominee.film}
                        onPress={() => alert(nominee.name)}
                      >
                        {nominee.name}{' '}
                        <span className='italic'>- {nominee.film}</span>
                      </ListboxItem>
                    ))}
                  </Listbox>
                </AccordionItem>
              ))}
            </Accordion>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
