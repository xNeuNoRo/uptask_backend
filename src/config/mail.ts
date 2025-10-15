export const mailConfig = {
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER!,
  pass: process.env.SMTP_PASS!,
  from: `"${process.env.APP_NAME}" <no-reply@${process.env.APP_DOMAIN}>`,
} as const;
