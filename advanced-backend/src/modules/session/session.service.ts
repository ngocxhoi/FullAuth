import { NotFoundException } from "../../common/utils/catchError";
import { thirtyDaysFromNow } from "../../common/utils/dateTime";
import db from "../../database/db";

export class SessionService {
  public async createSession(userId: string, userAgent?: string) {
    const session = await db.session.create({
      data: {
        userId,
        userAgent,
        expires: thirtyDaysFromNow(),
      },
    });

    return session;
  }

  public async getAllSession(userId: string) {
    const sessions = await db.session.findMany({
      where: {
        userId,
      },
      orderBy: {
        expires: "desc",
      },
    });
    return {
      sessions,
    };
  }

  public async getSession(sessionId: string) {
    const session = await db.session.findUniqueOrThrow({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException("Session not found");
    }

    return { user: session.userId };
  }

  public async deleteSession(sessionId: string) {
    const deletedSession = await db.session.delete({
      where: { id: sessionId },
    });
    if (!deletedSession) {
      throw new NotFoundException("Session not found");
    }

    return;
  }
}
