import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
  /** Optional footer security note shown below the main footer */
  securityNote?: string;
}

const BRAND = "NodeStack";
const YEAR  = new Date().getFullYear();

/** Reusable card wrapper for all transactional emails.
 *  Design: light grey outer bg → white card, rounded, subtle shadow.
 *  No colored header — brand sits as a small label above the card.
 */
export const BaseLayout = ({
  preview,
  children,
  securityNote,
}: BaseLayoutProps): React.ReactElement => (
  <Html lang="es">
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind>
      <Body style={{ backgroundColor: "#F1F5F9", margin: 0, padding: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

        {/* Brand label above card */}
        <Container style={{ maxWidth: "560px", margin: "0 auto", paddingTop: "40px", paddingBottom: "8px" }}>
          <Text style={{ textAlign: "center", color: "#4F46E5", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
            {BRAND}
          </Text>
        </Container>

        {/* Main card */}
        <Container style={{
          maxWidth: "560px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}>
          {/* Content */}
          <Section style={{ padding: "40px 40px 32px" }}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: "#E2E8F0", margin: 0 }} />
          <Section style={{ padding: "24px 40px 32px", backgroundColor: "#F8FAFC" }}>
            {securityNote && (
              <Text style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px 0" }}>
                {securityNote}
              </Text>
            )}
            <Text style={{ color: "#94A3B8", fontSize: "12px", margin: 0 }}>
              © {YEAR} {BRAND}. Todos los derechos reservados.
            </Text>
            <Text style={{ color: "#94A3B8", fontSize: "12px", margin: "4px 0 0 0" }}>
              Recibiste este correo porque realizaste una acción en tu cuenta.
            </Text>
          </Section>
        </Container>

        {/* Bottom spacer */}
        <Container style={{ maxWidth: "560px", margin: "0 auto", paddingBottom: "40px" }} />

      </Body>
    </Tailwind>
  </Html>
);

/** Centered icon circle used at the top of each template.
 *  Uses a table cell for maximum email-client compatibility.
 */
export const IconCircle = ({
  emoji,
  bg = "#EEF2FF",
  size = 64,
}: {
  emoji: string;
  bg?: string;
  size?: number;
}): React.ReactElement => (
  <Section style={{ textAlign: "center", marginBottom: "24px" }}>
    <table style={{ margin: "0 auto" }}>
      <tbody>
        <tr>
          <td style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: bg,
            borderRadius: "50%",
            textAlign: "center",
            verticalAlign: "middle",
            fontSize: `${Math.round(size * 0.45)}px`,
            lineHeight: `${size}px`,
          }}>
            {emoji}
          </td>
        </tr>
      </tbody>
    </table>
  </Section>
);

export default BaseLayout;
