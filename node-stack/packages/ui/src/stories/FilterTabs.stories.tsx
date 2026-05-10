import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { FilterTabs } from "../components/ui/FilterTabs.js";

const meta: Meta<typeof FilterTabs> = {
  title: "UI/FilterTabs",
  component: FilterTabs,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
  },
};

export default meta;
type Story = StoryObj<typeof FilterTabs>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("all");
    return (
      <FilterTabs
        value={value}
        onChange={setValue}
        options={[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
      />
    );
  },
};

export const WithCounts: Story = {
  render: () => {
    const [value, setValue] = useState("open");
    return (
      <FilterTabs
        value={value}
        onChange={setValue}
        options={[
          { value: "open", label: "Open", count: 12 },
          { value: "in_progress", label: "In Progress", count: 5 },
          { value: "closed", label: "Closed", count: 48 },
        ]}
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState("monthly");
    return (
      <FilterTabs
        size="sm"
        value={value}
        onChange={setValue}
        options={[
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
      />
    );
  },
};
