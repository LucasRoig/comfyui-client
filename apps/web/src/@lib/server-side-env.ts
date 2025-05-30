import z from "zod/v4";

const envSchema = z.object({
  COMFY_HTTP_URL: z.string().min(1),
  COMFY_WS_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  WORKSPACE: z.string().min(1),
});

let env: z.infer<typeof envSchema> | undefined = undefined;

export function getServerSideEnv() {
  if (env === undefined) {
    const parsedEnv = envSchema.safeParse(process.env);
    if (parsedEnv.success) {
      env = parsedEnv.data;
    } else {
      throw new Error(`Failed to parse environment variables : ${parsedEnv.error.message}`);
    }
  }
  return env;
}
