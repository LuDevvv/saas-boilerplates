import { Button, Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import { BaseLayout, IconCircle } from "./BaseLayout.js";

interface InvitationEmailProps {
  workspaceName: string;
  inviterName?: string;
  role?: string;
  acceptUrl: string;
  expiresAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  member: "Miembro",
  guest: "Invitado",
};

const roleLabel = (role: string) =>
  ROLE_LABELS[role.toLowerCase()] ?? role;

export const InvitationEmail = ({
  workspaceName,
  inviterName,
  role = "member",
  acceptUrl,
  expiresAt,
}: InvitationEmailProps): React.ReactElement => (
  <BaseLayout
    preview={`${inviterName ? inviterName + " te" : "Te"} invitó a unirte a ${workspaceName}`}
    securityNote={`Esta invitación fue enviada a tu dirección de correo. Si no esperabas esto, puedes ignorarla.${expiresAt ? ` Expira el ${expiresAt}.` : ""}`}
  >
    <IconCircle emoji="🤝" bg="#EEF2FF" />

    <Heading style={{ fontSize: "28px", fontWeight: 700, color: "#0F172A", textAlign: "center", margin: "0 0 8px 0", lineHeight: "1.3" }}>
      Únete a {workspaceName}
    </Heading>
    <Text style={{ fontSize: "15px", color: "#64748B", textAlign: "center", margin: "0 0 32px 0", lineHeight: "1.6" }}>
      {inviterName ? (
        <><strong style={{ color: "#0F172A" }}>{inviterName}</strong> te ha invitado a unirte al equipo<br />como <strong style={{ color: "#0F172A" }}>{roleLabel(role)}</strong>.</>
      ) : (
        <>Fuiste invitado a unirte al equipo <strong style={{ color: "#0F172A" }}>{workspaceName}</strong><br />como <strong style={{ color: "#0F172A" }}>{roleLabel(role)}</strong>.</>
      )}
    </Text>

    {/* CTA */}
    <Section style={{ textAlign: "center", marginBottom: "28px" }}>
      <Button
        href={acceptUrl}
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
        Aceptar invitación →
      </Button>
    </Section>

    {/* Workspace info pill */}
    <Section style={{ textAlign: "center", marginBottom: "24px" }}>
      <table style={{ margin: "0 auto" }}>
        <tbody>
          <tr>
            <td style={{
              backgroundColor: "#F5F3FF",
              border: "1px solid #DDD6FE",
              borderRadius: "100px",
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#4F46E5",
              whiteSpace: "nowrap",
            }}>
              🏢 &nbsp;{workspaceName}
            </td>
          </tr>
        </tbody>
      </table>
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
        {acceptUrl}
      </Text>
    </Section>
  </BaseLayout>
);

export default InvitationEmail;
