import type { Meta, StoryObj } from "@storybook/react";

import { WaitlistForm } from "../components/ui/WaitlistForm.js";

const meta: Meta<typeof WaitlistForm> = {
  title: "UI/WaitlistForm",
  component: WaitlistForm,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WaitlistForm>;

export const Default: Story = {
  args: {
    apiEndpoint: "/api/waitlist",
    onSuccess: () => console.log("Joined waitlist!"),
  },
};

export const WithoutEndpoint: Story = {
  args: {
    onSuccess: () => console.log("Submitted"),
  },
};
