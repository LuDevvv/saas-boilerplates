import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../components/ui/Button.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/Sheet.js";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open Right Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit Settings</SheetTitle>
          <SheetDescription>
            Update your workspace settings. Changes are saved automatically.
          </SheetDescription>
        </SheetHeader>
        <div style={{ padding: "16px 0" }}>
          <p>Settings form content here.</p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Open Left Sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Browse your workspace sections.</SheetDescription>
        </SheetHeader>
        <div style={{ padding: "16px 0" }}>
          <p>Navigation links go here.</p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open Bottom Sheet</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Actions</SheetTitle>
          <SheetDescription>Choose an action to perform.</SheetDescription>
        </SheetHeader>
        <div style={{ padding: "16px 0", display: "flex", gap: "8px" }}>
          <Button variant="danger">Delete</Button>
          <Button variant="secondary">Archive</Button>
          <Button>Export</Button>
        </div>
      </SheetContent>
    </Sheet>
  ),
};
