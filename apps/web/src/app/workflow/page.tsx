import { getWorkflows } from "@repo/data-access";
import Link from "next/link";
import { CreateWorkflowButton } from "../../modules/workflow-drawer/creat-workflow-button";

export default async function WorkflowPage() {
  const workflows = await getWorkflows();
  return (
    <div>
      <ul>
        {workflows.map((workflow) => (
          <li key={workflow.id}>
            <Link href={`/workflow/${workflow.id}`}>{workflow.id}</Link>
          </li>
        ))}
      </ul>
      <CreateWorkflowButton />
    </div>
  );
}
