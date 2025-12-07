import { Button } from "@lro-ui/button";
import { call } from "@orpc/server";
import { appRouter } from "@repo/api";
import { type Body, type Meta, Uppy, type UppyFile } from "@uppy/core";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import { Dashboard, UppyContext, UppyContextProvider } from "@uppy/react";
import Xhr from "@uppy/xhr-upload";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { AppRoutes } from "~/routes";
import type { Route } from "./+types/project-import-tasks";

export async function loader(args: Route.LoaderArgs) {
  const rootTemplate = await call(appRouter.projects.templates.findRoot, {
    projectId: args.params.projectId,
  });
  return { rootTemplate };
}

function createUppy() {
  return new Uppy({
    restrictions: {
      allowedFileTypes: ["image/*"],
    },
  }).use(Xhr, { endpoint: "/api/upload-file", allowedMetaFields: true });
}

export default function ProjectImportTasks(props: Route.ComponentProps) {
  const [uppy] = useState(createUppy);

  useEffect(() => {
    const onUpload = (uploadId: string, _files: UppyFile<Meta, Body>[]) => {
      uppy.setMeta({
        projectId: props.params.projectId,
        uploadId,
      });
    };
    uppy.on("upload", onUpload);

    return () => {
      uppy.off("upload", onUpload);
    };
  }, [uppy, props.params.projectId]);

  if (!props.loaderData.rootTemplate) {
    return (
      <div>
        You need to create a root template before importing files
        <div>
          <Button asChild>
            <Link to={AppRoutes.project.templates(props.params.projectId)}>Go to templates</Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div>Project import tasks</div>
      <UppyContextProvider uppy={uppy}>
        <UppyDashboard />
      </UppyContextProvider>
    </div>
  );
}

function UppyDashboard() {
  const { uppy } = useContext(UppyContext);
  if (uppy === undefined) {
    return <div>Error loading uppy</div>;
  }
  return <Dashboard uppy={uppy} fileManagerSelectionType="both" />;
}
