import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/Avatar.js";
import { Badge } from "../components/ui/Badge.js";
import { Button } from "../components/ui/Button.js";
import { HeroHeader } from "../components/ui/HeroHeader.js";

const meta: Meta<typeof HeroHeader> = {
  title: "UI/HeroHeader",
  component: HeroHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroHeader>;

export const Default: Story = {
  render: () => (
    <HeroHeader
      title="Alice Johnson"
      subtitle="Senior Engineer · San Francisco, CA"
      avatar={
        <Avatar className="h-16 w-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="Alice" />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
      }
    />
  ),
};

export const WithBadgeAndActions: Story = {
  render: () => (
    <HeroHeader
      title="Acme Corp Workspace"
      subtitle="12 members · Created Jan 2024"
      avatar={
        <Avatar className="h-16 w-16">
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
      }
      badge={<Badge variant="premium">Pro Plan</Badge>}
      actions={
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" size="sm">Settings</Button>
          <Button size="sm">Invite</Button>
        </div>
      }
    />
  ),
};
