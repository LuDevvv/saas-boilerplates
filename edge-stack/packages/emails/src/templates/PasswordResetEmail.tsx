import { Text } from "@react-email/text";
import { Button } from "@react-email/button";
import { Section } from "@react-email/section";
import { Layout } from "../components/Layout";

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Layout previewText="Reset your password">
      <Text className="text-slate-900 text-[20px] font-bold text-center p-0 my-[30px] mx-0">
        Password Reset Request
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px]">
        We received a request to reset your password. If this was you, please
        click the button below to securely set a new password. If you didn't
        request this, you can safely ignore this email.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-slate-900 rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
          href={resetUrl}
        >
          Reset Password
        </Button>
      </Section>
    </Layout>
  );
}
