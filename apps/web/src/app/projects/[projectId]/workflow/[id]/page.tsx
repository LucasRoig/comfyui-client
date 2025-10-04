import { getWorkflow } from "@repo/data-access";
import { Flow } from "../../../../../modules/workflow-drawer/flow";

export default async function WorkflowPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const workflow = await getWorkflow(id);
  return <Flow workflow={workflow} />;
}
