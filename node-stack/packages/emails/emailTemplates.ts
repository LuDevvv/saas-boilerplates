// Simple in-code email templates
export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  switch (template) {
    case "welcome":
      return `Hello ${data.name ?? ""}, welcome to our service!`;
    case "invitation":
      return `Hi ${data.name ?? ""}, you're invited to ${data.event ?? ""}.`;
    default:
      return "Hello from NodeStack";
  }
}
