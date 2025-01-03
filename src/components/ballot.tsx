import { Button } from "@nextui-org/button";
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@nextui-org/drawer";
import { useDisclosure } from "@nextui-org/react";
import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";

export default function Ballot() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button variant="light" onPress={onOpen}>
        Ballot
      </Button>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">Ballot</DrawerHeader>
              <DrawerBody>here is a body!</DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
