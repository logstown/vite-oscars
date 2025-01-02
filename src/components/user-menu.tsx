import { doSignOut } from "@/config/auth";
import { Avatar } from "@nextui-org/avatar";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { User } from "firebase/auth";

export default function UserMenu({ currentUser }: { currentUser: User }) {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          isBordered
          as="button"
          className="transition-transform"
          color="secondary"
          name={currentUser.displayName || currentUser.email || undefined}
          size="sm"
          src={currentUser.photoURL || undefined}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{currentUser.email}</p>
        </DropdownItem>
        <DropdownItem key="logout" color="danger" onPress={doSignOut}>
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
