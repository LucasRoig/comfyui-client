"use client";
import { Button } from "@lro-ui/button"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@lro-ui/modal"

type SocketStatusModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SocketStatusModal(props: SocketStatusModalProps) {
  return (
    <Modal open={props.isOpen} onOpenChange={props.onOpenChange}>
      <ModalContent className="sm:max-w-[425px]">
        <ModalHeader>
          <ModalTitle>Edit profile</ModalTitle>
          <ModalDescription>
            Make changes to your profile here. Click save when you're done.
          </ModalDescription>
        </ModalHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            BlaBla
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            Bla Bla
          </div>
        </div>
        <ModalFooter>
          <Button>Save changes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
