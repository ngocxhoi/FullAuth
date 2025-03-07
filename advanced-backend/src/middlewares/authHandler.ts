import { Next, Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { config } from "../config/app.config";
import { UnauthorizedException } from "../common/utils/catchError";
import { ErrorCode } from "../common/enums/errorCode.enum";
import db from "../database/db";

export const authHandler = async (c: Context, next: Next) => {
  if (c.req.path == "/verify/login") return await next();
  try {
    const accessToken = getCookie(c, "accessToken");
    if (!accessToken) {
      throw new UnauthorizedException(
        "Unauthorized access token or not found!",
        ErrorCode.AUTH_TOKEN_NOT_FOUND
      );
    }
    const payload = await verify(accessToken, config.JWT.SECRET);

    const userInContext = c.get("user");
    if (!userInContext) {
      const user = await db.user.findUnique({
        where: { id: payload.userId as string },
      });
      if (!user) {
        throw new UnauthorizedException(
          "User not found!",
          ErrorCode.AUTH_USER_NOT_FOUND
        );
      }
      c.set("user", user);
      c.set("sessionId", payload.sessionId);
    }
    return await next();
  } catch (error) {
    throw error;
  }
};
