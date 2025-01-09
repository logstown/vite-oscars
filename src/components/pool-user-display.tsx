import { User } from "@nextui-org/user";

export function PoolUserDisplay({ photoURL, displayName }: { photoURL: string | null; displayName: string | null }) {
  return (
    <User
      classNames={{
        name: "w-32 truncate",
      }}
      avatarProps={{
        showFallback: true,
        src: photoURL ?? undefined,
      }}
      name={displayName}
    />
  );
}
