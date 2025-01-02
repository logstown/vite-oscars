import { GoogleIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { Link } from "@nextui-org/link";
import { LockIcon, MailIcon } from "lucide-react";

export default function Login() {
  return (
    <div className="flex justify-center p-20">
      <Card className="w-full max-w-sm">
        <CardHeader>Login</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Input
            endContent={<MailIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
            label="Email"
            variant="bordered"
          />
          <Input
            endContent={<LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />}
            label="Password"
            type="password"
            variant="bordered"
          />
          {/* <CardFooter> */}
          <Button size="lg" color="primary" fullWidth>
            Sign in
          </Button>
          <p className="text-center">
            Don't have an account? <Link href="/register">Sign up</Link>
          </p>
          <div className="flex items-center justify-center px-2">
            <Divider className="my-4" />
            <div className="px-2">OR</div>
            <Divider className="my-4" />
          </div>
          <Button size="lg" color="default" variant="ghost" startContent={<GoogleIcon />} fullWidth>
            Continue with Google
          </Button>
        </CardBody>
        {/* </CardFooter> */}
      </Card>
    </div>
  );
}
