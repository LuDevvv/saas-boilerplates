import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Tailwind,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export const WelcomeEmail = ({ name, loginUrl }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to NodeStack, {name}!</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto my-10 max-w-[580px] rounded-xl border border-solid border-slate-200 bg-white p-10 shadow-sm">
            <Heading className="mb-6 text-2xl font-heading text-slate-900">
              Welcome to NodeStack
            </Heading>
            <Section className="mb-6">
              <Text className="text-base leading-relaxed text-slate-700">
                Hi {name},
              </Text>
              <Text className="text-base leading-relaxed text-slate-700">
                We're thrilled to have you here! Your journey with NodeStack starts now.
                We've built a powerful toolkit to help you ship products faster, and we can't wait to see what you create.
              </Text>
            </Section>
            <Section className="mb-8">
              <Link
                href={loginUrl}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-center text-sm font-label text-white no-underline shadow-md transition-all hover:bg-indigo-700"              >
                Go to Dashboard
              </Link>
            </Section>
            <Hr className="mb-6 border-slate-200" />
            <Section>
              <Text className="text-xs text-slate-500">
                © 2024 NodeStack Inc. All rights reserved.
              </Text>
              <Text className="text-xs text-slate-500">
                You're receiving this because you signed up for NodeStack.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
