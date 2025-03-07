import { Context } from "hono";
import { MfaService } from "./mfa.service";
import { UnauthorizedException } from "../../common/utils/catchError";
import { HTTPSTATUS } from "../../config/http.config";
import { User } from "@prisma/client";
import { setAuthenticationCookies } from "../../common/utils/cookie";

export class MfaController {
  private mfaService: MfaService;

  constructor(mfaService: MfaService) {
    this.mfaService = mfaService;
  }

  public async generateMfaSetup(c: Context) {
    const user: User = c.get("user");

    const { message, secretKey, qrImageUrl } =
      await this.mfaService.generateMfaSetup(user);

    return c.json(
      {
        message: "MFA setup successfully",
        data: {
          message,
          qrImageUrl,
          secret: secretKey,
        },
      },
      HTTPSTATUS.OK
    );
  }

  public async verifyMfaSetup(c: Context) {
    const user: User = c.get("user");
    const { code, secretKey } = await c.req.json();

    if (user.twoFactorSecret !== secretKey) {
      throw new UnauthorizedException("Invalid secret key!");
    }

    const { enable2FA, message } = await this.mfaService.verifyMfaSetup(
      code,
      user
    );

    return c.json(
      {
        message,
        enable2FA,
      },
      HTTPSTATUS.OK
    );
  }

  public async revokeMfaSetup(c: Context) {
    const user: User = c.get("user");
    const { message, enable2FA } = await this.mfaService.revokeMfaSetup(user);

    return c.json({ message, enable2FA }, HTTPSTATUS.OK);
  }

  public async verifyMfaSetupForLogin(c: Context) {
    const { code, email, userAgent } = await c.req.json();

    const { user, accessToken, refreshToken } =
      await this.mfaService.verifyMfaSetupForLogin(code, email, userAgent);

    setAuthenticationCookies({ c, accessToken, refreshToken });
    return c.json(
      { message: "MFA verified & login successfully!", user },
      HTTPSTATUS.OK
    );
  }
}
