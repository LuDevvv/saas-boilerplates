import type { Meta, StoryObj } from "@storybook/react";

import { ProfileAvatar } from "../components/ui/ProfileAvatar.js";

const meta: Meta<typeof ProfileAvatar> = {
  title: "UI/ProfileAvatar",
  component: ProfileAvatar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    isEditable: { control: "boolean" },
    isUploading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileAvatar>;

export const Default: Story = {
  args: { fallback: "JD", size: "md" },
};

export const WithImage: Story = {
  args: {
    src: "https://github.com/shadcn.png",
    fallback: "CN",
    size: "lg",
  },
};

export const Editable: Story = {
  args: {
    fallback: "AB",
    size: "xl",
    isEditable: true,
    onImageChange: () => {},
  },
};

export const Uploading: Story = {
  args: {
    fallback: "JD",
    size: "lg",
    isEditable: true,
    isUploading: true,
    onImageChange: () => {},
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <ProfileAvatar fallback="SM" size="sm" />
      <ProfileAvatar fallback="MD" size="md" />
      <ProfileAvatar fallback="LG" size="lg" />
      <ProfileAvatar fallback="XL" size="xl" />
    </div>
  ),
};
