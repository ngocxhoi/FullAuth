import { Context } from "hono";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { AuthService } from "./auth.service";
import { HTTPSTATUS } from "../../config/http.config";
import {
  LoginSchema,
  RegisterSchema,
} from "../../common/validators/auth.validator";
import {
  clearAuthenticationCookies,
  cookieAccessTokenOptions,
  cookieRefreshTokenOptions,
  setAuthenticationCookies,
} from "../../common/utils/cookie";
import { getCookie, setCookie } from "hono/cookie";
import {
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catchError";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public getUser = asyncHandler(async (c: Context) => {
    const accessToken = getCookie(c, "accessToken");
    if (!accessToken) throw new UnauthorizedException("Missing access token!");
    const user = await this.authService.getUser(accessToken);
    return c.json(
      {
        message: "User fetched successfully",
        user,
      },
      HTTPSTATUS.OK
    );
  });

  public checkAccess = async (c: Context) => {
    const accessToken = getCookie(c, "accessToken");
    if (accessToken) return c.body("YES");
    else return c.body("NO");
  };

  public register = asyncHandler(async (c: Context) => {
    const body: RegisterSchema = await c.req.json();
    const { user, accessToken, refreshToken } = await this.authService.register(
      body
    );

    setAuthenticationCookies({ c, accessToken, refreshToken });

    return c.json(
      {
        message: "User registered successfully",
        data: user,
      },
      HTTPSTATUS.CREATED
    );
  });

  public login = asyncHandler(async (c: Context) => {
    const body: LoginSchema = await c.req.json();
    const { user, accessToken, refreshToken, mfaRequired } =
      await this.authService.login(body);

    setAuthenticationCookies({ c, accessToken, refreshToken });

    return c.json(
      {
        message: "Login successful",
        data: user,
      },
      HTTPSTATUS.OK
    );
  });

  public refreshToken = asyncHandler(async (c: Context) => {
    const refreshToken = getCookie(c, "refreshToken");
    if (!refreshToken) throw new UnauthorizedException("Please login first!");

    const { accessToken, newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    if (newRefreshToken) {
      setCookie(c, "refreshToken", newRefreshToken, cookieRefreshTokenOptions);
    }
    setCookie(c, "accessToken", accessToken, cookieAccessTokenOptions);

    return c.json(
      {
        message: "Refresh access token successful",
      },
      HTTPSTATUS.OK
    );
  });

  public verifyEmail = asyncHandler(async (c: Context) => {
    const accessToken = getCookie(c, "accessToken");
    if (!accessToken) throw new UnauthorizedException("Missing access token!");
    const { code } = await c.req.json();
    const { user } = await this.authService.verifyEmail(code, accessToken);
    return c.json(
      { message: "Email verified successfully", user },
      HTTPSTATUS.OK
    );
  });

  public forgotPassword = asyncHandler(async (c: Context) => {
    const { email } = await c.req.json();
    await this.authService.forgotPassword(email);
    return c.json(
      {
        message: "Password reset email sent!",
      },
      HTTPSTATUS.OK
    );
  });

  public resetPassword = asyncHandler(async (c: Context) => {
    const { code, password, userId } = await c.req.json();
    await this.authService.resetPassword(password, code, userId);
    clearAuthenticationCookies(c);
    return c.json(
      {
        message: "Reset password successfully!",
      },
      HTTPSTATUS.OK
    );
  });

  public logout = asyncHandler(async (c: Context) => {
    const sessionId = c.get("sessionId");

    await this.authService.logout(sessionId);
    clearAuthenticationCookies(c);
    return c.json(
      {
        message: "Logout successfully",
      },
      HTTPSTATUS.OK
    );
  });

  public deleteAll = async (c: Context) => {
    await this.authService.deleteAll();
    return c.json({ message: "All data deleted successfully" }, HTTPSTATUS.OK);
  };
}
