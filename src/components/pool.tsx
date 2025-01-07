import { deletePool, getAwards, getUser, removeUserFromPool } from "@/api";
import { DbUser, Pool } from "@/config/models";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@nextui-org/user";
import { CheckIcon, CircleAlertIcon, CrownIcon, EllipsisVerticalIcon, LogOutIcon, ShareIcon, XIcon } from "lucide-react";
import { Button } from "@nextui-org/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import copy from "clipboard-copy";
import { Spinner } from "@nextui-org/spinner";

export function PoolCard({ currentUser, pool }: { currentUser: DbUser; pool: Pool }) {
  //   const [poolUsers, setPoolUsers] = useState<DbUser[]>([]);

  const {
    data: awards,
    //   error,
  } = useQuery({
    queryKey: ["awards"],
    queryFn: () => getAwards(),
  });

  const {
    data: poolUsers,
    isPending: arePoolUsersPending,
    // error,
  } = useQuery({
    queryKey: ["poolUsers", pool.id],
    queryFn: async () => {
      const promises = pool.users.map(async (userId) => getUser(userId));
      const users = await Promise.all(promises);
      return users.filter((x) => !!x);
    },
  });

  const { mutate: leavePool, isPending: isLeavePending } = useMutation({
    mutationFn: (uid?: string) => {
      if (uid) {
        if (confirm("Remove user from pool?")) {
          return removeUserFromPool(uid, pool.id);
        } else {
          return Promise.resolve(null);
        }
      } else if (currentUser.uid === pool.creator) {
        if (confirm("Delete Pool? All users will be removed.")) {
          return deletePool(pool.id);
        } else {
          return Promise.resolve(null);
        }
      } else {
        if (confirm("Leave Pool?")) {
          return removeUserFromPool(currentUser.uid, pool.id);
        } else {
          return Promise.resolve(null);
        }
      }
    },
  });

  const copyLink = () => {
    copy(`${window.location.origin}/join-pool/${pool.id}`);
    // toast.success('Link copied to clipboard!')
  };

  const poolUserRows = (
    <div className="flex flex-col gap-4">
      {poolUsers?.map((user) => (
        <div key={user.uid} className="flex group items-center gap-6">
          {Object.keys(user.picks ?? {}).length === awards?.length ? (
            <CheckIcon className="text-success-500 w-" />
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
            <CrownIcon className="text-yellow-200 w-10" />
          ) : (
            currentUser.uid === pool.creator && (
              <Button
                isIconOnly
                variant="light"
                color="danger"
                onPress={() => leavePool(user.uid)}
                className="group-hover:inline-flex hidden"
              >
                <XIcon className="text-default-500" />
              </Button>
            )
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card className="p-4">
      <CardHeader className="justify-between items-start gap-10">
        <div className="flex-col items-start">
          <h3 className="text-2xl font-semibold">{pool.name}</h3>
          <small className="text-default-500">{pool.users.length} members</small>
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button isIconOnly variant="light">
              <EllipsisVerticalIcon className="text-default-500" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Dropdown menu with icons" variant="faded">
            <DropdownItem startContent={<ShareIcon />} onPress={copyLink} key="share">
              Copy Link to join Pool
            </DropdownItem>
            <DropdownItem
              startContent={<LogOutIcon />}
              onPress={() => leavePool(undefined)}
              key="delete"
              className="text-danger"
              color="danger"
            >
              Leave Pool
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody className="max-h-[650px]">
        {arePoolUsersPending ? (
          <div className="flex pt-10">
            <Spinner />
          </div>
        ) : (
          poolUserRows
        )}
      </CardBody>
    </Card>
  );
}
