import { User } from '@heroui/user'

export function PoolUserDisplay({
  photoURL,
  displayName,
}: {
  photoURL: string | null
  displayName: string | null
}) {
  return (
    <User
      classNames={{
        name: 'w-32 truncate',
        wrapper: 'pl-1',
      }}
      avatarProps={{
        showFallback: true,
        src: photoURL ?? undefined,
      }}
      name={displayName}
    />
  )
}
