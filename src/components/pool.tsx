import { deletePool, getAwards, removeUserFromPool } from "@/api";
import { DbUser, Pool } from "@/config/models";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EllipsisVerticalIcon, LogOutIcon, ShareIcon } from "lucide-react";
import { Button } from "@nextui-org/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import copy from "clipboard-copy";
import { PoolUser } from "./pool-user";

export function PoolCard({ currentUser, pool }: { currentUser: DbUser; pool: Pool }) {
  const isCurrentUserCreator = currentUser.uid === pool.creator;

  const {
    data: awards,
    //   error,
  } = useQuery({
    queryKey: ["awards"],
    queryFn: () => getAwards(),
  });

  const { mutate: leavePool, isPending: isLeavePending } = useMutation({
    mutationFn: () => {
      if (isCurrentUserCreator) {
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
    // TODO
    // toast.success('Link copied to clipboard!')
  };

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
              onPress={() => leavePool()}
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
        <div className="flex flex-col gap-4">
          {pool.users.map((uid) => (
            <PoolUser
              key={uid}
              uid={uid}
              pool={pool}
              isCurrentUserCreator={isCurrentUserCreator}
              awardsLength={awards?.length ?? 0}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
