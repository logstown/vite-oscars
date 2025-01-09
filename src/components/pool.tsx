import { deletePool, getUser, removeUserFromPool } from "@/api";
import { Award, DbUser, Pool } from "@/config/models";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import { EllipsisVerticalIcon, LogOutIcon, ShareIcon } from "lucide-react";
import { Button } from "@nextui-org/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import copy from "clipboard-copy";
import { PoolUser } from "./pool-user";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { AwardsContext } from "@/hooks/awards-context";
import { chain, maxBy } from "lodash";
import { PoolUserDisplay } from "./pool-user-display";
import { Progress } from "@nextui-org/react";

type UserRow = {
  photoURL: string | null;
  displayName: string | null;
  progressColor: any;
  points: number;
  uid: string;
};

export function PoolBefore({ currentUser, pool }: { currentUser: DbUser; pool: Pool }) {
  const isCurrentUserCreator = currentUser.uid === pool.creator;
  const awards = useContext(AwardsContext);

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
    toast.info("Link copied to clipboard!");
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
        <ul className="flex flex-col gap-4">
          {pool.users.map((uid) => (
            <motion.li key={uid} layout transition={{ type: "spring", mass: 0.5, stiffness: 50 }}>
              <PoolUser
                key={uid}
                uid={uid}
                pool={pool}
                isCurrentUserCreator={isCurrentUserCreator}
                awardsLength={awards?.length ?? 0}
              />
            </motion.li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

export function PoolAfter({ currentUser, pool }: { currentUser: DbUser; pool: Pool }) {
  const isCurrentUserCreator = currentUser.uid === pool.creator;
  const awards = useContext(AwardsContext);
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

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

  useEffect(() => {
    if (!awards || !poolUsers) {
      return;
    }

    const totalPoints = chain(awards)
      .reduce((sum: number, award: Award) => {
        sum += award.points;
        return sum;
      }, 0)
      .value();
    setTotalPoints(totalPoints);

    const latestAward = maxBy(awards, (x) => x.winnerStamp.toMillis());
    const users = chain(poolUsers)
      .map(({ picks, displayName, photoURL, uid }) => {
        const points = chain(awards)
          .filter("winner")
          .reduce((sum: number, award: Award) => {
            if (picks[award.id]?.id === award.winner) {
              sum += award.points;
            }

            return sum;
          }, 0)
          .value();

        let progressColor = "primary";
        if (latestAward) {
          if (picks[latestAward.id]?.id === latestAward.winner) {
            progressColor = "success";
          } else {
            progressColor = "danger";
          }
        }

        return {
          points,
          progressColor,
          displayName,
          uid,
          photoURL,
        };
      })
      .orderBy("points", "desc")
      .value();

    setUserRows(users);
  }, [awards, poolUsers]);

  return (
    <Card className="min-w-[350px]">
      <CardHeader className="flex-col items-start">
        <h3 className="text-2xl font-semibold">{pool.name}</h3>
        <small className="text-default-500">{pool.users.length} members</small>
      </CardHeader>
      <CardBody>
        <ul className="flex flex-col">
          {userRows.map((userRow) => (
            <motion.li
              key={userRow.uid}
              className="p-4 rounded-md odd:bg-default-200"
              layout
              transition={{ type: "spring", mass: 0.5, stiffness: 50 }}
            >
              <div className="flex justify-between items-center">
                <PoolUserDisplay displayName={userRow.displayName} photoURL={userRow.photoURL} />
                <div>{userRow.points}</div>
              </div>
              <Progress
                className="mt-2"
                aria-label="Points"
                size="sm"
                value={userRow.points}
                color={userRow.progressColor}
                maxValue={totalPoints}
              />
            </motion.li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
