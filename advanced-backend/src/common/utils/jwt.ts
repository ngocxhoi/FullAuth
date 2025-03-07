import { sign, verify } from "hono/jwt";
import { config } from "../../config/app.config";
import { calculateExpirationDate } from "./dateTime";

export type AccessPayload = {
  userId: string;
  sessionId: string;
};
const accessOpts = {
  secret: config.JWT.SECRET,
  exp: Math.floor(
    calculateExpirationDate(config.JWT.EXPIRES_IN).getTime() / 1000
  ),
};

export type RefreshPayload = {
  sessionId: string;
};
const refreshOpts = {
  secret: config.JWT.REFRESH_SECRET,
  exp: Math.floor(
    calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN).getTime() / 1000
  ),
};

export const signJwtToken = async (
  payload: AccessPayload | RefreshPayload,
  opt?: Object
) => {
  return await sign(
    {
      ...payload,
      ...opt,
      // @ts-ignore
      exp: payload?.userId ? accessOpts.exp : refreshOpts.exp,
    },
    // @ts-ignore
    payload?.userId ? accessOpts.secret : refreshOpts.secret
  );
};

export const verifyJwtToken = async (token: string, secret: string) => {
  try {
    const payload = await verify(token, secret);
    return payload;
  } catch (error) {
    throw error;
  }
};
