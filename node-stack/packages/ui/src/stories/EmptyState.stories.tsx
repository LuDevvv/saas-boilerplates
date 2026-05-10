import type { Meta, StoryObj } from "@storybook/react";
import { FileX, Inbox, Search, Users } from "lucide-react";

import { Button } from "../components/ui/Button.js";
import { EmptyState } from "../components/ui/EmptyState.js";

const meta: Meta<typeof EmptyState> = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "minimal"] },
    compact: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: Inbox,
    title: "No messages yet",
    description: "When you receive messages, they will appear here.",
  },
};

export const WithAction: Story = {
  args: {
    icon: Users,
    title: "No team members",
    description: "Invite colleagues to collaborate on your workspace.",
    action: <Button>Invite Members</Button>,
  },
};

export const WithSecondaryAction: Story = {
  args: {
    icon: FileX,
    title: "No files found",
    description: "Upload your first file or search for existing ones.",
    action: <Button>Upload File</Button>,
    secondaryAction: <Button variant="ghost">Learn More</Button>,
  },
};

export const SearchResult: Story = {
  args: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters.",
    compact: true,
  },
};

export const Minimal: Story = {
  args: {
    icon: Inbox,
    title: "Nothing here yet",
    description: "Items will appear here once added.",
    variant: "minimal",
  },
};
