import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "../components/ui/Select.js";

const COUNTRY_OPTIONS = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
];

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    searchable: { control: "boolean" },
    fullWidth: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    label: "Country",
    options: COUNTRY_OPTIONS,
    value: "",
    placeholder: "Select a country",
    onChange: () => {},
  },
};

export const WithSelection: Story = {
  args: {
    label: "Country",
    options: COUNTRY_OPTIONS,
    value: "us",
    onChange: () => {},
  },
};

export const Searchable: Story = {
  args: {
    label: "Country",
    options: COUNTRY_OPTIONS,
    value: "",
    placeholder: "Search countries...",
    searchable: true,
    onChange: () => {},
  },
};

export const WithError: Story = {
  args: {
    label: "Plan",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise" },
    ],
    value: "",
    placeholder: "Select a plan",
    error: "Please select a plan.",
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: "Region",
    options: COUNTRY_OPTIONS,
    value: "us",
    disabled: true,
    onChange: () => {},
  },
};
