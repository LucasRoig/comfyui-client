import { Flow } from "../../../modules/workflow-drawer/flow";
import { getWorkflow } from "@repo/data-access";

export default async function WorkflowPage({params} : Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const workflow = await getWorkflow(id);
  return <Flow workflow={workflow} />;
}
