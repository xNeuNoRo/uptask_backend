import { ReactNode } from "react";
import { Section, Container } from "@react-email/components";
import Header from "@/emails/ui/components/Header";
import Footer from "@/emails/ui/components/Footer";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <Container className="font-sans w-full max-w-[600px] min-w-[300px]">
      {/* Header */}
      <Header />

      {/* Slot dinámico */}
      <Section className="px-10 py-12 bg-white pb-14">{children}</Section>

      {/* Footer */}
      <Footer />
    </Container>
  );
}
