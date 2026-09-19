import type { Meta, StoryObj } from "@storybook/react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Analyze match" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md"] }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const WithIcon: Story = { args: { icon: <Plus className="h-4 w-4" />, children: "Add application" } };
export const Loading: Story = {
  args: { disabled: true, icon: <Loader2 className="h-4 w-4 animate-spin" />, children: "Analyzing…" }
};
export const Disabled: Story = { args: { disabled: true } };
