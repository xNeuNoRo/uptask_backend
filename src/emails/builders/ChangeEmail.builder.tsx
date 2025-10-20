import { render } from "@react-email/render";
import { ChangeEmail } from "@/emails/ui/views";
import { APP_NAME } from "@/emails/core/envconfig";
import { MailUtils } from "@/emails/core/mail";

export async function sendChangeEmailCodeEmail(params: {
  to: string;
  name?: string;
  sixDigitCode: string;
}) {
  const view = await render(
    <ChangeEmail name={params.name} sixDigitCode={params.sixDigitCode} />,
  );
  return MailUtils.sendMail({
    to: params.to,
    subject: `[${APP_NAME}] Cambio de correo electrónico`,
    html: view,
    // Text seria el fallback en caso de que el html no cargue
    text: `Recibimos una solicitud para cambiar el correo electrónico de tu cuenta en ${APP_NAME}.\nSi fuiste tú, copia este codigo ${params.sixDigitCode} e ingresalo en la pagina.\nSi no solicitaste este cambio, ignora este correo. Por seguridad, este codigo expirará en 30 minutos.`,
  });
}
