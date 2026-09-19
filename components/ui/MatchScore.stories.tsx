import type { Meta, StoryObj } from "@storybook/react";
import { MatchScore } from "@/components/ui/MatchScore";

const meta = {
  title: "UI/MatchScore",
  component: MatchScore,
  args: { score: 82 },
  argTypes: {
    score: { control: { type: "range", min: 0, max: 100 } },
    size: { control: "inline-radio", options: ["sm", "md"] }
  }
} satisfies Meta<typeof MatchScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strong: Story = { args: { score: 82 } };
export const Weak: Story = { args: { score: 24 } };
export const Small: Story = { args: { score: 68, size: "sm" } };
