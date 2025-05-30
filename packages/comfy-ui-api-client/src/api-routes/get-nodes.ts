import type { KyInstance } from "ky";
import { P, match } from "ts-pattern";
import z from "zod/v4";

const booleanInputDefinitionConfigSchema = z.object({
  default: z.boolean().nullish(),
  tooltip: z.string().optional(),
});

const stringInputDefinitionConfigSchema = z
  .object({
    multiline: z.boolean().nullish(),
    dynamicPrompts: z.boolean().nullish(),
    tooltip: z.string().nullish(),
    default: z.string().nullish(),
  })
  .or(z.null())
  .or(z.undefined());

const intInputDefinitionConfigSchema = z
  .object({
    default: z.number().nullish(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    control_after_generate: z.boolean().optional(),
    tooltip: z.string().optional(),
  })
  .or(z.null())
  .or(z.undefined());

const floatInputDefinitionConfigSchema = z.object({
  default: z.number().nullish(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().nullish(),
  round: z.union([z.number(), z.boolean()]).nullish(),
  tooltip: z.string().optional(),
});

const floatsInputDefinitionConfigSchema = z.object({
  default: z.number().nullish(),
  min: z.number().nullish(),
  max: z.number().nullish(),
  step: z.number().nullish(),
  forceInput: z.boolean().nullish(),
  tooltip: z.string().optional(),
});

const stringArrayComboInputDefinitionConfigSchema = z.object({
  options: z.array(z.string()),
  default: z.string().nullish(),
  tooltip: z.string().nullish(),
});
const numberArrayComboInputDefinitionConfigSchema = z.object({
  options: z.array(z.number()),
  default: z.number().nullish(),
  tooltip: z.string().nullish(),
});
const imageUploadComboInputDefinitionConfigSchema = z.object({
  image_upload: z.boolean(),
  image_folder: z.string(),
  remote: z.object({
    route: z.string(),
    refresh_button: z.boolean(),
    control_after_refresh: z.string(),
  }),
});

const customInputDefinitionConfigSchema = z
  .object({
    tooltip: z.string().optional(),
  })
  .or(z.null())
  .or(z.undefined());

const stringArrayInputDefinitionConfigSchema = z
  .object({
    tooltip: z.string().optional(),
  })
  .or(z.null())
  .or(z.undefined());

const numberArrayInputDefinitionConfigSchema = z
  .object({
    tooltip: z.string().optional(),
  })
  .or(z.null())
  .or(z.undefined());

function parseInputDefinition(node: [string | string[] | number[], unknown]) {
  const parsed = match(node[0])
    .with("BOOLEAN", () => {
      const config = booleanInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse bool config");
      }
      return {
        kind: "BOOLEAN" as const,
        config: config.data,
      };
    })
    .with("STRING", () => {
      const config = stringInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        console.error(config.error);
        throw new Error("Failed to parse string config");
      }
      return {
        kind: "STRING" as const,
        config: config.data,
      };
    })
    .with("INT", () => {
      const config = intInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        console.error(JSON.stringify(config.error));
        throw new Error("Failed to parse int config");
      }
      return {
        kind: "INT" as const,
        config: config.data,
      };
    })
    .with("FLOAT", () => {
      const config = floatInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        console.error(JSON.stringify(config.error));
        throw new Error("Failed to parse float config");
      }
      return {
        kind: "FLOAT" as const,
        config: config.data,
      };
    })
    .with("FLOATS", () => {
      const config = floatsInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse floats config");
      }
      return {
        kind: "FLOATS" as const,
        config: config.data,
      };
    })
    .with("COMBO", () => {
      const asStringArray = stringArrayComboInputDefinitionConfigSchema.safeParse(node[1]);
      if (asStringArray.success) {
        return {
          kind: "STRING_ARRAY_COMBO" as const,
          config: asStringArray.data,
        };
      }
      const asNumberArray = numberArrayComboInputDefinitionConfigSchema.safeParse(node[1]);
      if (asNumberArray.success) {
        return {
          kind: "NUMBER_ARRAY_COMBO" as const,
          config: asNumberArray.data,
        };
      }
      const asImageUpload = imageUploadComboInputDefinitionConfigSchema.safeParse(node[1]);
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
    .with(P.string, (type) => {
      const config = customInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse custom config");
      }
      return {
        kind: "CUSTOM" as const,
        config: config.data,
        type: type,
      };
    })
    .with(P.array(P.string), (options) => {
      const config = stringArrayInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse custom config");
      }
      return {
        kind: "STRING_ARRAY" as const,
        options: options,
        config: config.data,
      };
    })
    .with(P.array(P.number), (options) => {
      const config = numberArrayInputDefinitionConfigSchema.safeParse(node[1]);
      if (!config.success) {
        throw new Error("Failed to parse custom config");
      }
      return {
        //eg : PixverseTransitionVideoNode
        kind: "NUMBER_ARRAY" as const,
        config: config.data,
        options: options,
      };
    })
    .exhaustive();
  return parsed;
}

export const parsedInputDefinitionSchema = z.discriminatedUnion("kind", [
  z.object({
    name: z.string(),
    kind: z.literal("BOOLEAN"),
    config: booleanInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("STRING"),
    config: stringInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("INT"),
    config: intInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("FLOAT"),
    config: floatInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("FLOATS"),
    config: floatsInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("STRING_ARRAY_COMBO"),
    config: stringArrayComboInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("NUMBER_ARRAY_COMBO"),
    config: numberArrayComboInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("IMAGE_UPLOAD_COMBO"),
    config: imageUploadComboInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("*"),
  }),
  z.object({
    name: z.string(),
    kind: z.literal("CUSTOM"),
    config: customInputDefinitionConfigSchema,
    type: z.string(),
  }),
  z.object({
    name: z.string(),
    kind: z.literal("STRING_ARRAY"),
    options: z.array(z.string()),
    config: stringArrayInputDefinitionConfigSchema,
  }),
  z.object({
    name: z.string(),
    kind: z.literal("NUMBER_ARRAY"),
    options: z.array(z.number()),
    config: numberArrayInputDefinitionConfigSchema,
  }),
]);

const __typing_test__ = () => {
  const response: unknown = {};
  const parsed = getNodesResponseSchema.parse(response);
  const requiredInputs = Object.values(parsed.__typing_test__!.input.required!);
  const optionalInputs = Object.values(parsed.__typing_test__!.input.optional!);
  const schema = parsedInputDefinitionSchema.array();
  type T = z.infer<typeof schema>;

  // This should not compile if the output of getNodesResponseSchema is not
  // compatible with the input of parsedInputDefinitionSchema
  const _ensureRequiredInputsAreValid = requiredInputs satisfies T;
  const _ensureOptionalInputsAreValid = optionalInputs satisfies T;
};

export const comfyApiInputDefinitionSchema = z
  .tuple([z.union([z.string(), z.number().array(), z.string().array()]), z.unknown()])
  .transform(parseInputDefinition);

export const comfyNodeDefinitionSchema = z.object({
  input: z.object({
    required: z
      .record(z.string(), comfyApiInputDefinitionSchema)
      .optional()
      .transform((x) => {
        if (x === undefined) {
          return undefined;
        }
        return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, { ...value, name: key }]));
      }),
    optional: z
      .record(z.string(), comfyApiInputDefinitionSchema)
      .optional()
      .transform((x) => {
        if (x === undefined) {
          return undefined;
        }
        return Object.fromEntries(Object.entries(x).map(([key, value]) => [key, { ...value, name: key }]));
      }),
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
});

export type ComfyNodeDefinition = z.infer<typeof comfyNodeDefinitionSchema>;

const getNodesResponseSchema = z.record(z.string(), comfyNodeDefinitionSchema);

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
