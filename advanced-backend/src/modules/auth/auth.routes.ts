import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationEmailSchema,
} from "../../common/validators/auth.validator";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { authHandler } from "../../middlewares/authHandler";

const authRoutes = new Hono();

const authService = new AuthService();
const authController = new AuthController(authService);

authRoutes
  .get("/user", async (c) => await authController.getUser(c))
  .get("/access/check", async (c) => await authController.checkAccess(c))
  .post(
    "/register",
    zValidator("json", registerSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await authController.register(c)
  )
  .post(
    "/login",
    zValidator("json", loginSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await authController.login(c)
  )
  .post("/refresh", async (c) => await authController.refreshToken(c))
  .post(
    "/verify/email",
    zValidator("json", verificationEmailSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await authController.verifyEmail(c)
  )
  .post(
    "/password/forgot",
    zValidator("json", forgotPasswordSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await authController.forgotPassword(c)
  )
  .post(
    "/password/reset",
    zValidator("json", resetPasswordSchema, (result, c) => {
      if (!result.success) throw result.error;
    }),
    async (c) => await authController.resetPassword(c)
  )
  .post("/logout", authHandler, async (c) => await authController.logout(c))
  .delete("/delete/all", async (c) => await authController.deleteAll(c));

export default authRoutes;
