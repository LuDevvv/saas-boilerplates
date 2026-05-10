import type { Meta, StoryObj } from "@storybook/react";

import { LoadingState } from "../components/ui/LoadingState.js";

const meta: Meta<typeof LoadingState> = {
  title: "UI/LoadingState",
  component: LoadingState,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["spinner", "skeleton", "shimmer"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    rows: { control: { type: "number", min: 1, max: 10 } },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const Spinner: Story = {
  args: { variant: "spinner", message: "Loading data..." },
};

export const Skeleton: Story = {
  args: { variant: "skeleton", rows: 4 },
};

export const Shimmer: Story = {
  args: { variant: "shimmer", rows: 3 },
};

export const Large: Story = {
  args: { variant: "spinner", size: "lg", message: "Processing your request..." },
};

export const Small: Story = {
  args: { variant: "spinner", size: "sm" },
};
