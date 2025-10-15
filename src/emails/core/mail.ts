import { mailConfig } from "@/config/mail";
import nodemailer, { Transporter } from "nodemailer";
import colors from "colors";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import Mail from "nodemailer/lib/mailer";

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

  static async sendMail(opts: Mail.Options) {
    const start = Date.now();
    try {
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
      const totalTime = Date.now() - start;

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

      console.log(
        color(
          `[MAILER] Se envió ${status}: ${accepted}/${totalSubjects || accepted} destinatario(s) (~${totalTime}ms)`,
        ),
      );
      return info;
    } catch (err) {
      const totalTime = Date.now() - start;
      console.error(
        colors.red(
          `[MAILER] Ha ocurrido un error al enviar un mail (~${totalTime}ms): ${err instanceof Error ? err?.message : err}`,
        ),
      );
      throw err;
    }
  }
}
