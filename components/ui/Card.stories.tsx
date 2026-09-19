import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "@/components/ui/Card";

const meta = {
  title: "UI/Card",
  component: Card,
  args: {
    className: "w-80 p-5",
    children: (
      <div>
        <h3 className="text-base font-semibold text-content">Frontend Engineer</h3>
        <p className="mt-1 text-sm text-content-secondary">Stripe · Remote</p>
      </div>
    )
  }
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Interactive: Story = { args: { interactive: true } };
