import type { Meta, StoryObj } from "@storybook/react";
import { Input, Textarea } from "@/components/ui/Input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Company name" },
  decorators: [(Story) => <div className="w-80">{Story()}</div>]
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: "Stripe" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Read only" } };

export const TextareaDefault: StoryObj<typeof Textarea> = {
  render: (args) => <Textarea {...args} />,
  args: { placeholder: "Paste the job description…", className: "min-h-32 w-80" }
};
