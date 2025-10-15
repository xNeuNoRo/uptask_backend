import { Section, Container } from "@react-email/components";
import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
