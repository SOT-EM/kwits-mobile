import { z } from "zod";

import { PASSWORD_MIN_LENGTH, USERNAME_MIN_LENGTH } from "@/constants/auth";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(USERNAME_MIN_LENGTH, `Must be at least ${USERNAME_MIN_LENGTH} characters.`),
    fullName: z.string().trim().min(1, "Enter your full name."),
    email,
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Must be at least ${PASSWORD_MIN_LENGTH} characters.`),
    confirmPassword: z.string().min(1, "Re-enter your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
