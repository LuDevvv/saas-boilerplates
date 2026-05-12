import { render } from "@react-email/render";
import * as React from "react";

import { InvitationEmail } from "./templates/InvitationEmail.js";
import { OtpVerificationEmail } from "./templates/OtpVerificationEmail.js";
import { PasswordChangedEmail } from "./templates/PasswordChangedEmail.js";
import { PasswordResetEmail } from "./templates/PasswordResetEmail.js";
import { WelcomeEmail } from "./templates/WelcomeEmail.js";

export type EmailTemplate =
  | { name: "WELCOME"; data: { name: string; dashboardUrl?: string; loginUrl?: string } }
  | { name: "OTP_VERIFICATION"; data: { name?: string; code: string; expiresInMinutes?: number } }
  | { name: "RESET_PASSWORD" | "PASSWORD_RESET"; data: { name?: string; resetUrl: string; expiresInHours?: number } }
  | { name: "PASSWORD_CHANGED"; data: { name?: string } }
  | { name: "INVITATION"; data: { workspaceName: string; inviterName?: string; role?: string; acceptUrl: string; expiresAt?: string } }
  | { name: "AI_COMPLETED"; data: { jobId: string; message: string } };

export async function renderEmail(template: EmailTemplate): Promise<{ html: string; text: string }> {
  let element: React.ReactElement;

  switch (template.name) {
    case "WELCOME":
      element = React.createElement(WelcomeEmail, template.data);
      break;
    case "OTP_VERIFICATION":
      element = React.createElement(OtpVerificationEmail, template.data);
      break;
    case "RESET_PASSWORD":
    case "PASSWORD_RESET":
      element = React.createElement(PasswordResetEmail, template.data as { name?: string; resetUrl: string; expiresInHours?: number });
      break;
    case "PASSWORD_CHANGED":
      element = React.createElement(PasswordChangedEmail, template.data);
      break;
    case "INVITATION":
      element = React.createElement(InvitationEmail, template.data);
      break;
    case "AI_COMPLETED":
      element = React.createElement(WelcomeEmail, { name: "Usuario", dashboardUrl: "#" });
      break;
    default:
      throw new Error(`Email template not implemented: ${(template as { name: string }).name}`);
  }

  const html = await render(element);
  const text = await render(element, { plainText: true });

  return { html, text };
}
