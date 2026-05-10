import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "../components/ui/Progress.js";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = { args: { value: 60 } };

export const Empty: Story = { args: { value: 0 } };

export const Full: Story = { args: { value: 100 } };

export const Quarter: Story = { args: { value: 25 } };

export const AllValues: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "320px" }}>
      <Progress value={0} />
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  ),
};
