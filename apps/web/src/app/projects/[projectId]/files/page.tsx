"use client";
import { Skeleton } from "@lro-ui/skeleton";
import { DataTable } from "@lro-ui/table";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useSelectedProject } from "../../../../modules/project/selected-project-context";
import { orpc } from "../../../../orpc/link";
import type { RouterOutputs } from "../../../../orpc/router";

type InputImage = RouterOutputs["project"]["getFilesInProject"][number];

const columns = [
  {
    header: "Name",
    accessorFn: (row) => row.originalFileName,
  },
  {
    header: "Original Path",
    accessorFn: (row) => row.originalPath,
  },
] satisfies ColumnDef<InputImage>[];

export default function FilesPage() {
  const projectInfo = useSelectedProject();
  const {
    data: inputImages,
    isLoading,
    isError,
  } = useQuery(
    orpc.project.getFilesInProject.queryOptions({
      input: {
        projectId: projectInfo?.selectedProject?.id!,
      },
      enabled: projectInfo?.selectedProject?.id !== undefined,
    }),
  );
  if (isError) {
    return;
  }
  return (
    <>
      <div>Files page</div>
      {isLoading ? (
        <Skeleton />
      ) : isError ? (
        <div>Fetch Error</div>
      ) : inputImages === undefined ? (
        <div>Unknown Error</div>
      ) : (
        <DataTable columns={columns} data={inputImages} />
      )}
    </>
  );
}
