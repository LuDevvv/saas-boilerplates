import type { Meta, StoryObj } from "@storybook/react";

import { SearchInput } from "../components/ui/SearchInput.js";

const meta: Meta<typeof SearchInput> = {
  title: "UI/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    isLoading: { control: "boolean" },
    autoFocus: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    value: "",
    placeholder: "Search...",
    onChange: () => {},
  },
};

export const WithValue: Story = {
  args: {
    value: "react components",
    placeholder: "Search components...",
    onChange: () => {},
    onClear: () => {},
  },
};

export const Loading: Story = {
  args: {
    value: "loading...",
    isLoading: true,
    onChange: () => {},
  },
};

export const Small: Story = {
  args: {
    value: "",
    placeholder: "Quick search",
    size: "sm",
    onChange: () => {},
  },
};

export const Large: Story = {
  args: {
    value: "",
    placeholder: "Search everything...",
    size: "lg",
    onChange: () => {},
  },
};
