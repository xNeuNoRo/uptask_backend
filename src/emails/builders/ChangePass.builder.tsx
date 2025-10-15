import { render } from "@react-email/render";
import { ChangePass } from "@/emails/ui/views";
import { APP_NAME } from "@/emails/core/env.config";
import { MailUtils } from "@/emails/core/mail";

export async function sendChangePassEmail(params: {
  to: string;
  name?: string;
  changePassLink: string;
  sixDigitCode: string;
}) {
  const view = await render(
    <ChangePass
      name={params.name}
      changePassLink={params.changePassLink}
      sixDigitCode={params.sixDigitCode}
    />,
  );
  return MailUtils.sendMail({
    to: params.to,
    subject: `[${APP_NAME}] Cambio de contraseña`,
    html: view,
    // Text seria el fallback en caso de que el html no cargue
    text: `Recibimos una solicitud para cambiar la contraseña de tu cuenta en ${APP_NAME}.\nSi fuiste tú, abre este enlace para actualizarla: ${params.changePassLink}\nSi el enlace no abre, copia y pégalo en tu navegador.\nSi no solicitaste este cambio, ignora este correo. Por seguridad, este enlace expirará en 30 minutos.`,
  });
}
