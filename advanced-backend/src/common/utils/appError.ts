import { HttpStatusCode, HTTPSTATUS } from "../../config/http.config";
import { ErrorCode } from "../enums/errorCode.enum";

export class AppError extends Error {
  statusCode: HttpStatusCode;

  constructor(
    message: string,
    status = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCode
  ) {
    super(message);
    this.statusCode = status;
    this.name = errorCode as string;

    Error.captureStackTrace(this, this.constructor);
  }
}
