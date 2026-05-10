import type { Meta, StoryObj } from "@storybook/react";

import { CardSkeleton, FormSkeleton } from "../components/ui/SkeletonLayouts.js";

const meta: Meta = {
  title: "UI/SkeletonLayouts",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const CardSkeletonDefault: Story = {
  render: () => <CardSkeleton style={{ width: "320px" }} />,
};

export const CardSkeletonWithRows: Story = {
  render: () => <CardSkeleton rows={5} style={{ width: "400px" }} />,
};

export const FormSkeletonDefault: Story = {
  render: () => <FormSkeleton style={{ width: "400px" }} />,
};

export const FormSkeletonWithFields: Story = {
  render: () => <FormSkeleton fields={6} style={{ width: "400px" }} />,
};

export const Both: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <CardSkeleton style={{ width: "320px" }} />
      <FormSkeleton style={{ width: "320px" }} />
    </div>
  ),
};
