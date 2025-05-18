import type { KyInstance } from "ky";
import { err, ok } from "neverthrow";

export const getImage = (api: KyInstance) => async (filename: string) => {
  try {
    const response = await api.get("view", {
      searchParams: {
        filename,
      },
    });
    const file = await response.arrayBuffer();
    return ok(file);
  } catch (error) {
    return err(error);
  }
};
