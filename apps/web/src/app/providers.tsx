"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "../@lib/get-tanstack-query-client";
import { SelectedProjectProvider } from "../modules/project/selected-project-context";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <SelectedProjectProvider>
        {children}
      </SelectedProjectProvider>
    </QueryClientProvider>
  );
}
