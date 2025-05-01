import Link from "next/link";
import { QueueLengthIndicator } from "../../modules/comfy-ui/queue-length-indicator";
import { SocketConnectedIndicator } from "../../modules/comfy-ui/socket-connected-indicator";

export function Header() {
  return (
    <div className="flex px-4 items-center h-full border-b border-gray-100">
      <div className="flex items-center gap-4 mr-6">
        <Link href="/">
          <span className="font-bold">ComfyUI Client</span>
        </Link>
        <div>
          <SocketConnectedIndicator />
          <QueueLengthIndicator />
        </div>
      </div>
    </div>
  );
}
