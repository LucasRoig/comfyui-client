import ky from "ky";
import { getImages } from "./api-routes/get-images";
import { getModels } from "./api-routes/get-models";

export type { GetImagesRequest, GetImagesResponse } from "./api-routes/get-images";
export type { GetModelsRequest, GetModelsResponse } from "./api-routes/get-models";

export function createCivitClient(url: string) {
  const api = ky.create({
    prefixUrl: url,
    // throwHttpErrors: false
  });
  return {
    getImages: getImages(api),
    getModels: getModels(api),
  };
}
