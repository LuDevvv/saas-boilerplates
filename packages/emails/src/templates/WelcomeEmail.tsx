import * as React from "react";
import { Text } from "@react-email/text";
import { Button } from "@react-email/button";
import { Section } from "@react-email/section";
import { Layout } from "../components/Layout";

export function WelcomeEmail({
  name,
  actionUrl,
}: {
  name: string;
  actionUrl: string;
}) {
  return (
    <Layout previewText={`Welcome to our platform, ${name}!`}>
      <Text className="text-slate-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
        Hi {name}, welcome aboard!
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px]">
        We are thrilled to have you here. You can start exploring your dashboard
        immediately. If you have any questions, our support team is ready to
        help.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-blue-600 rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
          href={actionUrl}
        >
          Get Started
        </Button>
      </Section>
    </Layout>
  );
}
