import type { KyInstance } from "ky";
import z from "zod";

const endpoint = "api/v1/images";

const nsfwEnum = z.union([z.literal("None"), z.literal("Soft"), z.literal("Mature"), z.literal("X")]);

const getImagesResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      url: z.string(),
      hash: z.string(),
      width: z.number(),
      height: z.number(),
      nsfw: z.boolean(),
      nsfwLevel: nsfwEnum,
      createdAt: z.coerce.date(),
      postId: z.number(),
      stats: z.object({
        cryCount: z.number(),
        laughCount: z.number(),
        likeCount: z.number(),
        heartCount: z.number(),
        commentCount: z.number(),
      }),
      meta: z.object({}).nullable(),
      username: z.string(),
    }),
  ),
  metadata: z.object({
    nextCursor: z.string(),
    nextPage: z.string(),
  }),
});

const getImagesRequestSchema = z.object({
  limit: z.number().min(0).max(200).optional(),
  postId: z.number().optional(),
  modelId: z.number().optional(),
  modelVersionId: z.number().optional(),
  userName: z.string().optional(),
  nsfw: nsfwEnum.optional(),
  sort: z.union([z.literal("Most Reactions"), z.literal("Most Comments"), z.literal("Newest")]).optional(),
  period: z
    .union([z.literal("All Time"), z.literal("Year"), z.literal("Month"), z.literal("Week"), z.literal("Day")])
    .optional(),
  page: z.number().optional(),
});
export type GetImagesRequest = z.infer<typeof getImagesRequestSchema>;
export type GetImagesResponse = z.infer<typeof getImagesResponseSchema>;

export const getImages =
  (api: KyInstance) =>
  async (request: GetImagesRequest = {}) => {
    const response = await api
      .get(endpoint, {
        searchParams: request,
      })
      .json();
    return getImagesResponseSchema.parse(response);
  };
