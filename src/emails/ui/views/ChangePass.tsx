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
import Layout from "../layouts/Layout";
import { APP_NAME } from "../../core/env.config";

type ChangePassProps = {
  name?: string;
  changePassLink: string;
  sixDigitCode: string;
};

export default function ChangePass({
  name,
  changePassLink,
  sixDigitCode,
}: ChangePassProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Haz clic en el enlace para actualizar tu contraseña. Si no pediste el
        cambio, ignora este correo.
      </Preview>
      <Tailwind>
        <Body>
          <Layout>
            <Section>
              <Text className="mb-2 text-xl font-bold">
                Hola{name && ` ${name}`},
              </Text>
              <Text className="mb-4">
                Recibimos una solicitud para cambiar la contraseña de tu cuenta
                en <b>{APP_NAME}</b>. Si fuiste tú, copia el siguiente código para
                actualizar tu contraseña:
              </Text>

              <Section className="text-center">
                <Text className="inline-block px-6 py-1 mb-10 text-3xl font-semibold tracking-wider text-center text-white bg-black rounded-lg ">
                  {sixDigitCode}
                </Text>
              </Section>

              <Text className="my-2 text-sm">
                Luego, haz click en el botón debajo y digita este código en la
                página de cambio de contraseña:
                <br />
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={changePassLink}
                  className="px-4 py-2 font-medium text-white bg-purple-600 rounded-lg"
                >
                  Cambiar contraseña
                </Button>
              </Section>

              <Text className="mt-2 text-sm text-gray-600">
                Si no solicitaste este cambio, ignora este correo.
                <br />
                Por seguridad, este enlace expirará en 30 minutos.
              </Text>
              <Text className="mt-6">- El equipo de {APP_NAME}</Text>
            </Section>
          </Layout>
        </Body>
      </Tailwind>
    </Html>
  );
}
