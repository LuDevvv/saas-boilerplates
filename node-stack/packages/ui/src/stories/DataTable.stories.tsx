import type { Meta, StoryObj } from "@storybook/react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../components/ui/DataTable.js";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const USERS: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Member", status: "Active" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "Member", status: "Invited" },
  { id: "4", name: "David Lee", email: "david@example.com", role: "Viewer", status: "Active" },
  { id: "5", name: "Eve Martinez", email: "eve@example.com", role: "Member", status: "Active" },
];

const COLUMNS: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
];

const meta: Meta = {
  title: "UI/DataTable",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <DataTable data={USERS} columns={COLUMNS} />,
};

export const WithSearch: Story = {
  render: () => (
    <DataTable
      data={USERS}
      columns={COLUMNS}
      searchPlaceholder="Search team members..."
    />
  ),
};

export const Loading: Story = {
  render: () => <DataTable data={[]} columns={COLUMNS} isLoading />,
};

export const Empty: Story = {
  render: () => <DataTable data={[]} columns={COLUMNS} searchPlaceholder="Search..." />,
};
