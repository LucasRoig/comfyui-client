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
        executionOutput: z
          .object({
            images: z
              .array(
                z.object({
                  comfy: z.object({
                    filename: z.string(),
                    subfolder: z.string(),
                    type: z.string(),
                  }),
                }),
              )
              .optional(),
          })
          .optional(),
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

export async function createPrompt(data: { promptId: string; workflowId: string; json: JsomComfyWorkflow }) {
  const validJson = jsonWorkflowShema.safeParse(data.json);
  if (!validJson.success) {
    throw new Error("Invalid json");
  }
  const prompts = await db
    .insert(drizzleSchema.prompt)
    .values({
      id: data.promptId,
      workflowId: data.workflowId,
      json: validJson.data,
    })
    .returning();
  const prompt = prompts[0];
  if (!prompt) {
    throw new Error("Failed to create prompt");
  }
  return {
    ...prompt,
    json: jsonWorkflowShema.parse(prompt.json),
  };
}

export async function addOutputImage(args: {
  promptId: string;
  nodeId: string;
  image: {
    filename: string;
    relativePath: string;
    uuid: string;
  };
  comfy: {
    filename: string;
    subfolder: string;
    type: string;
  };
}) {
  return db.transaction(async (trx) => {
    const prompt = await trx.query.prompt.findFirst({
      where: eq(drizzleSchema.prompt.id, args.promptId),
    });
    if (!prompt) {
      throw new Error("Prompt not found");
    }
    const json = jsonWorkflowShema.parse(prompt.json);
    const node = json.nodes.find((n) => n.id === args.nodeId);
    if (!node) {
      throw new Error("Node not found");
    }
    if (!node.data.executionOutput) {
      node.data.executionOutput = {};
    }
    if (!node.data.executionOutput.images) {
      node.data.executionOutput.images = [];
    }
    node.data.executionOutput.images.push({
      comfy: args.comfy,
    });
    await trx.update(drizzleSchema.prompt).set({
      json: json,
    });
    const outputImages = await trx
      .insert(drizzleSchema.outputImage)
      .values({
        filename: args.image.filename,
        relativePath: args.image.relativePath,
        promptId: args.promptId,
        id: args.image.uuid,
        nodeId: args.nodeId,
      })
      .returning();
    const outputImage = outputImages[0];
    if (!outputImage) {
      throw new Error("Failed to create output image");
    }
    return outputImage;
  });
}
