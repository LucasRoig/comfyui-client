import z from "zod";

const envSchema = z.object({
  COMFY_HTTP_URL: z.string().min(1),
  COMFY_WS_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  WORKSPACE: z.string().min(1),
});

let env: z.infer<typeof envSchema> | undefined = undefined;

export function getServerSideEnv() {
  if (env === undefined) {
    env = envSchema.parse(process.env);
  }
  return env;
}
