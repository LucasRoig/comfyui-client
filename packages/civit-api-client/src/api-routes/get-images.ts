import type { KyInstance } from "ky";
import { err, ok } from "neverthrow";
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
      nsfLevel: nsfwEnum,
      createdAt: z.coerce.date(),
      postId: z.number(),
      stats: z.object({
        cryCount: z.number(),
        laughCount: z.number(),
        likeCount: z.number(),
        heartCount: z.number(),
        commentCount: z.number(),
      }),
      meta: z.object({}),
      userName: z.string(),
    }),
  ),
  metadata: z.object({
    nextCursor: z.number(),
    currentPage: z.number(),
    pageSize: z.number(),
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

export const getImages =
  (api: KyInstance) =>
  async (request: GetImagesRequest = {}) => {
    try {
      const response = await api
        .get(endpoint, {
          searchParams: request,
        })
        .json();
      const validResponse = getImagesResponseSchema.safeParse(response);
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
