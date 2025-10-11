"use client";

import { Uppy } from "@uppy/core";
import { Dashboard, UppyContext, UppyContextProvider } from "@uppy/react";
import Xhr from "@uppy/xhr-upload";
import { useContext, useState } from "react";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

function createUppy() {
  return new Uppy().use(Xhr, { endpoint: "/api/upload" });
}

export default function ImportTaskPage() {
  const [uppy] = useState(createUppy);
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
  return <Dashboard uppy={uppy} />;
}
