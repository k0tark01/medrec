import type { Translations } from "@/lib/i18n/en";

type AuthLikeError = {
  code?: number;
  message?: string;
  type?: string;
};

// Map provider/internal auth errors to user-friendly localized messages.
export function getAuthErrorMessage(error: unknown, t: Translations): string {
  const err = (error ?? {}) as AuthLikeError;
  const message = (err.message ?? "").toLowerCase();

  if (err.code === 429 || message.includes("rate limit")) {
    return t.auth.rateLimited;
  }

  if (
    err.code === 409 ||
    message.includes("already exists") ||
    message.includes("duplicate") ||
    message.includes("account already exists")
  ) {
    return t.auth.emailAlreadyExists;
  }

  if (
    message.includes("invite link") ||
    message.includes("invite is no longer active") ||
    message.includes("membership") ||
    message.includes("secret") ||
    message.includes("token") ||
    message.includes("expired")
  ) {
    return t.staffInvite.invalidLink;
  }

  if (message.includes("invite") || message.includes("staff")) {
    return t.staffInvite.completeFailed;
  }

  if (
    err.code === 401 ||
    message.includes("invalid credentials") ||
    message.includes("invalid email") ||
    message.includes("invalid password")
  ) {
    return t.auth.invalidCredentials;
  }

  return t.auth.somethingWrong;
}
