import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { BaseLayout, IconCircle } from "./BaseLayout.js";

interface OtpVerificationEmailProps {
  name?: string;
  code: string;
  expiresInMinutes?: number;
}

export const OtpVerificationEmail = ({
  name,
  code,
  expiresInMinutes = 15,
}: OtpVerificationEmailProps): React.ReactElement => (
  <BaseLayout
    preview={`Tu código de verificación: ${code} (válido ${expiresInMinutes} min)`}
    securityNote="Si no creaste esta cuenta en NodeStack, ignora este correo. Nadie más puede usar tu dirección sin el código."
  >
    <IconCircle emoji="🔒" bg="#EEF2FF" />

    <Heading style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", textAlign: "center", margin: "0 0 8px 0", lineHeight: "1.3" }}>
      Verifica tu correo
    </Heading>
    <Text style={{ fontSize: "15px", color: "#64748B", textAlign: "center", margin: "0 0 32px 0", lineHeight: "1.6" }}>
      {name ? `Hola ${name}, usa` : "Usa"} el siguiente código para verificar tu cuenta.
      <br />Es válido por <strong style={{ color: "#0F172A" }}>{expiresInMinutes} minutos</strong>.
    </Text>

    {/* OTP code — large, centered, monospace */}
    <Section style={{
      backgroundColor: "#F5F3FF",
      borderRadius: "12px",
      border: "1px solid #DDD6FE",
      padding: "28px 16px",
      marginBottom: "24px",
      textAlign: "center",
    }}>
      <Text style={{
        fontSize: "52px",
        fontFamily: "'Courier New', Courier, monospace",
        fontWeight: 700,
        letterSpacing: "0.5em",
        color: "#4F46E5",
        margin: 0,
        textAlign: "center",
        paddingLeft: "0.5em",
        lineHeight: "1",
      }}>
        {code}
      </Text>
    </Section>

    {/* Expiry notice */}
    <Section style={{
      backgroundColor: "#FFFBEB",
      borderRadius: "8px",
      border: "1px solid #FDE68A",
      padding: "12px 16px",
    }}>
      <Text style={{ fontSize: "13px", color: "#92400E", margin: 0, textAlign: "center" }}>
        ⏱ &nbsp;Este código expira en {expiresInMinutes} minutos. No lo compartas con nadie.
      </Text>
    </Section>
  </BaseLayout>
);

export default OtpVerificationEmail;
