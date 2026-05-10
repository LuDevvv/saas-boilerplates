import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs.js";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" style={{ width: "480px" }}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p style={{ padding: "16px" }}>Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p style={{ padding: "16px" }}>Analytics data and charts.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p style={{ padding: "16px" }}>Configure your preferences.</p>
      </TabsContent>
    </Tabs>
  ),
};

export const WithManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="account" style={{ width: "600px" }}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p style={{ padding: "16px" }}>Manage your account details.</p>
      </TabsContent>
      <TabsContent value="billing">
        <p style={{ padding: "16px" }}>View invoices and manage subscriptions.</p>
      </TabsContent>
      <TabsContent value="security">
        <p style={{ padding: "16px" }}>Update password and two-factor authentication.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p style={{ padding: "16px" }}>Control email and push notifications.</p>
      </TabsContent>
    </Tabs>
  ),
};
