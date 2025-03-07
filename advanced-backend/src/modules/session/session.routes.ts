import { Hono } from "hono";
import { SessionService } from "./session.service";
import { SessionController } from "./session.controller";
import { authHandler } from "../../middlewares/authHandler";

const sessionRoutes = new Hono();
sessionRoutes.use(authHandler);

const sessionServices = new SessionService();
const sessionController = new SessionController(sessionServices);

sessionRoutes
  .get("/all", async (c) => await sessionController.getAllSession(c))
  .get("/", async (c) => await sessionController.getSession(c))
  .delete("/:sessionId", async (c) => await sessionController.deleteSession(c));

export default sessionRoutes;
