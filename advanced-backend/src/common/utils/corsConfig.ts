import { config } from "../../config/app.config";
import { type CORSOptions } from "hono/cors";

export const corsConfig: CORSOptions = {
  origin: config.APP_ORIGIN ?? "http://localhost:3000",
  allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PATCH", "PUT"],
  credentials: true,
};
