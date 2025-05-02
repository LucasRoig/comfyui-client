import { DataTable } from "@lro-ui/table";
import type { ComfyUIWebSocketLog } from "@repo/comfy-ui-api-client";
import type { ColumnDef } from "@tanstack/react-table";
import { useWebsocketLogs } from "../comfy-ui-context";

const columns = [
  {
    header: "Date",
    accessorFn: (row) => row.date.toLocaleString(),
  },
  {
    header: "Type",
    accessorFn: (row) => row.type,
  },
  {
    header: "Message",
    accessorFn: (row) => row.message,
  },
] satisfies ColumnDef<ComfyUIWebSocketLog>[];

export function WebsocketLogsTable() {
  const logs = useWebsocketLogs();
  return <DataTable columns={columns} data={logs} />;
}
