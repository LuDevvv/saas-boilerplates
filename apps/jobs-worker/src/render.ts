import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import {
  WelcomeEmail,
  PasswordResetEmail,
  TeamInviteEmail,
  SubscriptionSuccessEmail,
  SubscriptionCancelledEmail,
} from "@workspace/emails";

/**
 * Template name → React component mapping.
 * "receipt" is reserved for future use.
 */
const TEMPLATE_MAP: Record<string, (props: any) => JSX.Element> = {
  welcome: WelcomeEmail,
  reset_password: PasswordResetEmail,
  invitation: TeamInviteEmail,
  subscription_success: SubscriptionSuccessEmail,
  subscription_cancelled: SubscriptionCancelledEmail,
};

/**
 * Renders a React-Email template to a static HTML string.
 * This is the ONLY place in the architecture where React rendering occurs.
 *
 * @param templateName - The registered template name
 * @param data - Props to pass into the template component
 * @returns Full HTML string ready for Resend
 */
export function renderEmail(
  templateName: string,
  data: Record<string, any>,
): string {
  const Component = TEMPLATE_MAP[templateName];

  if (!Component) {
    throw new Error(`[Jobs] Unknown email template: "${templateName}"`);
  }

  return renderToStaticMarkup(createElement(Component, data));
}
