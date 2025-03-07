import { ContentfulStatusCode } from "hono/utils/http-status";

export interface HttpStatusCodesCustom {
  OK: ContentfulStatusCode;
  CREATED: ContentfulStatusCode;
  ACCEPTED: ContentfulStatusCode;
  BAD_REQUEST: ContentfulStatusCode;
  UNAUTHORIZED: ContentfulStatusCode;
  FORBIDDEN: ContentfulStatusCode;
  NOT_FOUND: ContentfulStatusCode;
  METHOD_NOT_ALLOWED: ContentfulStatusCode;
  CONFLICT: ContentfulStatusCode;
  UNPROCESSABLE_ENTITY: ContentfulStatusCode;
  TOO_MANY_REQUESTS: ContentfulStatusCode;
  INTERNAL_SERVER_ERROR: ContentfulStatusCode;
  NOT_IMPLEMENTED: ContentfulStatusCode;
  BAD_GATEWAY: ContentfulStatusCode;
  SERVICE_UNAVAILABLE: ContentfulStatusCode;
  GATEWAY_TIMEOUT: ContentfulStatusCode;
}
