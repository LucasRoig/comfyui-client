"use client";
import { createContext, useContext } from "react";

export const SelectedProjectContext = createContext<{ projectId: string, projectName: string } | undefined>(undefined);

export function SelectedProjectProvider({ children, projectId, projectName }: {
  children: React.ReactNode,
  projectId: string,
  projectName: string
}) {
  return <SelectedProjectContext.Provider value={{ projectId, projectName }}>{children}</SelectedProjectContext.Provider>;
}

export function useSelectedProject() {
  const selectedProject = useContext(SelectedProjectContext);
  if (!selectedProject) {
    return undefined;
  }
  return selectedProject;
}
