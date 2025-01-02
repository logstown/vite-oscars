import { AuthContext } from "@/config/auth-provider";
import DefaultLayout from "@/layouts/default";
import { useContext } from "react";
import LandingPage from "./landing";

export default function IndexPage() {
  const { currentUser } = useContext(AuthContext);

  return <DefaultLayout>{currentUser ? <div>You're in, {currentUser.displayName}</div> : <LandingPage />}</DefaultLayout>;
}
