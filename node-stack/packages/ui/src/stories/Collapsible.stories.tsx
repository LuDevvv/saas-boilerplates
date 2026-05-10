import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "../components/ui/Button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/Collapsible.js";

const meta: Meta<typeof Collapsible> = {
  title: "UI/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible open={open} onOpenChange={setOpen} style={{ width: "360px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Advanced Options</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
            <p>Option 1: Enable debug mode</p>
            <p>Option 2: Advanced logging</p>
            <p>Option 3: Experimental features</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible defaultOpen style={{ width: "360px" }}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" style={{ width: "100%", justifyContent: "space-between" }}>
          Show Details <ChevronDown />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "0 0 8px 8px" }}>
          <p>Detailed information that is visible by default.</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
