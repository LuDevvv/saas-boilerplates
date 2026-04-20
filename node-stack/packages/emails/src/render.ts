import { render } from "@react-email/render";
import * as React from "react";
import { WelcomeEmail } from "./templates/WelcomeEmail";

export type EmailTemplate = 
  | { name: "WELCOME"; data: { name: string; loginUrl: string } }
  | { name: "RESET_PASSWORD"; data: { token: string } }
  | { name: "PASSWORD_RESET"; data: { token: string } }
  | { name: "VERIFY_EMAIL"; data: { token: string } }
  | { name: "AI_COMPLETED"; data: { jobId: string; message: string } };

export async function renderEmail(template: EmailTemplate) {
  let Component: React.ReactElement;

  switch (template.name.toUpperCase()) {
    case "WELCOME":
      Component = React.createElement(WelcomeEmail, template.data as any);
      break;
    case "RESET_PASSWORD":
    case "PASSWORD_RESET":
    case "VERIFY_EMAIL":
    case "AI_COMPLETED":
      // Reuse welcome as placeholder for now
      Component = React.createElement(WelcomeEmail, { name: "User", loginUrl: "#" });
      break;
    default:
      throw new Error(`Template ${template.name} not implemented`);
  }

  const html = await render(Component);
  const text = await render(Component, { plainText: true });

  return { html, text };
}
