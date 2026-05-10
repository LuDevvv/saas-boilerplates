import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea } from "../components/ui/ScrollArea.js";

const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

const TAGS = [
  "React", "TypeScript", "JavaScript", "Node.js", "Python", "Go", "Rust",
  "GraphQL", "REST API", "Docker", "Kubernetes", "AWS", "GCP", "Tailwind CSS",
  "Next.js", "Vite", "Vitest", "Storybook", "PostgreSQL", "Redis", "MongoDB",
];

export const Default: Story = {
  render: () => (
    <ScrollArea style={{ height: "200px", width: "320px", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px" }}>
      {TAGS.map((tag) => (
        <div key={tag} style={{ padding: "8px 12px", borderBottom: "1px solid #f3f4f6" }}>
          {tag}
        </div>
      ))}
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea style={{ width: "320px", whiteSpace: "nowrap", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {TAGS.map((tag) => (
          <span key={tag} style={{ padding: "4px 12px", background: "#f3f4f6", borderRadius: "20px", fontSize: "12px" }}>
            {tag}
          </span>
        ))}
      </div>
    </ScrollArea>
  ),
};
