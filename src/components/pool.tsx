import { getAwards, getUser } from "@/api";
import { DbUser, Pool } from "@/config/models";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { User } from "@nextui-org/user";
import { CheckIcon, CircleAlertIcon, CrownIcon, EllipsisVerticalIcon, LogOutIcon, ShareIcon } from "lucide-react";
import { Button } from "@nextui-org/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import copy from "clipboard-copy";
import { cn } from "tailwind-variants";

export function PoolCard({ currentUser, pool }: { currentUser: DbUser; pool: Pool }) {
  //   const [poolUsers, setPoolUsers] = useState<DbUser[]>([]);

  const {
    data: awards,
    isPending: areAwardsPending,
    //   error,
  } = useQuery({
    queryKey: ["awards"],
    queryFn: () => getAwards(),
  });

  const {
    data: poolUsers,
    isPending,
    error,
  } = useQuery({
    queryKey: ["poolUsers", pool.id],
    queryFn: () => {
      const promises = pool.users.map(async (userId) => getUser(userId));
      return Promise.all(promises);
    },
  });

  const copyLink = () => {
    copy(`${window.location.origin}/join-pool/${pool.id}`);
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
            <DropdownItem startContent={<LogOutIcon />} key="delete" className="text-danger" color="danger">
              Leave Pool
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          {poolUsers?.map((user) => (
            <div key={user?.uid} className="flex items-center gap-6">
              {Object.keys(user?.picks ?? {}).length === awards?.length ? (
                <CheckIcon className="text-success-500" />
              ) : (
                <CircleAlertIcon className="text-warning-500" />
              )}
              <User
                avatarProps={{
                  src: user?.photoURL ?? undefined,
                }}
                name={user?.displayName}
              />
              {user?.uid === currentUser.uid && <CrownIcon className="text-yellow-200" />}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
