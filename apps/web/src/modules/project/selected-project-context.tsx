"use client";
import { createContext, useContext, useMemo } from "react";
import { useParams } from 'next/navigation'
import { listAllProjectsAction } from "./server-actions/list-all-projects-action";
import { useQuery } from "@tanstack/react-query";


export const SelectedProjectContext = createContext<{
  selectedProject: {
    id: string;
    name: string;
  } | undefined;
  isLoading: boolean;
  isError: boolean;
} | undefined>(undefined);

export function SelectedProjectProvider({
  children
}: {
  children: React.ReactNode
}) {
  const params = useParams<{ projectId: string }>();

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await listAllProjectsAction();
      if (!response.data) {
        throw response;
      }
      return response.data;
    },
    throwOnError: true,
  });

  const state = useMemo(() => {
    const selectedProject = params.projectId !== undefined && projects !== undefined ? projects.find(p => p.id === params.projectId) : undefined;
    const projectNotInList = params.projectId !== undefined && projects !== undefined && !selectedProject === undefined;
    return {
      selectedProject,
      projectNotInList
    }
  }, [params, projects])

  return (
    <SelectedProjectContext.Provider value={{
      selectedProject: state.selectedProject,
      isError: isError || state.projectNotInList,
      isLoading
    }}>
      {children}
    </SelectedProjectContext.Provider>
  );
}

export function useSelectedProject() {
  const selectedProject = useContext(SelectedProjectContext);
  if (!selectedProject) {
    return undefined;
  }
  return selectedProject;
}
