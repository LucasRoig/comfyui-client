import type { KyInstance } from "ky";
import { err, ok } from "neverthrow";
import z from "zod";

const modelTypeEnum = z.union([
  z.literal("Checkpoint"),
  z.literal("TextualInversion"),
  z.literal("Hypernetwork"),
  z.literal("AestheticGradient"),
  z.literal("LORA"),
  z.literal("Controlnet"),
  z.literal("Poses"),
]);

const getModelsResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      type: modelTypeEnum,
      nsfw: z.boolean(),
      tags: z.array(z.string()),
      mode: z.union([z.literal("Archived"), z.literal("TakenDown")]).nullable(),
      creator: z.object({
        username: z.string(),
        image: z.string().nullable(),
      }),
      stats: z.object({
        downloadCount: z.number(),
        favoriteCount: z.number(),
        commentCount: z.number(),
        ratingCount: z.number(),
        rating: z.number(),
      }),
      modelVersions: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          description: z.string(),
          createdAt: z.coerce.date(),
          downloadUrl: z.string(),
          trainedWords: z.array(z.string()),
          files: z.array(
            z.object({
              sizeKb: z.number(),
              pickleScanResult: z.string(),
              virusScanResult: z.string(),
              scannedAt: z.coerce.date().nullable(),
              primary: z.boolean().nullable(),
              metadata: z.object({
                fp: z.union([z.literal("fp16"), z.literal("fp32")]).nullable(),
                size: z.union([z.literal("full"), z.literal("pruned")]).nullable(),
                format: z.union([z.literal("SafeTensor"), z.literal("PickleTensor"), z.literal("Other")]).nullable(),
              }),
            }),
          ),
          images: z.array(
            z.object({
              id: z.string(),
              url: z.string(),
              nsfw: z.string(),
              width: z.number(),
              height: z.number(),
              hash: z.string(),
              meta: z.object({}).nullable(),
              stats: z.object({
                downloadCount: z.number(),
                ratingCount: z.number(),
                rating: z.number(),
              }),
            }),
          ),
        }),
      ),
    }),
  ),
  metadata: z.object({
    totalItems: z.string(),
    currentPage: z.string(),
    pageSize: z.string(),
    totalPages: z.string(),
    nextPage: z.string(),
    prevPage: z.string(),
  }),
});

const getModelsRequestSchema = z.object({
  limit: z.number().min(0).max(100).optional(),
  page: z.number().optional(),
  query: z.string().optional(),
  tag: z.string().optional(),
  username: z.string().optional(),
  type: modelTypeEnum.optional(),
  sort: z.union([z.literal("Highest Rated"), z.literal("Most Downloaded"), z.literal("Newest")]).optional(),
  period: z
    .union([z.literal("All Time"), z.literal("Year"), z.literal("Month"), z.literal("Week"), z.literal("Day")])
    .optional(),
  favorites: z.boolean().optional(),
  hidden: z.boolean().optional(),
  primaryFileOnly: z.boolean().optional(),
  allowNoCredit: z.boolean().optional(),
  allowDerivatives: z.boolean().optional(),
  allowDifferentLicenses: z.boolean().optional(),
  allowCommercialUse: z.union([z.literal("None"), z.literal("Image"), z.literal("Rent"), z.literal("Sell")]).optional(),
  nsfw: z.boolean().optional(),
  supportsGeneration: z.boolean().optional(),
});

export type GetModelsRequest = z.infer<typeof getModelsRequestSchema>;
export type GetModelsResponse = z.infer<typeof getModelsResponseSchema>;

export const getModels =
  (api: KyInstance) =>
  async (request: GetModelsRequest = {}) => {
    try {
      const response = await api
        .get("models", {
          searchParams: request,
        })
        .json();
      const validResponse = getModelsResponseSchema.safeParse(response);
      if (validResponse.success) {
        return ok(validResponse.data);
      } else {
        console.error(response);
        return err(validResponse.error);
      }
    } catch (error) {
      return err(error);
    }
  };
