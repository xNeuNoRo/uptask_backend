import { render } from "@react-email/render";
import { Verification } from "@/emails/ui/views";
import { APP_NAME } from "@/emails/core/env.config";
import { MailUtils } from "@/emails/core/mail";

export async function sendVerificationEmail(params: {
  to: string;
  verificationLink: string;
}) {
  const view = await render(
    <Verification verificationLink={params.verificationLink} />,
  );
  return MailUtils.sendMail({
    to: params.to,
    subject: `[${APP_NAME}] Verifica tu correo`,
    html: view,
    // Text seria el fallback en caso de que el html no cargue
    text: `Gracias por registrarte en ${APP_NAME}.\nVerifica tu correo aquí: ${params.verificationLink}`,
  });
}
