import { AuthContext } from "@/config/auth-provider";
import DefaultLayout from "@/layouts/default";
import { useContext } from "react";
import LandingPage from "./landing";
import { Spinner } from "@nextui-org/spinner";
import Ballot from "@/components/ballot";
import { Pools } from "@/components/pools";

export default function IndexPage() {
  const { currentUser, loading } = useContext(AuthContext);

  return (
    <DefaultLayout>
      {loading ? (
        <Spinner />
      ) : currentUser ? (
        <div className="flex flex-col gap-8 items-start">
          <Ballot currentUser={currentUser} />
          <Pools currentUser={currentUser} />
        </div>
      ) : (
        <LandingPage />
      )}
    </DefaultLayout>
  );
}
