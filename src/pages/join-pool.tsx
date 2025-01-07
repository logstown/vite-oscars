import { addUserToPool, getPool } from "@/api";
import { AuthContext } from "@/config/auth-provider";
import { DbUser, Pool } from "@/config/models";
import { Spinner } from "@nextui-org/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

export default function JoinPoolPage() {
  let { poolId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    if (!poolId) {
      setRedirectUrl("/");
      return;
    }

    if (!currentUser) {
      let url = "/login";

      if (poolId) {
        url += `?poolId=${poolId}`;
      }

      setRedirectUrl(url);
    }
  }, [poolId, currentUser]);

  const { isPending: isGetPoolPending, data: poolToJoin } = useQuery({
    queryKey: ["pool", poolId],
    queryFn: () => getPool(poolId!),
    enabled: !!currentUser && !!poolId,
  });

  const { mutate: addUserToPoolUI, isPending: isAddPending } = useMutation({
    mutationFn: ({ currentUser, poolToJoin }: { currentUser: DbUser; poolToJoin: Pool }) => {
      if (!poolToJoin.users.includes(currentUser.uid)) {
        return addUserToPool(currentUser.uid, poolToJoin.id);
      } else {
        return Promise.resolve(null);
      }
    },
    onSuccess: () => {
      //TODO toast it!
      setRedirectUrl("/");
    },
  });

  useEffect(() => {
    if (poolToJoin === null) {
      setRedirectUrl("/");
    } else if (currentUser && poolToJoin) {
      addUserToPoolUI({ currentUser, poolToJoin });
    }
  }, [poolToJoin, currentUser]);

  if (currentUser && (isGetPoolPending || isAddPending)) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return redirectUrl && <Navigate to={redirectUrl} replace={true} />;
}
