import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { BaseLayout, IconCircle } from "./BaseLayout.js";

interface PasswordResetEmailProps {
  name?: string;
  resetUrl: string;
  expiresInHours?: number;
}

export const PasswordResetEmail = ({
  name,
  resetUrl,
  expiresInHours = 1,
}: PasswordResetEmailProps): React.ReactElement => (
  <BaseLayout
    preview="Restablecer tu contraseña de NodeStack"
    securityNote="Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no cambiará hasta que uses el enlace."
  >
    <IconCircle emoji="🔑" bg="#FFF7ED" />

    <Heading style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", textAlign: "center", margin: "0 0 8px 0", lineHeight: "1.3" }}>
      Restablecer contraseña
    </Heading>
    <Text style={{ fontSize: "15px", color: "#64748B", textAlign: "center", margin: "0 0 32px 0", lineHeight: "1.6" }}>
      {name ? `Hola ${name}, r` : "R"}ecibimos una solicitud para restablecer la contraseña de tu cuenta.
      <br />El enlace es válido por <strong style={{ color: "#0F172A" }}>{expiresInHours} hora{expiresInHours !== 1 ? "s" : ""}</strong>.
    </Text>

    {/* CTA */}
    <Section style={{ textAlign: "center", marginBottom: "28px" }}>
      <Button
        href={resetUrl}
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
        Restablecer contraseña →
      </Button>
    </Section>

    {/* Fallback URL */}
    <Section style={{
      backgroundColor: "#F8FAFC",
      borderRadius: "8px",
      border: "1px solid #E2E8F0",
      padding: "14px 16px",
    }}>
      <Text style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 6px 0" }}>
        Si el botón no funciona, copia este enlace en tu navegador:
      </Text>
      <Text style={{ fontSize: "12px", color: "#4F46E5", margin: 0, wordBreak: "break-all" }}>
        {resetUrl}
      </Text>
    </Section>
  </BaseLayout>
);

export default PasswordResetEmail;
