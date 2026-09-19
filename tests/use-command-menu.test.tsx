import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCommandMenu, type CommandItem } from "@/hooks/use-command-menu";

const commands: CommandItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Applications", href: "/dashboard/applications" },
  { label: "Kanban board", href: "/dashboard/board" },
  { label: "AI analyzer", href: "/dashboard/analyzer" }
];

function press(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key }));
  });
}

describe("useCommandMenu", () => {
  it("filters commands by query (case-insensitive)", () => {
    const { result } = renderHook(() =>
      useCommandMenu(commands, { open: true, onToggle: vi.fn(), onClose: vi.fn(), onSelect: vi.fn() })
    );

    act(() => result.current.setQuery("analy"));
    expect(result.current.filtered.map((c) => c.label)).toEqual(["AI analyzer"]);
  });

  it("moves the active index with arrow keys, clamped to bounds", () => {
    const { result } = renderHook(() =>
      useCommandMenu(commands, { open: true, onToggle: vi.fn(), onClose: vi.fn(), onSelect: vi.fn() })
    );

    press("ArrowDown");
    expect(result.current.selected).toBe(1);
    press("ArrowUp");
    press("ArrowUp"); // clamps at 0
    expect(result.current.selected).toBe(0);
  });

  it("selects the active command on Enter", () => {
    const onSelect = vi.fn();
    renderHook(() => useCommandMenu(commands, { open: true, onToggle: vi.fn(), onClose: vi.fn(), onSelect }));

    press("ArrowDown"); // -> Applications
    press("Enter");
    expect(onSelect).toHaveBeenCalledWith(commands[1]);
  });

  it("toggles on Ctrl+K and closes on Escape", () => {
    const onToggle = vi.fn();
    const onClose = vi.fn();
    renderHook(() => useCommandMenu(commands, { open: true, onToggle, onClose, onSelect: vi.fn() }));

    act(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true })));
    expect(onToggle).toHaveBeenCalledTimes(1);

    press("Escape");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
