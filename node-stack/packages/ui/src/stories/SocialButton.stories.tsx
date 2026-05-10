import type { Meta, StoryObj } from "@storybook/react";

import { SocialButton } from "../components/ui/SocialButton.js";

const meta: Meta<typeof SocialButton> = {
  title: "UI/SocialButton",
  component: SocialButton,
  tags: ["autodocs"],
  argTypes: {
    provider: { control: "select", options: ["google", "github", "apple"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SocialButton>;

export const Google: Story = {
  args: { provider: "google", children: "Continue with Google" },
};

export const GitHub: Story = {
  args: { provider: "github", children: "Continue with GitHub" },
};

export const Apple: Story = {
  args: { provider: "apple", children: "Continue with Apple" },
};

export const Loading: Story = {
  args: { provider: "google", children: "Signing in...", loading: true },
};

export const AllProviders: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "320px" }}>
      <SocialButton provider="google">Continue with Google</SocialButton>
      <SocialButton provider="github">Continue with GitHub</SocialButton>
      <SocialButton provider="apple">Continue with Apple</SocialButton>
    </div>
  ),
};
