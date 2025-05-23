import Link from "next/link";
import { QueueLengthIndicator } from "../../modules/comfy-ui/queue-length-indicator";
import { SocketConnectedIndicator } from "../../modules/comfy-ui/socket-connected-indicator";
import { ProjectSwitcher } from "../../modules/project/project-switcher";

export function Header() {
  return (
    <div className="flex px-4 items-center h-full border-b border-gray-100">
      <div className="flex items-center gap-4 mr-6">
        <div>
          <ProjectSwitcher />
        </div>
        <div>
          <SocketConnectedIndicator />
          <QueueLengthIndicator />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/workflow">Workflow</Link>
          <Link href="/explore/civit">Explore Civit</Link>
        </div>
      </div>
    </div>
  );
}
