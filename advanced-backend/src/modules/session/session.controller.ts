import { Context } from "hono";
import { SessionService } from "./session.service";
import { NotFoundException } from "../../common/utils/catchError";
import { HTTPSTATUS } from "../../config/http.config";
import { clearAuthenticationCookies } from "../../common/utils/cookie";

export class SessionController {
  private sessionService: SessionService;

  constructor(sessionService: SessionService) {
    this.sessionService = sessionService;
  }

  public async getAllSession(c: Context) {
    const { userId } = c.get("user");
    const sessionId = c.get("sessionId");

    const { sessions } = await this.sessionService.getAllSession(userId);

    const modifySession = sessions.map((s) => ({
      ...s,
      ...(s.id == sessionId && {
        isCurrent: true,
      }),
    }));

    return c.json({
      message: "Retrieved all session successfully",
      sessions: modifySession,
    });
  }

  public async getSession(c: Context) {
    const sessionId = c.get("sessionId");
    if (!sessionId) {
      throw new NotFoundException("Session ID not found. Please log in!");
    }

    const { user } = await this.sessionService.getSession(sessionId);

    return c.json({
      message: "Retrieved session successfully",
      user,
    });
  }

  public async deleteSession(c: Context) {
    const sessionIdContext = c.get("sessionId");
    const sessionId = c.req.param("sessionId");
    await this.sessionService.deleteSession(sessionId);
    if (sessionIdContext == sessionId) {
      clearAuthenticationCookies(c);
      return c.redirect("/auth/login");
    }
    return c.json({ message: "Session deleted successfully" }, HTTPSTATUS.OK);
  }
}
