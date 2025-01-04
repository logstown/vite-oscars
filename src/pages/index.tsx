import { AuthContext } from "@/config/auth-provider";
import DefaultLayout from "@/layouts/default";
import { useContext } from "react";
import LandingPage from "./landing";
import { Spinner } from "@nextui-org/spinner";

export default function IndexPage() {
  const { currentUser, loading } = useContext(AuthContext);

  return (
    <DefaultLayout>
      {loading ? <Spinner /> : currentUser ? <div>You're in, {currentUser.displayName}</div> : <LandingPage />}
    </DefaultLayout>
  );
}
