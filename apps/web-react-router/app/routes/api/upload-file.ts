import { uploadImageFileHttpHandler } from "@repo/api";
import { getEnv } from "~/.server/env";
import type { Route } from "./+types/upload-file";

export async function action({ request }: Route.ActionArgs) {
  const env = getEnv();
  return await uploadImageFileHttpHandler(request, env.server);
}
