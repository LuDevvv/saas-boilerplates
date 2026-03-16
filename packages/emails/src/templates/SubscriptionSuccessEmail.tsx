import * as React from "react";
import { Text } from "@react-email/text";
import { Button } from "@react-email/button";
import { Section } from "@react-email/section";
import { Layout } from "../components/Layout";

interface SubscriptionSuccessEmailProps {
  name: string;
  planName: string;
  dashboardUrl: string;
}

export function SubscriptionSuccessEmail({
  name,
  planName,
  dashboardUrl,
}: SubscriptionSuccessEmailProps) {
  return (
    <Layout previewText={`Welcome to ${planName}!`}>
      <Text className="text-slate-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
        You are now on the {planName} plan!
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px]">
        Hi {name}, we've successfully activated your {planName} subscription.
        You now have access to all the premium features included in this plan.
      </Text>
      <Text className="text-slate-700 text-[14px] leading-[24px]">
        Thank you for choosing us to grow your next big idea.
      </Text>
      <Section className="text-center mt-[32px] mb-[32px]">
        <Button
          className="bg-indigo-600 rounded text-white text-[14px] font-semibold no-underline text-center px-5 py-3"
          href={dashboardUrl}
        >
          Visit Dashboard
        </Button>
      </Section>
      <Text className="text-slate-500 text-[12px] text-center">
        Need help? Reply to this email or visit our Help Center.
      </Text>
    </Layout>
  );
}
