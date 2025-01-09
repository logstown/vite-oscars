import { Button } from "@nextui-org/button";
import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "@nextui-org/drawer";
import { Card, CardBody, Radio, RadioGroup, Spinner, useDisclosure } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { savePicks } from "@/api";
import { useContext, useState } from "react";
import { Award, DbUser, Nominee, Picks } from "@/config/models";
import { MenuIcon } from "lucide-react";
import { AwardsContext } from "@/hooks/awards-context";

export default function Ballot({ currentUser }: { currentUser: DbUser }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [picks, setPicks] = useState<Picks>();
  const awards = useContext(AwardsContext);

  const { mutate: save, isPending: isSavePending } = useMutation({
    mutationFn: (onClose: () => void) => savePicks(currentUser!.uid, picks!),
    onSuccess: (data, onClose) => closeAndReset(onClose),
  });

  const setNewPick = (nomineeId: string, award: Award) => {
    const nominee = award.nominees.find((x: Nominee) => x.id === nomineeId);
    const currentPicks = picks ? picks : currentUser!.picks;

    setPicks({ ...currentPicks, [award.id]: nominee } as Picks);
  };

  const closeAndReset = (onClose: () => void) => {
    setPicks(undefined);
    onClose();
  };

  return (
    <>
      <Button startContent={<MenuIcon className="hidden sm:inline-flex" size={20} />} size="sm" variant="ghost" onPress={onOpen}>
        Ballot
      </Button>
      <Drawer
        isOpen={isOpen}
        size="lg"
        placement="left"
        hideCloseButton={!!picks}
        isDismissable={!picks}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="justify-center">Ballot</DrawerHeader>
              <DrawerBody>
                {!currentUser ? (
                  <Spinner />
                ) : (
                  <div className="flex flex-col gap-8">
                    {awards?.map((award) => (
                      <Card key={award.id} className="p-2">
                        {/* <CardHeader className="font-bold">{x.award}</CardHeader> */}
                        <CardBody>
                          <RadioGroup
                            isDisabled={isSavePending}
                            color="primary"
                            label={award.award}
                            defaultValue={currentUser.picks[award.id]?.id}
                            onValueChange={(nomineeId) => setNewPick(nomineeId, award)}
                          >
                            {award.nominees.map((nominee: Nominee) => (
                              <Radio key={nominee.id} description={nominee.nominee} value={nominee.id}>
                                {nominee.film}
                              </Radio>
                            ))}
                          </RadioGroup>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </DrawerBody>
              {picks && (
                <DrawerFooter className="border-t-3">
                  <Button color="primary" isLoading={isSavePending} onPress={() => save(onClose)}>
                    Save
                  </Button>
                  <Button variant="light" color="danger" onPress={() => closeAndReset(onClose)}>
                    Cancel
                  </Button>
                </DrawerFooter>
              )}
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
