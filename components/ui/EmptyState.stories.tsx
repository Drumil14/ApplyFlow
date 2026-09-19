import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  args: {
    title: "No applications yet",
    description: "Add your first role, then use the board and timeline to keep the search moving."
  },
  decorators: [(Story) => <div className="w-[36rem]">{Story()}</div>]
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = { args: { action: <Button>Add application</Button> } };
