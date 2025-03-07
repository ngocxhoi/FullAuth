import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catchError";
import db from "../../database/db";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { User } from "@prisma/client";
import { signJwtToken } from "../../common/utils/jwt";
import { thirtyDaysFromNow } from "../../common/utils/dateTime";
import { SessionService } from "../session/session.service";

const sessionService = new SessionService();

export class MfaService {
  public async generateMfaSetup(user: User) {
    let secretKey = user.twoFactorSecret;

    if (user.enable2FA) {
      return {
        message: "MFA already enabled!",
        secretKey: null,
        qrImageUrl: null,
      };
    }

    if (!secretKey) {
      const secret = speakeasy.generateSecret({
        name: "Ngocxhoi",
      });
      secretKey = secret.base32;
      user.twoFactorSecret = secretKey;
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          twoFactorSecret: secretKey,
        },
      });
    }

    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: user.name,
      issuer: "ngocxhoi.com",
      encoding: "base32",
    });

    const qrImageUrl = await qrcode.toDataURL(url);

    return {
      message: "Scan the QR code to set up MFA",
      secretKey,
      qrImageUrl,
    };
  }

  public async verifyMfaSetup(code: string, user: User) {
    if (user.enable2FA) {
      return {
        message: "MFA already enabled!",
        enable2FA: true,
      };
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code!");
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        enable2FA: true,
      },
    });

    return {
      message: "MFA setup successfully!",
      enable2FA: true,
    };
  }

  public async revokeMfaSetup(user: User) {
    if (!user.enable2FA) {
      return {
        message: "MFA not enabled!",
        enable2FA: false,
      };
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        enable2FA: false,
        twoFactorSecret: null,
      },
    });

    return {
      message: "MFA revoked successfully!",
      enable2FA: false,
    };
  }

  public async verifyMfaSetupForLogin(
    code: string,
    email: string,
    userAgent: string
  ) {
    const user = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found!");
    }

    if (!user.enable2FA && !user.twoFactorSecret) {
      throw new UnauthorizedException("MFA not enabled for this user!");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret!,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code!");
    }

    const session = await sessionService.createSession(user.id, userAgent);

    const accessToken = await signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = await signJwtToken({
      sessionId: session.id,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
