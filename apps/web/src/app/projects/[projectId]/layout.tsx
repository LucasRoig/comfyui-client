import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { database } from "../../../@lib/database";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await database.query.projects.findFirst({
    where: eq(drizzleSchema.projects.id, projectId),
  });
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  return <>{children}</>;
}
