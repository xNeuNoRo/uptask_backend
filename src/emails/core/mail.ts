import { mailConfig } from "@/config/mail";
import nodemailer, { Transporter } from "nodemailer";
import colors from "colors";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail, { Address } from "nodemailer/lib/mailer";
import { log, loggerFor, loggerForContext } from "@/lib/loggers";
import dns from "dns/promises";
import { AppError } from "@/utils";

const logger = loggerForContext(loggerFor("infra"), {
  component: "email",
});

export class MailUtils {
  static readonly transporter: Transporter<SMTPTransport.SentMessageInfo> =
    nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: { user: mailConfig.user, pass: mailConfig.pass },
    });

  static countRecipients(v?: Mail.Options["to"]) {
    if (!v) return 0;
    // Si es una lista de tipo string
    // Ej: "user@mail.com, admin@mail.com"
    if (typeof v === "string")
      return v
        .split(/[,;]+/) // splitear por (,) o (;)
        .map((s) => s.trim())
        .filter(Boolean).length;
    // Si es un array
    // Ej: ["a@mail.com", "b@mail.com"]
    if (Array.isArray(v)) return v.length;
    // Si es un obj tipo { address, name }
    return 1;
  }

  static parseEmails(to: string | Address | Array<string | Address>): string[] {
    // Si es un array
    if (Array.isArray(to)) {
      // Si es un string retornamos dicho string o el address
      return to.map((t) => (typeof t === "string" ? t : t.address));
    }
    return [typeof to === "string" ? to : to.address];
  }

  static async verifyMXRegistry(
    to: string | Address | Array<string | Address>,
  ) {
    const emails = this.parseEmails(to);

    for (const email of emails) {
      const emailDomain = email.split("@")[1];
      try {
        await dns.resolveMx(emailDomain);
      } catch (err) {
        throw new AppError("EMAIL_NOT_VALID");
      }
    }
  }

  static async sendMail(opts: Mail.Options) {
    const start = Date.now();
    try {
      // Verificar registros MX antes de enviar el correo
      // De esa manera evitamos errores de envío por dominios inválidos
      await this.verifyMXRegistry(opts.to!);
      new AppError("EMAIL_NOT_VALID");

      const info = await this.transporter.sendMail({
        from: opts.from ?? mailConfig.from,
        ...opts,
      });

      const accepted = info.accepted?.length ?? 0;
      const rejected = info.rejected?.length ?? 0;
      const totalSubjects =
        this.countRecipients(opts.to) +
        this.countRecipients(opts.cc) +
        this.countRecipients(opts.bcc);

      const status =
        accepted > 0 && rejected === 0
          ? "exitosamente"
          : accepted > 0
            ? "parcialmente"
            : "falló";
      const color =
        status === "exitosamente"
          ? colors.green
          : status === "parcialmente"
            ? colors.yellow
            : colors.red;

      const totalTime = Date.now() - start;
      log(
        logger,
        "info",
        `Email sent ${status}: ${accepted}/${totalSubjects || accepted} recipient(s) (~${totalTime}ms)`,
        {
          operation: "send",
          status: accepted > 0 ? "success" : "fail",
          durationMs: totalTime,
        },
      );
      return info;
    } catch (err) {
      if (err instanceof AppError) throw err;
      const totalTime = Date.now() - start;
      log(
        logger,
        "error",
        `Error sending email (~${totalTime}ms)`,
        {
          operation: "send",
          status: "fail",
          errorCode: "EMAIL_SEND_ERROR",
          durationMs: totalTime,
        },
        { err },
      );
      throw err;
    }
  }
}
