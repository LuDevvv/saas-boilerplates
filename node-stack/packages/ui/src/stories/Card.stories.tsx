import type { Meta, StoryObj } from "@storybook/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card.js";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "glass", "premium"] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card style={{ width: "320px" }}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>A brief description of this card's content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card.</p>
      </CardContent>
    </Card>
  ),
};

export const Glass: Story = {
  render: () => (
    <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "32px", borderRadius: "12px" }}>
      <Card variant="glass" style={{ width: "320px" }}>
        <CardHeader>
          <CardTitle>Glass Card</CardTitle>
          <CardDescription>Frosted glass effect.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Content with glass morphism background.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Premium: Story = {
  render: () => (
    <Card variant="premium" style={{ width: "320px" }}>
      <CardHeader>
        <CardTitle>Premium Card</CardTitle>
        <CardDescription>Enhanced styling for premium content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Premium plan features and benefits.</p>
      </CardContent>
    </Card>
  ),
};
