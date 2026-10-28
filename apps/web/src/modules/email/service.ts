import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "@/lib/env";

/**
 * Transactional email, isolated behind a single function so the SMTP provider
 * (Brevo today) can be swapped without touching callers.
 *
 * Delivery is best-effort by contract: callers must never fail a user-facing
 * action (a booking, a signup) because an email could not be sent, so this
 * returns a result instead of throwing. Recipients, subjects and bodies are
 * private correspondence and are never logged.
 */

export type EmailMessage = {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly replyTo?: string;
};

export type EmailResult =
  | { readonly status: "sent" }
  | { readonly status: "skipped"; readonly reason: "not-configured" }
  | { readonly status: "failed" };

let cached: { transporter: Transporter; from: string } | null | undefined;

function transport() {
  if (cached !== undefined) return cached;
  const env = serverEnv();
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || !env.EMAIL_FROM) {
    cached = null;
    return cached;
  }
  cached = {
    from: env.EMAIL_FROM,
    transporter: nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      // 587 upgrades with STARTTLS; require it so credentials never cross in clear.
      secure: env.SMTP_PORT === 465,
      requireTLS: env.SMTP_PORT !== 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      connectionTimeout: 10_000,
      socketTimeout: 15_000,
    }),
  };
  return cached;
}

export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const configured = transport();
  if (!configured) return { status: "skipped", reason: "not-configured" };

  try {
    await configured.transporter.sendMail({
      from: configured.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      replyTo: message.replyTo,
    });
    return { status: "sent" };
  } catch (error) {
    // Log the failure class only — error text can echo addresses or credentials.
    console.error(
      JSON.stringify({
        event: "email.failed",
        code: (error as { code?: string }).code ?? "UNKNOWN",
      }),
    );
    return { status: "failed" };
  }
}
