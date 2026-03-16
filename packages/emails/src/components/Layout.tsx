import { Html } from "@react-email/html";
import { Head } from "@react-email/head";
import { Preview } from "@react-email/preview";
import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { Tailwind } from "@react-email/tailwind";

export function Layout({
  previewText,
  children,
}: {
  previewText: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-sm">
            <Section className="mt-[32px]">{children}</Section>
            <Text className="text-center text-slate-400 text-[12px] leading-[24px] mt-[32px]">
              © {new Date().getFullYear()} Startup Edge Platform
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
