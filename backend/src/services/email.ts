import nodemailer from 'nodemailer';
import { env } from '../env.js';

export const emailEnabled = Boolean(env.smtpHost && env.smtpUser && env.smtpPassword);

const transporter = emailEnabled
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword
      }
    })
  : null;

export async function sendMail(options: { to: string; subject: string; text: string; html: string }) {
  if (!transporter) {
    console.warn(`[email-disabled] ${options.subject} -> ${options.to}\n${options.text}`);
    return { sent: false };
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });

  return { sent: true };
}

export async function sendActivationEmail(to: string, activationUrl: string) {
  return sendMail({
    to,
    subject: 'Activate your NIPS.live account',
    text: `Welcome to NIPS.live. Activate your account here: ${activationUrl}`,
    html: `<p>Welcome to <strong>NIPS.live</strong>.</p><p><a href="${activationUrl}">Activate your account</a></p><p>${activationUrl}</p>`
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendMail({
    to,
    subject: 'Reset your NIPS.live password',
    text: `Reset your NIPS.live password here: ${resetUrl}`,
    html: `<p>Reset your <strong>NIPS.live</strong> password.</p><p><a href="${resetUrl}">Reset password</a></p><p>${resetUrl}</p>`
  });
}
