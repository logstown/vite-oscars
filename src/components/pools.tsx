import { DbUser, Pool } from "@/config/models";
import { CreatePoolButton } from "./create-pool-button";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import { PoolCard } from "./pool";

export function Pools({ currentUser }: { currentUser: DbUser }) {
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    const q = query(collection(db, "pools"), where("users", "array-contains", currentUser.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const poolsArr: Pool[] = [];
      querySnapshot.forEach((doc) => {
        poolsArr.push(doc.data() as Pool);
      });

      console.log(poolsArr);

      setPools(poolsArr);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="flex gap-8 items-start">
        {pools.map((pool) => (
          <PoolCard currentUser={currentUser} pool={pool} key={pool.id} />
        ))}
        <CreatePoolButton currentUser={currentUser} />
      </div>
    </div>
  );
}
