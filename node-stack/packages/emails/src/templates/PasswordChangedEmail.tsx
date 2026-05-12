import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { BaseLayout, IconCircle } from "./BaseLayout.js";

interface PasswordChangedEmailProps {
  name?: string;
}

export const PasswordChangedEmail = ({
  name,
}: PasswordChangedEmailProps): React.ReactElement => (
  <BaseLayout
    preview="Tu contraseña de NodeStack ha sido actualizada"
    securityNote="Si tú realizaste este cambio, no necesitas hacer nada más."
  >
    <IconCircle emoji="✅" bg="#F0FDF4" />

    <Heading style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", textAlign: "center", margin: "0 0 8px 0", lineHeight: "1.3" }}>
      Contraseña actualizada
    </Heading>
    <Text style={{ fontSize: "15px", color: "#64748B", textAlign: "center", margin: "0 0 32px 0", lineHeight: "1.6" }}>
      {name ? `Hola ${name}, te` : "Te"} confirmamos que la contraseña de tu cuenta
      <br />fue cambiada exitosamente.
    </Text>

    {/* Confirmation box */}
    <Section style={{
      backgroundColor: "#F0FDF4",
      borderRadius: "12px",
      border: "1px solid #BBF7D0",
      padding: "20px 24px",
      marginBottom: "24px",
      textAlign: "center",
    }}>
      <Text style={{ fontSize: "15px", fontWeight: 600, color: "#166534", margin: "0 0 4px 0" }}>
        Cambio realizado correctamente
      </Text>
      <Text style={{ fontSize: "14px", color: "#16A34A", margin: 0 }}>
        Tu nueva contraseña ya está activa.
      </Text>
    </Section>

    {/* Security alert */}
    <Section style={{
      backgroundColor: "#FFF1F2",
      borderRadius: "10px",
      border: "1px solid #FECDD3",
      padding: "16px 20px",
    }}>
      <Text style={{ fontSize: "13px", fontWeight: 600, color: "#9F1239", margin: "0 0 4px 0" }}>
        ⚠️ ¿No fuiste tú?
      </Text>
      <Text style={{ fontSize: "13px", color: "#BE123C", margin: 0, lineHeight: "1.5" }}>
        Si no realizaste este cambio, tu cuenta puede estar comprometida.
        Contáctanos de inmediato respondiendo a este correo.
      </Text>
    </Section>
  </BaseLayout>
);

export default PasswordChangedEmail;
