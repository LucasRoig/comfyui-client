"use client";
import { Button } from "@lro-ui/button";
import { useState } from "react";
import { useIsSocketConnected } from "./comfy-ui-context";
import { SocketStatusModal } from "./socket-status-modal";

export function SocketConnectedIndicator() {
  const isSocketConnected = useIsSocketConnected();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="text" onClick={() => setIsModalOpen(true)}>
        {isSocketConnected ? "Socket Connected" : "Socket Disconnected"}
      </Button>
      <SocketStatusModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
