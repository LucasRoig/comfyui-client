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
const _inputDefinitionSchema = z.union([
  z.tuple([z.literal("MODEL"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("CLIP_VISION"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("PIXVERSE_TEMPLATE"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("RECRAFT_COLOR"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("RECRAFT_V3_STYLE"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("RECRAFT_CONTROLS"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LUMA_CONCEPTS"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LUMA_REF"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LOAD3D_CAMERA"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("TIMESTEPS_RANGE"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("HOOK_KEYFRAMES"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("HOOKS"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("WEBCAM"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("SIGMAS"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("NOISE"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("GUIDER"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("SAMPLER"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("UPSCALE_MODEL"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LATENT_OPERATION"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("GLIGEN"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("STYLE_MODEL"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("PHOTOMAKER"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("CONTROL_NET"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LOAD_3D"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LOAD_3D_ANIMATION"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("CLIP_VISION_OUTPUT"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("MESH"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("VOXEL"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("CAMERA_CONTROL"), z.object({ tooltip: z.string().optional() })]),
  z.tuple([z.literal("SVG"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("AUDIO"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("CLIP"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("CONDITIONING"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("LATENT"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("MASK"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("VAE"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("IMAGE"), z.object({ tooltip: z.string().optional() }).optional()]),
  z.tuple([z.literal("VIDEO"), z.object({ tooltip: z.string().nullish() })]),
  // z.tuple([z.literal("BOOLEAN"), z.object({
  //   default: z.boolean().nullish(),
  //   tooltip: z.string().optional()
  // })]),
  // z.tuple([z.literal("*"), z.object({ })]),
  // z.tuple([z.literal("STRING"), z.object({
  //   multiline: z.boolean().nullish(),
  //   dynamicPrompts: z.boolean().nullish(),
  //   tooltip: z.string().nullish(),
  //   default: z.string().nullish(),
  // })]),
  // z.tuple([z.literal("INT"), z.object({
  //   default: z.number().nullish(),
  //   min: z.number(),
  //   max: z.number(),
  //   step: z.number().optional(),
  //   control_after_generate: z.boolean().optional(),
  //   tooltip: z.string().optional()
  // })]),
  // z.tuple([z.literal("FLOAT"), z.object({
  //   default: z.number().nullish(),
  //   min: z.number(),
  //   max: z.number(),
  //   step: z.number().nullish(),
  //   round: z.union([z.number(), z.boolean()]).nullish(),
  //   tooltip: z.string().optional()
  // })]),
  // z.tuple([z.literal("FLOATS"), z.object({
  //   default: z.number().nullish(),
  //   min: z.number().nullish(),
  //   max: z.number().nullish(),
  //   step: z.number().nullish(),
  //   forceInput: z.boolean().nullish(),
  //   tooltip: z.string().optional()
  // })]),
  // z.tuple([z.literal("COMBO"), z.object({
  //   options: z.array(z.union([z.string(), z.number()])),
  //   default: z.union([z.string(), z.number()]).nullish(),
  //   tooltip: z.string().nullish()
  // })]),
  // z.tuple([z.literal("COMBO"), z.object({
  //   image_upload: z.boolean(),
  //   image_folder: z.string(),
  //   remote: z.object({
  //     route: z.string(),
  //     refresh_button: z.boolean(),
  //     control_after_refresh: z.string(),
  //   })
  // })]),
  // z.tuple([z.array(z.union([z.string(), z.number()])), z.object({ tooltip: z.string().optional() }).optional()]),
]);

const nodeDefinitionSchema = z.object({
  input: z.object({
    required: z.record(z.string(), inputDefinitionSchema),
    optional: z.record(z.string(), inputDefinitionSchema).optional(),
    hidden: z.record(z.string(), z.string()).optional(),
  }),
  input_order: z.object(),
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
