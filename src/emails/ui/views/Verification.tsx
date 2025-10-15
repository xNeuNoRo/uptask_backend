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

type VerificationProps = {
  verificationLink: string;
};

export default function Verification({ verificationLink }: VerificationProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        Gracias por registrarte en {APP_NAME}. Para finalizar tu registro haz
        clic en el botón para confirmar tu correo y activar tu cuenta.
      </Preview>
      <Tailwind>
        <Body>
          <Layout>
            <Section>
              <Text className="mb-2 text-xl font-bold">
                Verifica tu dirección de correo electrónico
              </Text>
              <Text className="mb-4">
                Gracias por registrarte en <b>{APP_NAME}</b>. Antes de
                continuar, necesitamos confirmar que este correo electrónico te
                pertenece. Para hacerlo, simplemente haz click en el botón de
                abajo:
              </Text>

              <Section className="my-8 text-center">
                <Button
                  href={verificationLink}
                  className="px-4 py-2 font-medium text-white bg-purple-600 rounded-lg"
                >
                  Verificar mi correo
                </Button>
              </Section>

              <Text className="mt-2 text-sm text-gray-500">
                Este enlace expirará en 30 minutos.
                <br />
                Si no creaste una cuenta en <b>{APP_NAME}</b>, puedes ignorar
                este mensaje.
              </Text>
              <Text className="mt-6">
                ¡Gracias por unirte a la comunidad de {APP_NAME}!
              </Text>
            </Section>
          </Layout>
        </Body>
      </Tailwind>
    </Html>
  );
}
