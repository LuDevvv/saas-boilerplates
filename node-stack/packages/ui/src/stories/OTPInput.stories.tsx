import type { Meta, StoryObj } from "@storybook/react";
import React, { useRef, useState } from "react";

import { OTPInput } from "../components/ui/OTPInput.js";

const meta: Meta = {
  title: "UI/OTPInput",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function OTPDemo({ length = 6, disabled = false }: { length?: number; disabled?: boolean }): React.JSX.Element {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  const handleChange = (index: number, value: string): void => {
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    const next = [...code];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setCode(next);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <OTPInput
      length={length}
      code={code}
      inputRefs={inputRefs}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      disabled={disabled}
    />
  );
}

export const Default: Story = {
  render: () => <OTPDemo length={6} />,
};

export const FourDigit: Story = {
  render: () => <OTPDemo length={4} />,
};

export const Disabled: Story = {
  render: () => <OTPDemo length={6} disabled />,
};
