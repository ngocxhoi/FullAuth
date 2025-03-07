import { Context } from "hono";
import { setCookie, deleteCookie } from "hono/cookie";
import { CookieOptions } from "hono/utils/cookie";
import { config } from "../../config/app.config";
import { calculateExpirationDate, thirtyDaysFromNow } from "./dateTime";
import { signJwtToken } from "./jwt";
import { SessionService } from "../../modules/session/session.service";

type CookiePayloadType = {
  c: Context;
  accessToken: string;
  refreshToken: string;
};

const sessionService = new SessionService();
export const REFRESH_PATH = "/api/v1/auth/refresh";

export const cookieAccessTokenOptions: CookieOptions = {
  httpOnly: true,
  expires: calculateExpirationDate(config.JWT.EXPIRES_IN),
};
export const cookieRefreshTokenOptions: CookieOptions = {
  httpOnly: true,
  expires: calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN),
  path: REFRESH_PATH,
};
export const setAuthenticationCookies = ({
  c,
  accessToken,
  refreshToken,
}: CookiePayloadType) => {
  setCookie(c, "accessToken", accessToken, cookieAccessTokenOptions);
  setCookie(c, "refreshToken", refreshToken, cookieRefreshTokenOptions);
};

export const clearAuthenticationCookies = (c: Context) => {
  deleteCookie(c, "accessToken");
  deleteCookie(c, "refreshToken", {
    path: REFRESH_PATH,
  });
};

export const generateCookie = async (userId: string, userAgent?: string) => {
  const session = await sessionService.createSession(userId, userAgent);

  const accessToken = await signJwtToken({
    userId,
    sessionId: session.id,
  });

  const refreshToken = await signJwtToken({
    sessionId: session.id,
  });

  return {
    accessToken,
    refreshToken,
  };
};
