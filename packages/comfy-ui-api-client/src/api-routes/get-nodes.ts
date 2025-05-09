import type { KyInstance } from "ky";
import z from "zod";

const getNodesResponseSchema = z.record(
  z.string(),
  z.object({
    input: z.object(),
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
  }),
);

export const getNodes = (api: KyInstance) => async () => {
  try {
    const response = await api.get("object_info").json();
    return getNodesResponseSchema.parse(response);
  } catch (error) {
    console.error(JSON.stringify(error));
    throw error;
  }
};
