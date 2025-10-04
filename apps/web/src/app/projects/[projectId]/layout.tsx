import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { database } from "../../../@lib/database";
import { SelectedProjectProvider } from "../../../modules/project/selected-project-context";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await database.query.project.findFirst({
    where: eq(drizzleSchema.project.id, projectId),
  });
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  return (
    <>
      <SelectedProjectProvider projectId={project.id} projectName={project.name}>
        {children}
      </SelectedProjectProvider>
    </>
  );
}
