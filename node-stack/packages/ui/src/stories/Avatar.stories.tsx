import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar.js";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const BrokenImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://broken-url.invalid/avatar.png" alt="User" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      <Avatar className="h-6 w-6"><AvatarFallback>XS</AvatarFallback></Avatar>
      <Avatar className="h-8 w-8"><AvatarFallback>SM</AvatarFallback></Avatar>
      <Avatar className="h-10 w-10"><AvatarFallback>MD</AvatarFallback></Avatar>
      <Avatar className="h-14 w-14"><AvatarFallback>LG</AvatarFallback></Avatar>
    </div>
  ),
};
