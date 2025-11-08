import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

function mapEnv(env: z.infer<typeof envSchema>) {
  return {
    secrets: {
      DATABASE_URL: env.DATABASE_URL,
    },
    server: {
    },
    client: {
    },
  };
}

let env: ReturnType<typeof mapEnv> | undefined;

export function getEnv() {
  if (!env) {
    const parsed = envSchema.safeParse(process.env);
    if (parsed.error) {
      throw new Error(`Error while parsing env variables :\n${z.prettifyError(parsed.error)}\n`);
    }
    env = mapEnv(parsed.data);
  }
  return env;
}

export function printEnv() {
  const env = getEnv();
  console.info("Env Secrets");
  console.table(Object.fromEntries(Object.entries(env.secrets).map(([key, value]) => [key, "*".repeat(value.length)])));
  console.info("Env Server");
  console.table(env.server);
  console.info("Env Client");
  console.table(env.client);
}
