import { Section, Text } from "@react-email/components";
import { APP_NAME, APP_DOMAIN } from "@/emails/core/envconfig";

export default function Header() {
  return (
    <>
      <Section className="px-8 py-12 font-sans text-white bg-indigo-950">
        <Text className="mb-4 text-xs text-center text-slate-400">
          Santo Domingo, República Dominicana · soporte@{APP_DOMAIN}
        </Text>
        <Text className="mb-4 text-xs leading-relaxed text-center text-slate-300">
          Este correo electrónico y sus anexos pueden contener información
          confidencial o privilegiada. Si usted no es el destinatario, por favor
          elimine este mensaje y notifíquenos inmediatamente.
        </Text>
        <Text className="text-xs text-center text-slate-400">
          © {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
        </Text>
      </Section>
    </>
  );
}
