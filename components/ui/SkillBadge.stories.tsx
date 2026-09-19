import type { Meta, StoryObj } from "@storybook/react";
import { SkillBadge } from "@/components/ui/SkillBadge";

const meta = {
  title: "UI/SkillBadge",
  component: SkillBadge,
  args: { children: "TypeScript" },
  argTypes: {
    tone: { control: "inline-radio", options: ["matched", "missing", "neutral"] }
  }
} satisfies Meta<typeof SkillBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Matched: Story = { args: { tone: "matched", children: "React" } };
export const Missing: Story = { args: { tone: "missing", children: "GraphQL" } };
export const Neutral: Story = { args: { tone: "neutral", children: "Figma" } };
