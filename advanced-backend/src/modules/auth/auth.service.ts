import { ErrorCode } from "../../common/enums/errorCode.enum";
import { VerificationEnum } from "../../common/enums/verificationCode.enum";
import {
  BadRequestException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catchError";
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  thirtyDaysFromNow,
  threeMinutesAgo,
} from "../../common/utils/dateTime";
import {
  LoginSchema,
  RegisterSchema,
} from "../../common/validators/auth.validator";
import db from "../../database/db";
import { signJwtToken, verifyJwtToken } from "../../common/utils/jwt";
import { config } from "../../config/app.config";
import { generateOTP } from "../../common/utils/OTP";
import { sendEmail } from "../../mailer/mailer";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from "../../mailer/template";
import { HTTPSTATUS } from "../../config/http.config";
import { generateCookie } from "../../common/utils/cookie";

export class AuthService {
  public async getUser(accessToken: string) {
    const payload = await verifyJwtToken(accessToken, config.JWT.SECRET);
    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token!");
    }
    const user = await db.user.findUnique({
      where: { id: payload.userId as string },
    });
    return {
      user,
    };
  }

  public async register(data: RegisterSchema) {
    const { email, name, password, confirmPassword, userAgent } = data;

    if (password !== confirmPassword)
      throw new BadRequestException("Password does not match");

    const existingUser = await db.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const hashedPassword = await Bun.password.hash(password);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        enable2FA: true,
      },
    });

    const verificationCode = await db.verificationCode.create({
      data: {
        userId: newUser.id,
        type: VerificationEnum.EMAIL_VERIFICATION,
        expires: fortyFiveMinutesFromNow(),
        code: generateOTP(),
      },
    });

    if (!verificationCode.code)
      throw new InternalServerException(
        "Failed to create verification code",
        ErrorCode.AUTH_TOKEN_NOT_FOUND
      );

    const verificationUrl = `${config.APP_ORIGIN}/auth/confirm-account?code=${verificationCode.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    const { accessToken, refreshToken } = await generateCookie(
      newUser.id,
      userAgent
    );

    return {
      user: newUser,
      verificationCode,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async login(data: LoginSchema) {
    const { email, password, userAgent } = data;

    const user = await db.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        password: true,
        enable2FA: true,
      },
    });

    if (!user)
      throw new InternalServerException(
        "User not found",
        ErrorCode.AUTH_USER_NOT_FOUND
      );

    const isPasswordCorrect = await Bun.password.verify(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_NOT_FOUND
      );
    }

    if (!user.isEmailVerified) {
      let code = "";
      const verificationCode = await db.verificationCode.findFirst({
        where: {
          userId: user.id,
          type: VerificationEnum.EMAIL_VERIFICATION,
        },
      });

      if (verificationCode) {
        if (verificationCode.expires < new Date()) {
          db.verificationCode.deleteMany({
            where: {
              userId: user.id,
              type: VerificationEnum.EMAIL_VERIFICATION,
            },
          });

          const newVerificationCode = await db.verificationCode.create({
            data: {
              userId: user.id,
              type: VerificationEnum.EMAIL_VERIFICATION,
              expires: fortyFiveMinutesFromNow(),
              code: generateOTP(),
            },
          });

          if (!newVerificationCode)
            throw new BadRequestException("Cannot create code verification!");

          code = newVerificationCode.code;
        } else code = verificationCode.code;
      } else {
        const newVerificationCode = await db.verificationCode.create({
          data: {
            userId: user.id,
            type: VerificationEnum.EMAIL_VERIFICATION,
            expires: fortyFiveMinutesFromNow(),
            code: generateOTP(),
          },
        });

        if (!newVerificationCode) {
          throw new BadRequestException("Cannot create code verification!");
        }
        code = newVerificationCode.code;
      }

      const verificationUrl = `${config.APP_ORIGIN}/auth/confirm-account?code=${code}`;
      await sendEmail({
        to: user.email,
        ...verifyEmailTemplate(verificationUrl),
      });
    }

    const { accessToken, refreshToken } = await generateCookie(
      user.id,
      userAgent
    );

    return {
      user: {
        ...user,
        password: undefined,
      },
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async refreshToken(refreshToken: string) {
    const payload = await verifyJwtToken(
      refreshToken,
      config.JWT.REFRESH_SECRET
    );
    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token!");
    }

    const session = await db.session.findUnique({
      where: {
        id: payload.sessionId as string,
      },
    });

    if (!session) {
      throw new UnauthorizedException(
        "Invalid refresh token or session does not exist!"
      );
    }

    const now = new Date();

    if (session.expires <= now) {
      throw new UnauthorizedException("Session expired! Please login again!");
    }

    const sessionRequireRefresh =
      session.expires.getTime() - now.getTime() < ONE_DAY_IN_MS;
    if (sessionRequireRefresh) {
      await db.session.update({
        where: {
          id: session.id,
        },
        data: {
          expires: calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN),
        },
      });
    }

    const newRefreshToken = sessionRequireRefresh
      ? await signJwtToken({
          sessionId: session.id,
        })
      : undefined;

    const accessToken = await signJwtToken({
      userId: session.userId,
      sessionId: session.id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(code: string, accessToken: string) {
    const payload = await verifyJwtToken(accessToken, config.JWT.SECRET);
    if (!payload) {
      throw new UnauthorizedException("Invalid access token!");
    }
    const validCode = await db.verificationCode.findFirst({
      where: {
        code: code,
        userId: payload.userId as string,
        type: VerificationEnum.EMAIL_VERIFICATION,
      },
    });
    if (!validCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }
    const updatedUser = await db.user.update({
      where: {
        id: payload.userId as string,
      },
      data: {
        isEmailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        enable2FA: true,
      },
    });

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email!",
        ErrorCode.VALIDATION_ERROR
      );
    }

    await db.verificationCode.delete({
      where: {
        id: validCode.id,
      },
    });
    return {
      user: updatedUser,
    };
  }

  public async forgotPassword(email: string) {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new NotFoundException("User not found");

    const timeAgo = threeMinutesAgo();
    const maxAttempt = 2;

    const count = await db.verificationCode.findMany({
      where: {
        userId: user.id,
        type: VerificationEnum.PASSWORD_RESET,
        createdAt: {
          gt: timeAgo,
        },
      },
    });

    if (count.length >= maxAttempt) {
      throw new HttpException(
        "Too many attempts, please try again later!",
        HTTPSTATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS
      );
    }

    const validCode = await db.verificationCode.create({
      data: {
        userId: user.id,
        code: generateOTP(),
        type: VerificationEnum.PASSWORD_RESET,
        expires: anHourFromNow(),
      },
    });

    const resetLink = `${config.APP_ORIGIN}/auth/reset-password?code=${
      validCode.code
    }&exp=${validCode.expires.getTime()}&id=${user.id}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return {
      url: resetLink,
      emailId: data.id,
    };
  }

  public async resetPassword(password: string, code: string, userId: string) {
    const validCode = await db.verificationCode.findFirst({
      where: {
        code: code,
        type: VerificationEnum.PASSWORD_RESET,
        userId,
      },
    });

    if (!validCode) {
      throw new NotFoundException("Invalid or expired verification code");
    }

    const hashedPassword = await Bun.password.hash(password);

    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        enable2FA: true,
      },
    });

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to reset password!",
        ErrorCode.VALIDATION_ERROR
      );
    }

    await db.verificationCode.delete({
      where: {
        id: validCode.id,
      },
    });

    await db.session.deleteMany({
      where: {
        userId: updatedUser.id,
      },
    });

    return {
      user: updatedUser,
    };
  }

  public async logout(sessionId: string) {
    await db.session.delete({
      where: {
        id: sessionId as string,
      },
    });
  }

  public async deleteAll() {
    await db.user.deleteMany();
    await db.session.deleteMany();
    await db.verificationCode.deleteMany();
  }
}
