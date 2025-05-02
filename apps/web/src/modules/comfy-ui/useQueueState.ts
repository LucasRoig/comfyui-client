import { useQuery } from "@tanstack/react-query";
import { getQueryClient } from "../../@lib/get-tanstack-query-client";
import { getQueueStateAction } from "./server-actions/get-queue-state-action";

const queryKey = ["queue"];

export function useQueueState() {
  return useQuery({
    queryKey,
    queryFn: () => getQueueStateAction(),
  });
}

export function useInvalidateQueueState() {
  return () => {
    getQueryClient().invalidateQueries({
      queryKey,
    });
  };
}
