import ky from "ky";
import { getImages } from "./api-routes/get-images";
import { getModels } from "./api-routes/get-models";
export type { GetImagesResponse, GetImagesRequest } from "./api-routes/get-images";
export type { GetModelsResponse, GetModelsRequest } from "./api-routes/get-models";

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
