export interface UserSchema {
  message: string;
  data: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  enable2FA: boolean;
}

export interface SuccessResponse {
  message: string;
}

export interface LoginType {
  email: string;
  password: string;
}

export interface RegisterType extends LoginType {
  name: string;
  confirmPassword: string;
  userAgent?: string;
}

export interface APIResponseType {
  message: string;
  data?: {
    [key: string]: any;
  };
  sessions?: SessionType[];
}

export interface APIResponseError {
  error: string;
  cause?: string;
}

export interface MfaType {
  message: string;
  secret: string;
  qrImageUrl: string;
}

export interface MfaVerify {
  code: string;
  secretKey?: string;
}

export interface SessionType {
  id: string;
  sessionToken: string | null;
  userAgent: string | null;
  userId: string;
  expires: Date;
  isCurrent?: boolean;
}
