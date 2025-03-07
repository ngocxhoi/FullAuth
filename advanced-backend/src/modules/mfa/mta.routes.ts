import { Hono } from "hono";
import { MfaService } from "./mfa.service";
import { MfaController } from "./mta.controller";
import { authHandler } from "../../middlewares/authHandler";
import { zValidator } from "@hono/zod-validator";
import {
  verifyMfaSchema,
  verifyMfaForLoginSchema,
} from "../../common/validators/mfa.validator";

const mfaRoutes = new Hono();
mfaRoutes.use("/setup", authHandler);
mfaRoutes.use("/verify", authHandler);
mfaRoutes.use("/revoke", authHandler);

const mfaService = new MfaService();
const mfaController = new MfaController(mfaService);

mfaRoutes
  .get("/setup", async (c) => await mfaController.generateMfaSetup(c))
  .post(
    "/verify",
    zValidator("json", verifyMfaSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await mfaController.verifyMfaSetup(c)
  )
  .put("/revoke", async (c) => await mfaController.revokeMfaSetup(c))
  .post(
    "/verify/login",
    zValidator("json", verifyMfaForLoginSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await mfaController.verifyMfaSetupForLogin(c)
  );

export default mfaRoutes;
