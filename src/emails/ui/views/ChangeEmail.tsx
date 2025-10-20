import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Section,
  Text,
  Button,
} from "@react-email/components";
import Layout from "@/emails/ui/layouts/Layout";
import { APP_NAME } from "@/emails/core/envconfig";

type ChangePassProps = {
  name?: string;
  sixDigitCode: string;
};

export default function ChangeEmail({ name, sixDigitCode }: ChangePassProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Haz clic en el boton para actualizar tu email. Si no pediste el cambio,
        ignora este correo.
      </Preview>
      <Tailwind>
        <Body>
          <Layout>
            <Section>
              <Text className="mb-2 text-xl font-bold">
                Hola{name && ` ${name}`},
              </Text>
              <Text className="mb-4">
                Recibimos una solicitud para cambiar el correo de tu cuenta en{" "}
                <b>{APP_NAME}</b>. Si fuiste tú, copia el siguiente código para
                actualizar tu correo:
              </Text>

              <Section className="text-center">
                <Text className="inline-block px-6 py-1 mb-10 text-3xl font-semibold tracking-wider text-center text-white bg-black rounded-lg ">
                  {sixDigitCode}
                </Text>
              </Section>

              <Text className="my-2 mb-8 text-sm">
                Luego, ingresa el código en la página para cambiar tu correo.
                <br />
              </Text>

              <Text className="mt-2 text-sm text-gray-600">
                Si no solicitaste este cambio, ignora este correo.
                <br />
                Por seguridad, este código expirará en 30 minutos.
              </Text>
              <Text className="mt-6">- El equipo de {APP_NAME}</Text>
            </Section>
          </Layout>
        </Body>
      </Tailwind>
    </Html>
  );
}
