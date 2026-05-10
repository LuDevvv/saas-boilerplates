import type { Meta, StoryObj } from "@storybook/react";

import { PremiumLoader } from "../components/ui/PremiumLoader.js";

const meta: Meta<typeof PremiumLoader> = {
  title: "UI/PremiumLoader",
  component: PremiumLoader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PremiumLoader>;

export const Default: Story = {
  args: {},
};

export const WithLogo: Story = {
  args: {
    logoSrc: "https://via.placeholder.com/48x48?text=NS",
  },
};
