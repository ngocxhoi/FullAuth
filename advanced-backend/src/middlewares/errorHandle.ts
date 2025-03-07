import { Context } from "hono";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../common/utils/appError";
import { z } from "zod";
import {
  clearAuthenticationCookies,
  REFRESH_PATH,
} from "../common/utils/cookie";
import { Prisma } from "@prisma/client";

const formatZodError = (c: Context, err: z.ZodError) => {
  const errors = err.issues.map((e) => ({
    field: e.path.join("."),
    message: e.message,
  }));

  return c.json(
    {
      message: "Validation Error",
      errors: errors,
    },
    HTTPSTATUS.BAD_REQUEST
  );
};

export const errorHandle = async (err: Error, c: Context) => {
  // if (c.req.path == REFRESH_PATH) {
  //   clearAuthenticationCookies(c);
  // }

  if (err instanceof SyntaxError) {
    return c.json({ error: "Invalid syntax" }, HTTPSTATUS.BAD_REQUEST);
  }

  if (err instanceof z.ZodError) {
    return formatZodError(c, err);
  }

  if (err instanceof AppError) {
    return c.json(
      { error: err.message, cause: err.name },
      HTTPSTATUS.BAD_REQUEST
    );
  }

  return c.json({ error: err.message }, HTTPSTATUS.INTERNAL_SERVER_ERROR);
};
