import { getUser, removeUserFromPool } from "@/api";
import { Pool } from "@/config/models";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/react";
import { User } from "@nextui-org/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, CircleAlertIcon, CrownIcon, XIcon } from "lucide-react";
import { PoolUserDisplay } from "./pool-user-display";

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

  const numPicks = Object.keys(user.picks).length;

  return (
    <div className="flex group items-center gap-6">
      {numPicks === awardsLength ? (
        <Tooltip content="All done!">
          <CheckIcon className="text-success-500" />
        </Tooltip>
      ) : (
        <Tooltip content={`${numPicks} / ${awardsLength} Chosen`}>
          <CircleAlertIcon className="text-warning-500" />
        </Tooltip>
      )}
      <PoolUserDisplay photoURL={user.photoURL} displayName={user.displayName} />
      {user.uid === pool.creator ? (
        <Tooltip content="Pool Creator">
          <CrownIcon className="dark:text-yellow-200 text-yellow-700 w-10" />
        </Tooltip>
      ) : (
        isCurrentUserCreator && (
          <Tooltip content="Remove User">
            <Button
              isIconOnly
              variant="light"
              isLoading={isLeavePending}
              color="danger"
              onPress={() => leavePool(user.uid)}
              className="group-hover:inline-flex hidden"
            >
              <XIcon />
            </Button>
          </Tooltip>
        )
      )}
    </div>
  );
}
