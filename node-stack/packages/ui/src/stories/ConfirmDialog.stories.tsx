import type { Meta, StoryObj } from "@storybook/react";

import { ConfirmDialog } from "../components/ui/ConfirmDialog.js";

const meta: Meta<typeof ConfirmDialog> = {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "danger", "warning"] },
    isOpen: { control: "boolean" },
    isLoading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  args: {
    isOpen: true,
    title: "Confirm Action",
    description: "Are you sure you want to proceed? This will apply the changes immediately.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Danger: Story = {
  args: {
    isOpen: true,
    variant: "danger",
    title: "Delete Workspace",
    description: "This will permanently delete your workspace and all associated data. This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Keep Workspace",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Warning: Story = {
  args: {
    isOpen: true,
    variant: "warning",
    title: "Unsaved Changes",
    description: "You have unsaved changes that will be lost if you leave this page.",
    confirmText: "Leave Anyway",
    cancelText: "Stay",
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    variant: "danger",
    title: "Remove Member",
    description: "Remove this member from the workspace?",
    confirmText: "Remove",
    isLoading: true,
    onClose: () => {},
    onConfirm: () => {},
  },
};
