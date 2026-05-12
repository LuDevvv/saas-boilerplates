import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { BaseLayout, IconCircle } from "./BaseLayout.js";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl?: string;
  loginUrl?: string;
}

const FEATURES = [
  { icon: "📊", text: "Gestiona tu empresa y equipo desde un solo lugar" },
  { icon: "🔑", text: "Administra accesos y permisos de tu equipo" },
  { icon: "💳", text: "Elige el plan que mejor se adapte a tu negocio" },
];

export const WelcomeEmail = ({
  name,
  dashboardUrl,
  loginUrl,
}: WelcomeEmailProps): React.ReactElement => {
  const ctaUrl = dashboardUrl ?? loginUrl ?? "https://app.nodestack.dev";

  return (
    <BaseLayout
      preview={`¡Bienvenido a NodeStack, ${name}! Tu cuenta está lista.`}
      securityNote="Si no creaste esta cuenta, puedes ignorar este correo de forma segura."
    >
      <IconCircle emoji="✅" bg="#F0FDF4" />

      <Heading style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", textAlign: "center", margin: "0 0 8px 0", lineHeight: "1.3" }}>
        ¡Bienvenido, {name}!
      </Heading>
      <Text style={{ fontSize: "16px", color: "#64748B", textAlign: "center", margin: "0 0 32px 0", lineHeight: "1.6" }}>
        Tu correo fue verificado. Ya puedes acceder a tu cuenta<br />y comenzar a configurar tu empresa.
      </Text>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Button
          href={ctaUrl}
          style={{
            backgroundColor: "#4F46E5",
            borderRadius: "10px",
            color: "#ffffff",
            display: "inline-block",
            fontSize: "15px",
            fontWeight: 600,
            padding: "14px 48px",
            textDecoration: "none",
          }}
        >
          Ir al panel →
        </Button>
      </Section>

      {/* Features */}
      <Section style={{
        backgroundColor: "#F8FAFC",
        borderRadius: "12px",
        border: "1px solid #E2E8F0",
        padding: "20px 24px",
      }}>
        <Text style={{ fontSize: "12px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px 0" }}>
          Qué puedes hacer ahora
        </Text>
        {FEATURES.map((f, i) => (
          <Text key={i} style={{ fontSize: "14px", color: "#475569", margin: "0 0 8px 0", lineHeight: "1.5" }}>
            {f.icon}&nbsp; {f.text}
          </Text>
        ))}
      </Section>
    </BaseLayout>
  );
};

export default WelcomeEmail;
