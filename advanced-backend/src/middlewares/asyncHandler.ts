import { Context } from "hono";

type AsyncControllerType = (c: Context) => Promise<Response>;

export const asyncHandler =
  (controller: AsyncControllerType): AsyncControllerType =>
  async (c) => {
    try {
      return await controller(c);
    } catch (error: any) {
      console.error("Catch error in asyncHandler", error);
      throw error;
    }
  };
