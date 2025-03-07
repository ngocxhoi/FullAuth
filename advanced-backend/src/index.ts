import { logger } from "hono/logger";
import { Hono } from "hono";
import { config } from "./config/app.config";
import { cors } from "hono/cors";
import { corsConfig } from "./common/utils/corsConfig";
import { errorHandle } from "./middlewares/errorHandle";
import authRoutes from "./modules/auth/auth.routes";
import sessionRoutes from "./modules/session/session.routes";
import mfaRoutes from "./modules/mfa/mta.routes";

const app = new Hono().basePath(config.BASE_PATH);

app.use(logger());
app.use(cors(corsConfig));

app.route("/auth", authRoutes);
app.route("/session", sessionRoutes);
app.route("/mfa", mfaRoutes);

app.onError(errorHandle);

export default {
  port: config.PORT || 8000,
  fetch: app.fetch,
};
