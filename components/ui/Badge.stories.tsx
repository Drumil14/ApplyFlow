import type { Meta, StoryObj } from "@storybook/react";
import { Badge, StatusBadge } from "@/components/ui/Badge";

const meta = {
  title: "UI/Badge",
  component: Badge
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "Hybrid" } };

export const AllStatuses: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {["APPLIED", "OA", "INTERVIEW", "FINAL_ROUND", "OFFER", "REJECTED"].map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  )
};
