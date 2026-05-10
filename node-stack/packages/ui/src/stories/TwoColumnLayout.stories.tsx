import type { Meta, StoryObj } from "@storybook/react";

import { TwoColumnAside, TwoColumnLayout, TwoColumnMain } from "../components/ui/TwoColumnLayout.js";

const meta: Meta<typeof TwoColumnLayout> = {
  title: "UI/TwoColumnLayout",
  component: TwoColumnLayout,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TwoColumnLayout>;

const boxStyle = (bg: string) => ({
  background: bg,
  borderRadius: "8px",
  padding: "24px",
  minHeight: "200px",
});

export const Default: Story = {
  render: () => (
    <TwoColumnLayout>
      <TwoColumnMain>
        <div style={boxStyle("#eff6ff")}>
          <h3>Main Content</h3>
          <p>This is the primary content area. It takes up most of the horizontal space.</p>
        </div>
      </TwoColumnMain>
      <TwoColumnAside>
        <div style={boxStyle("#f0fdf4")}>
          <h3>Sidebar</h3>
          <p>Secondary information and actions.</p>
        </div>
      </TwoColumnAside>
    </TwoColumnLayout>
  ),
};

export const AsideLeft: Story = {
  render: () => (
    <TwoColumnLayout>
      <TwoColumnAside position="left">
        <div style={boxStyle("#fdf4ff")}>
          <h3>Left Sidebar</h3>
          <p>Navigation or filters.</p>
        </div>
      </TwoColumnAside>
      <TwoColumnMain>
        <div style={boxStyle("#eff6ff")}>
          <h3>Main Content</h3>
          <p>The main area with the primary content.</p>
        </div>
      </TwoColumnMain>
    </TwoColumnLayout>
  ),
};

export const StickyAside: Story = {
  render: () => (
    <TwoColumnLayout>
      <TwoColumnMain>
        <div style={{ ...boxStyle("#eff6ff"), minHeight: "600px" }}>
          <h3>Long Content</h3>
          <p>This content is long enough to cause scrolling.</p>
        </div>
      </TwoColumnMain>
      <TwoColumnAside sticky>
        <div style={boxStyle("#f0fdf4")}>
          <h3>Sticky Sidebar</h3>
          <p>This stays in view as you scroll.</p>
        </div>
      </TwoColumnAside>
    </TwoColumnLayout>
  ),
};
