export type TemplateName = "welcome" | "invitation" | "reset_password" | "verify_email" | string;
export type TemplateData = Record<string, any>;

// Simple in-code email templates
export function renderTemplate(
  template: TemplateName,
  data: TemplateData,
): string {
  switch (template) {
    case "welcome":
      return `Hello ${data.name ?? ""}, welcome to our service!`;
    case "invitation":
      return `Hi ${data.name ?? ""}, you're invited to ${data.event ?? ""}.`;
    case "reset_password":
      return `You requested a password reset. Here is your secret token: ${data.token}`;
    case "verify_email":
      return `Please verify your email using this token: ${data.token}`;
    default:
      return "Hello from NodeStack";
  }
}