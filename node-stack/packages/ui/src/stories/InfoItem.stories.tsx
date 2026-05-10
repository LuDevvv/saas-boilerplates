import type { Meta, StoryObj } from "@storybook/react";
import { Building2, Calendar, Globe, Mail } from "lucide-react";

import { InfoItem } from "../components/ui/InfoItem.js";

const meta: Meta<typeof InfoItem> = {
  title: "UI/InfoItem",
  component: InfoItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InfoItem>;

export const Default: Story = {
  args: {
    icon: Mail,
    label: "Email",
    value: "john@example.com",
  },
};

export const WithBadge: Story = {
  args: {
    icon: Mail,
    label: "Email",
    value: "john@example.com",
    badge: "Verified",
  },
};

export const ProfileInfo: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "360px" }}>
      <InfoItem icon={Mail} label="Email" value="alice@company.com" badge="Primary" />
      <InfoItem icon={Building2} label="Company" value="Acme Corporation" />
      <InfoItem icon={Globe} label="Website" value="https://acme.com" />
      <InfoItem icon={Calendar} label="Member Since" value="January 2024" />
    </div>
  ),
};
