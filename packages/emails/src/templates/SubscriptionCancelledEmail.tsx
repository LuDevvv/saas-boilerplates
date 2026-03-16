import * as React from "react";
import { Text } from "@react-email/text";
import { Button } from "@react-email/button";
import { Section } from "@react-email/section";
import { Layout } from "../components/Layout";

interface SubscriptionCancelledEmailProps {
  name: string;
  dashboardUrl: string;
}

export function SubscriptionCancelledEmail({
  name,
  dashboardUrl,
}: SubscriptionCancelledEmailProps) {
  return (
    <Layout previewText="Subscription Cancelled">
      <Text className="text-slate-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
        Your subscription has been cancelled
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px]">
        Hi {name}, your subscription has been cancelled and you will no longer
        be charged. You will still have access to your premium features until
        the end of the current billing cycle.
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px] mt-[16px]">
        We're sorry to see you go! If this was a mistake, or if there's anything
        we can do to win you back, you can rejoin any time from your billing
        dashboard.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-slate-900 rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
          href={dashboardUrl}
        >
          Reactivate Plan
        </Button>
      </Section>
      <Text className="text-slate-500 text-[12px] text-center">
        We'd love to hear your feedback on how we can improve.
      </Text>
    </Layout>
  );
}
