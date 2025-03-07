import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8),
});
type LoginSchema = z.infer<typeof loginSchema>;

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(3).max(200),
    confirmPassword: z.string().min(8),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type RegisterSchema = z.infer<typeof registerSchema>;

const providerAccount = z.object({
  provider: z.enum(["google", "github", "credentials"]),
  providerAccountId: z.string().email(),
});
type ProviderAccount = z.infer<typeof providerAccount>;

const emailSchema = z.object({
  email: z.string().trim().email().min(1).max(255),
});
const resetPasswordSchema = z
  .object({
    password: z.string().trim().min(6).max(255),
    confirmPassword: z.string().trim().min(6).max(255),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export {
  loginSchema,
  registerSchema,
  providerAccount,
  emailSchema,
  resetPasswordSchema,
};
export type { LoginSchema, RegisterSchema, ProviderAccount };
