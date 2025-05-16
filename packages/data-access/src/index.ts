import { createClient } from "@libsql/client";
import { comfyApiInputDefinitionSchema, parsedInputDefinitionSchema } from "@repo/comfy-ui-api-client";
import { drizzleSchema } from "@repo/database";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql/node";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const inputStateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("STRING_ARRAY"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("NUMBER_ARRAY"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("IMAGE_UPLOAD_COMBO"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("STRING"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("INT"),
    controlAfterGenerate: z.union([
      z.literal("fixed"),
      z.literal("increment"),
      z.literal("decrement"),
      z.literal("randomize"),
      z.undefined(),
    ]),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("FLOAT"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("FLOATS"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("*"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("BOOLEAN"),
    value: z.union([z.literal("true"), z.literal("false")]),
  }),
  z.object({
    kind: z.literal("CUSTOM"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("NUMBER_ARRAY_COMBO"),
    value: z.string(),
  }),
  z.object({
    kind: z.literal("STRING_ARRAY_COMBO"),
    value: z.string(),
  }),
]);

const client = createClient({ url: process.env.DATABASE_URL! });
const db = drizzle(client, {
  schema: drizzleSchema,
});

export const jsonWorkflowShema = z.object({
  edges: z.array(
    z.object({
      id: z.string(),
      type: z.string().optional(),
      source: z.string(),
      target: z.string(),
      sourceHandle: z.string().optional(),
      targetHandle: z.string().optional(),
      animated: z.boolean().optional(),
      hidden: z.boolean().optional(),
      data: z.record(z.string(), z.unknown()).optional(),
      selected: z.boolean().optional(),
      makerStart: z.string().optional(),
      makerEnd: z.string().optional(),
      zIndex: z.number().optional(),
      ariaLabel: z.string().optional(),
      interactionWidth: z.number().optional(),
    }),
  ),
  nodes: z.array(
    z.object({
      id: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      type: z.literal("comfy"),
      hidden: z.boolean().optional(),
      data: z.object({
        definition: z.object({
          input: z.interface({
            required: z.record(z.string(), parsedInputDefinitionSchema).optional(),
            optional: z.record(z.string(), parsedInputDefinitionSchema).optional(),
            hidden: z.record(z.string(), z.union([z.string(), comfyApiInputDefinitionSchema])).optional(),
          }),
          input_order: z.object({
            required: z.array(z.string()).optional(),
            optional: z.array(z.string()).optional(),
          }),
          output: z.array(z.union([z.string(), z.string().array()])),
          output_is_list: z.array(z.boolean()),
          name: z.string(),
          display_name: z.string(),
          description: z.string(),
          python_module: z.string(),
          category: z.string(),
          output_node: z.boolean(),
          output_tooltips: z.array(z.string()).optional(),
        }),
        state: z.object({
          inputs: z.record(z.string(), inputStateSchema),
        }),
      }),
    }),
  ),
});

type JsomComfyWorkflow = z.infer<typeof jsonWorkflowShema>;

export async function getWorkflows() {
  const wfs = await db.query.comfyWorkflow.findMany();
  return wfs.map((wf) => ({
    ...wf,
    json: jsonWorkflowShema.parse(wf.json),
  }));
}

export type DBWorkflow = Awaited<ReturnType<typeof getWorkflow>>;
export async function getWorkflow(id: string) {
  const wf = await db.query.comfyWorkflow.findFirst({
    where: eq(drizzleSchema.comfyWorkflow.id, id),
  });
  if (!wf) {
    throw new Error("Workflow not found");
  }
  return {
    ...wf,
    json: jsonWorkflowShema.parse(wf.json),
  };
}

export async function updateWorkflow(id: string, json: JsomComfyWorkflow) {
  const validJson = jsonWorkflowShema.safeParse(json);
  if (!validJson.success) {
    throw new Error("Invalid json");
  }
  await db
    .update(drizzleSchema.comfyWorkflow)
    .set({
      json: validJson.data,
    })
    .where(eq(drizzleSchema.comfyWorkflow.id, id));
}

export async function createWorkflow() {
  const id = uuidv4();
  const wfs = await db
    .insert(drizzleSchema.comfyWorkflow)
    .values({
      id: id,
      json: {
        edges: [],
        nodes: [],
      },
    })
    .returning();
  const wf = wfs[0];
  if (!wf) {
    throw new Error("Failed to create workflow");
  }
  return {
    ...wf,
    json: jsonWorkflowShema.parse(wf.json),
  };
}
