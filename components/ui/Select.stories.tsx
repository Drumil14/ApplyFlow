import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "@/components/ui/Select";

const options = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" }
];

const meta = {
  title: "UI/Select",
  component: Select,
  args: { options, "aria-label": "Status" },
  decorators: [(Story) => <div className="w-64">{Story()}</div>]
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Preselected: Story = { args: { defaultValue: "interview" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "applied" } };
