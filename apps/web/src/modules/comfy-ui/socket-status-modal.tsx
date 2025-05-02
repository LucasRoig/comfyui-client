"use client";
import { Button } from "@lro-ui/button";
import { Modal, ModalBody, ModalClose, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@lro-ui/modal";
import { WebsocketLogsTable } from "./websocket-logs/websocket-logs-table";

type SocketStatusModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function SocketStatusModal(props: SocketStatusModalProps) {
  return (
    <Modal open={props.isOpen} onOpenChange={props.onOpenChange}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Socket Logs</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <WebsocketLogsTable />
        </ModalBody>
        <ModalFooter>
          <ModalClose asChild>
            <Button>Close</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
