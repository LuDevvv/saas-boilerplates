import type { Meta, StoryObj } from "@storybook/react";

import { HeroSection } from "../components/HeroSection.js";

const meta: Meta<typeof HeroSection> = {
  title: "Pages/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {
  args: {
    title: "Build production-ready SaaS apps faster",
    subtitle: "A complete boilerplate with authentication, billing, and team management — so you can focus on what makes your product unique.",
    ctaText: "Get Started Free",
    onCtaClick: () => console.log("CTA clicked"),
  },
};

export const WithImage: Story = {
  args: {
    title: "The modern developer platform",
    subtitle: "Everything you need to ship your next big idea, from authentication to payments.",
    ctaText: "Start Building",
    image: "https://via.placeholder.com/800x500?text=Dashboard+Preview",
    onCtaClick: () => {},
  },
};
