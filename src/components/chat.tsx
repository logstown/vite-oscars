import { AuthContext } from '@/config/auth-provider'
import { db } from '@/config/firebase'
import { Message, Pool } from '@/config/models'
import { listenToMessages, sendMessage } from '@/api'
import { Avatar } from '@heroui/avatar'
import { Badge } from '@heroui/badge'
import { Button } from '@heroui/button'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Input } from '@heroui/input'
import { ScrollShadow } from '@heroui/scroll-shadow'
import { Tab, Tabs } from '@heroui/tabs'
import { AnimatePresence, motion } from 'framer-motion'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { format } from 'date-fns'
import { MessageCircle, Send, X } from 'lucide-react'
import { useContext, useEffect, useRef, useState } from 'react'

export function Chat() {
  const { currentUser } = useContext(AuthContext)
  const [pools, setPools] = useState<Pool[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activePoolId, setActivePoolId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [seenCount, setSeenCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Listen to user's pools
  useEffect(() => {
    if (!currentUser) return

    const q = query(
      collection(db, 'pools'),
      where('users', 'array-contains', currentUser.uid),
    )
    const unsub = onSnapshot(q, snapshot => {
      const poolsArr: Pool[] = []
      snapshot.forEach(d => poolsArr.push(d.data() as Pool))
      setPools(poolsArr)
      setActivePoolId(prev => prev ?? poolsArr[0]?.id ?? null)
    })

    return () => unsub()
  }, [currentUser])

  // Listen to messages for the active pool
  useEffect(() => {
    if (!activePoolId) return

    setMessages([])
    const unsub = listenToMessages(activePoolId, setMessages)
    return () => unsub()
  }, [activePoolId])

  // Mark messages as seen when chat is open
  useEffect(() => {
    if (isOpen) setSeenCount(messages.length)
  }, [isOpen, messages.length])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !activePoolId || !currentUser) return
    const msg = text.trim()
    setText('')
    await sendMessage(
      activePoolId,
      currentUser.uid,
      currentUser.displayName ?? 'Anonymous',
      currentUser.photoURL,
      msg,
    )
  }

  if (!currentUser || pools.length === 0) return null

  return (
    <div className='fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2'>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <Card
              className='w-80 shadow-xl flex flex-col max-h-[700px]'
              style={{ height: 'calc(100dvh - 9rem)' }}
            >
              <CardHeader className='pb-0 pt-3 px-3 flex flex-col gap-1'>
                <div className='flex items-center justify-between w-full'>
                  <span className='text-sm font-semibold text-default-700'>
                    Pool Chat
                  </span>
                  <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    onPress={() => setIsOpen(false)}
                  >
                    <X size={14} />
                  </Button>
                </div>
                {pools.length > 1 && (
                  <Tabs
                    size='sm'
                    selectedKey={activePoolId ?? undefined}
                    onSelectionChange={key => setActivePoolId(key as string)}
                    classNames={{ tabList: 'w-full', base: 'w-full' }}
                  >
                    {pools.map(p => (
                      <Tab key={p.id} title={p.name} />
                    ))}
                  </Tabs>
                )}
                {pools.length === 1 && (
                  <p className='text-xs text-default-500 pb-1'>
                    {pools[0].name}
                  </p>
                )}
              </CardHeader>

              <CardBody className='px-3 py-2 overflow-hidden flex-1'>
                <ScrollShadow className='h-full' hideScrollBar>
                  <div className='flex flex-col gap-2 min-h-full justify-end'>
                    {messages.map(msg => {
                      const isOwn = msg.uid === currentUser.uid
                      const time = msg.timestamp
                        ? format(msg.timestamp.toDate(), 'h:mm a')
                        : ''
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar
                            src={msg.photoURL ?? undefined}
                            name={msg.displayName}
                            size='sm'
                            className='shrink-0 mb-0.5'
                          />
                          <div
                            className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}
                          >
                            <div className='flex items-baseline gap-1.5'>
                              {!isOwn && (
                                <span className='text-xs font-medium text-default-600'>
                                  {msg.displayName}
                                </span>
                              )}
                              <span className='text-xs text-default-400'>
                                {time}
                              </span>
                            </div>
                            <div
                              className={`px-3 py-1.5 rounded-2xl text-sm max-w-[220px] break-words ${
                                isOwn
                                  ? 'bg-primary text-white rounded-tr-sm'
                                  : 'bg-default-100 text-default-800 rounded-tl-sm'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={bottomRef} />
                  </div>
                </ScrollShadow>
              </CardBody>

              <CardFooter className='px-3 pt-0 pb-3'>
                <div className='flex gap-2 w-full'>
                  <Input
                    size='sm'
                    variant='bordered'
                    placeholder='Message...'
                    value={text}
                    onValueChange={setText}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button
                    isIconOnly
                    size='sm'
                    color='primary'
                    onPress={handleSend}
                    isDisabled={!text.trim()}
                    className='h-9 w-9 min-w-9'
                  >
                    <Send size={14} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Badge
        color='danger'
        content=''
        isInvisible={isOpen || messages.length <= seenCount}
        shape='circle'
        placement='top-right'
      >
        <Button
          isIconOnly
          color='primary'
          size='lg'
          radius='full'
          onPress={() => setIsOpen(o => !o)}
          className='shadow-lg'
        >
          <MessageCircle size={22} />
        </Button>
      </Badge>
    </div>
  )
}
