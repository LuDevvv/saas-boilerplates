import * as React from "react";
import { Text } from "@react-email/text";
import { Button } from "@react-email/button";
import { Section } from "@react-email/section";
import { Layout } from "../components/Layout";

interface TeamInviteEmailProps {
  invitedByEmail: string;
  workspaceName: string;
  inviteLink: string;
}

export function TeamInviteEmail({
  invitedByEmail,
  workspaceName,
  inviteLink,
}: TeamInviteEmailProps) {
  return (
    <Layout previewText={`Join ${workspaceName} on L.A. Labs`}>
      <Text className="text-slate-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
        Join our Team!
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px]">
        <strong>{invitedByEmail}</strong> has invited you to join the{" "}
        <strong>{workspaceName}</strong> workspace on L.A. Labs.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-blue-600 rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
          href={inviteLink}
        >
          Accept Invitation
        </Button>
      </Section>
      <Text className="text-slate-500 text-[12px] leading-[24px]">
        If you were not expecting this invitation, you can ignore this email.
      </Text>
    </Layout>
  );
}
