import { AppError, type EmailJobPayload } from "@workspace/types";

/**
 * Service for enqueueing transactional emails to the Jobs Worker.
 */
export interface EmailService {
  sendWelcomeEmail(email: string, name: string): Promise<unknown>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<unknown>;
  sendVerificationEmail(email: string, verifyLink: string): Promise<unknown>;
  sendTeamInviteEmail(
    email: string,
    invitedByEmail: string,
    workspaceName: string,
    inviteLink: string,
  ): Promise<unknown>;
}

/**
 * Factory to create an EmailService instance.
 * @param queue - Cloudflare Queue Binding for Email Jobs
 */
export const createEmailService = (
  queue: Queue<EmailJobPayload>,
): EmailService => {
  if (!queue) {
    throw new Error("Missing EMAIL_QUEUE binding");
  }

  return {
    async sendWelcomeEmail(email: string, name: string) {
      try {
        await queue.send({
          to: email,
          subject: `Welcome to our platform, ${name}!`,
          templateName: "welcome",
          templateData: { name, actionUrl: "https://example.com/dashboard" },
        });
      } catch (error) {
        throw new AppError(
          "Failed to enqueue welcome email",
          500,
          "EMAIL_SEND_FAILED",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },

    async sendPasswordResetEmail(email: string, resetLink: string) {
      try {
        await queue.send({
          to: email,
          subject: "Reset your password",
          templateName: "reset_password",
          templateData: { resetUrl: resetLink },
        });
      } catch (error) {
        throw new AppError(
          "Failed to enqueue password reset email",
          500,
          "EMAIL_SEND_FAILED",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },

    async sendVerificationEmail(email: string, verifyLink: string) {
      try {
        await queue.send({
          to: email,
          subject: "Verify your email",
          templateName: "welcome",
          templateData: { name: "User", actionUrl: verifyLink },
        });
      } catch (error) {
        throw new AppError(
          "Failed to enqueue verification email",
          500,
          "EMAIL_SEND_FAILED",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },

    async sendTeamInviteEmail(
      email: string,
      invitedByEmail: string,
      workspaceName: string,
      inviteLink: string,
    ) {
      try {
        await queue.send({
          to: email,
          subject: `Join ${workspaceName} on L.A. Labs`,
          templateName: "invitation",
          templateData: { invitedByEmail, workspaceName, inviteLink },
        });
      } catch (error) {
        throw new AppError(
          "Failed to enqueue team invite email",
          500,
          "EMAIL_SEND_FAILED",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },
  };
};
