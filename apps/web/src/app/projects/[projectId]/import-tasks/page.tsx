"use client";

import { type Body, type Meta, Uppy, type UppyFile } from "@uppy/core";
import { Dashboard, UppyContext, UppyContextProvider } from "@uppy/react";
import Xhr from "@uppy/xhr-upload";
import { useContext, useEffect, useState } from "react";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import { useSelectedProject } from "../../../../modules/project/selected-project-context";

function createUppy() {
  return new Uppy({
    restrictions: {
      allowedFileTypes: ["image/*"],
    },
  }).use(Xhr, { endpoint: "/api/upload", allowedMetaFields: true });
}

export default function ImportTaskPage() {
  const [uppy] = useState(createUppy);
  const projectInfo = useSelectedProject();

  useEffect(() => {
    // const
    const onFileAdded = (_file: UppyFile<Meta, Body>) => {
      //uppy.setFileMeta(file.id, {projectId: 1})
    };

    const onUpload = (uploadId: string, _files: UppyFile<Meta, Body>[]) => {
      uppy.setMeta({
        projectId: projectInfo?.selectedProject?.id,
        uploadId,
      });
    };

    uppy.on("file-added", onFileAdded);
    uppy.on("upload", onUpload);

    return () => {
      uppy.off("file-added", onFileAdded);
      uppy.off("upload", onUpload);
    };
  }, [uppy, projectInfo?.selectedProject?.id]);

  return (
    <UppyContextProvider uppy={uppy}>
      <div>Import task page</div>
      <UppyDashboard />
    </UppyContextProvider>
  );
}

function UppyDashboard() {
  const { uppy } = useContext(UppyContext);
  if (uppy === undefined) {
    return <div>Error loading uppy</div>;
  }
  return <Dashboard uppy={uppy} fileManagerSelectionType="both" />;
}
