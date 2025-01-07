import { getUser, removeUserFromPool } from "@/api";
import { Pool } from "@/config/models";
import { Button } from "@nextui-org/button";
import { User } from "@nextui-org/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, CircleAlertIcon, CrownIcon, XIcon } from "lucide-react";

export function PoolUser({
  uid,
  pool,
  isCurrentUserCreator,
  awardsLength,
}: {
  uid: string;
  pool: Pool;
  isCurrentUserCreator: boolean;
  awardsLength: number;
}) {
  const {
    data: user,
    isPending: isPoolUserPending,
    // error,
  } = useQuery({
    queryKey: ["user", uid],
    queryFn: async () => getUser(uid),
  });

  const { mutate: leavePool, isPending: isLeavePending } = useMutation({
    mutationFn: (uid: string) => {
      if (confirm("Remove user from pool?")) {
        return removeUserFromPool(uid, pool.id);
      } else {
        return Promise.resolve(null);
      }
    },
  });

  if (isPoolUserPending) {
    return <div className="w-[288px] h-[40px] invisible">dummy</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex group items-center gap-6">
      {Object.keys(user.picks ?? {}).length === awardsLength ? (
        <CheckIcon className="text-success-500" />
      ) : (
        <CircleAlertIcon className="text-warning-500" />
      )}
      <User
        classNames={{
          name: "w-32 truncate",
        }}
        avatarProps={{
          showFallback: true,
          src: user.photoURL ?? undefined,
        }}
        name={user.displayName}
      />
      {user.uid === pool.creator ? (
        <CrownIcon className="dark:text-yellow-200 text-yellow-700 w-10" />
      ) : (
        isCurrentUserCreator && (
          <Button
            isIconOnly
            variant="light"
            isLoading={isLeavePending}
            color="danger"
            onPress={() => leavePool(user.uid)}
            className="group-hover:inline-flex hidden"
          >
            <XIcon className="text-default-500" />
          </Button>
        )
      )}
    </div>
  );
}
