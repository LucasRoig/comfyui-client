import type { KyInstance } from "ky";
import { P, match } from "ts-pattern";
import z from "zod";

function parseNode(node: [string | string[] | number[], unknown]) {
  const parsed = match(node[0])
    .with("BOOLEAN", () => {
      const boolConfigSchema = z.object({
        default: z.boolean().nullish(),
        tooltip: z.string().optional(),
      });
      const config = boolConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse bool config");
      }
      return {
        kind: "BOOLEAN" as const,
        config: config.data,
      };
    })
    .with("STRING", () => {
      const stringConfigSchema = z.object({
        multiline: z.boolean().nullish(),
        dynamicPrompts: z.boolean().nullish(),
        tooltip: z.string().nullish(),
        default: z.string().nullish(),
      });
      const config = stringConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse string config");
      }
      return {
        kind: "STRING" as const,
        config: config.data,
      };
    })
    .with("INT", () => {
      const intConfigSchema = z.object({
        default: z.number().nullish(),
        min: z.number(),
        max: z.number(),
        step: z.number().optional(),
        control_after_generate: z.boolean().optional(),
        tooltip: z.string().optional(),
      });
      const config = intConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse int config");
      }
      return {
        kind: "INT" as const,
        config: config.data,
      };
    })
    .with("FLOAT", () => {
      const floatConfigSchema = z.object({
        default: z.number().nullish(),
        min: z.number(),
        max: z.number(),
        step: z.number().nullish(),
        round: z.union([z.number(), z.boolean()]).nullish(),
        tooltip: z.string().optional(),
      });
      const config = floatConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse float config");
      }
      return {
        kind: "FLOAT" as const,
        config: config.data,
      };
    })
    .with("FLOATS", () => {
      const floatsConfigSchema = z.object({
        default: z.number().nullish(),
        min: z.number().nullish(),
        max: z.number().nullish(),
        step: z.number().nullish(),
        forceInput: z.boolean().nullish(),
        tooltip: z.string().optional(),
      });
      const config = floatsConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse floats config");
      }
      return {
        kind: "FLOATS" as const,
        config: config.data,
      };
    })
    .with("COMBO", () => {
      const stringArrayComboConfigSchema = z.object({
        options: z.array(z.string()),
        default: z.string().nullish(),
        tooltip: z.string().nullish(),
      });
      const numberArrayComboConfigSchema = z.object({
        options: z.array(z.number()),
        default: z.number().nullish(),
        tooltip: z.string().nullish(),
      });
      const imageUploadComboConfigSchema = z.object({
        image_upload: z.boolean(),
        image_folder: z.string(),
        remote: z.object({
          route: z.string(),
          refresh_button: z.boolean(),
          control_after_refresh: z.string(),
        }),
      });
      const asStringArray = stringArrayComboConfigSchema.safeParse(node[1]);
      if (asStringArray.success) {
        return {
          kind: "STRING_ARRAY_COMBO" as const,
          config: asStringArray.data,
        };
      }
      const asNumberArray = numberArrayComboConfigSchema.safeParse(node[1]);
      if (asNumberArray.success) {
        return {
          kind: "NUMBER_ARRAY_COMBO" as const,
          config: asNumberArray.data,
        };
      }
      const asImageUpload = imageUploadComboConfigSchema.safeParse(node[1]);
      if (asImageUpload.success) {
        return {
          kind: "IMAGE_UPLOAD_COMBO" as const,
          config: asImageUpload.data,
        };
      }
      throw new Error("Failed to parse combo config");
    })
    .with("*", () => {
      return {
        kind: "*" as const,
      };
    })
    .with(P.string, () => {
      const customConfigSchema = z
        .object({
          tooltip: z.string().optional(),
        })
        .nullish();
      const config = customConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse custom config");
      }
      return {
        kind: "CUSTOM" as const,
        config: config.data,
      };
    })
    .with(P.array(P.string), () => {
      const customConfigSchema = z
        .object({
          tooltip: z.string().optional(),
        })
        .nullish();
      const config = customConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse custom config");
      }
      return {
        kind: "STRING_ARRAY" as const,
        config: config.data,
      };
    })
    .with(P.array(P.number), () => {
      const customConfigSchema = z
        .object({
          tooltip: z.string().optional(),
        })
        .nullish();
      const config = customConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse custom config");
      }
      return {
        kind: "NUMBER_ARRAY" as const,
        config: config.data,
      };
    })
    .exhaustive();
  return parsed;
}

const inputDefinitionSchema = z
  .tuple([z.union([z.string(), z.number().array(), z.string().array()]), z.unknown()])
  .transform(parseNode);

const nodeDefinitionSchema = z.object({
  input: z.object({
    required: z.record(z.string(), inputDefinitionSchema).transform((x) => {
      return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, { ...value, name: key }]));
    }),
    optional: z
      .record(z.string(), inputDefinitionSchema)
      .optional()
      .transform((x) => {
        if (x === undefined) {
          return undefined;
        }
        return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, { ...value, name: key }]));
      }),
    hidden: z.record(z.string(), z.string()).optional(),
  }),
  input_order: z.object({
    required: z.array(z.string()),
    optional: z.array(z.string()).optional(),
  }),
  output: z.array(z.string()),
  output_is_list: z.array(z.boolean()),
  name: z.string(),
  display_name: z.string(),
  description: z.string(),
  python_module: z.string(),
  category: z.string(),
  output_node: z.boolean(),
  output_tooltips: z.array(z.string()).optional(),
});

export type ComfyNodeDefinition = z.infer<typeof nodeDefinitionSchema>;

const getNodesResponseSchema = z.record(z.string(), nodeDefinitionSchema);

export const getNodes = (api: KyInstance) => async () => {
  try {
    const response = await api.get("object_info").json();
    // const inputs = Object.values(response as any).map((node: any) => node.input);
    // inputs.forEach((i) => console.log(Object.keys(i)));
    return getNodesResponseSchema.parse(response);
  } catch (error) {
    console.error(JSON.stringify(error));
    throw error;
  }
};
