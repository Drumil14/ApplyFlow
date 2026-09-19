"use client";

import { useEffect, useMemo, useState } from "react";

export type CommandItem = { href: string; label: string };

type Options = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (command: CommandItem) => void;
};

/**
 * Keyboard + filtering logic for the command palette, extracted so it can be
 * unit-tested and reused independently of the palette's markup.
 *
 * Owns the search query and the active index; wires Ctrl/Cmd+K (toggle),
 * Escape (close), Up/Down (move), and Enter (select). Resets on open and
 * whenever the query changes.
 */
export function useCommandMenu<T extends CommandItem>(commands: T[], { open, onToggle, onClose, onSelect }: Options) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(
    () => commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onToggle();
      }
      if (event.key === "Escape") onClose();
      if (!open) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((current) => Math.min(current + 1, filtered.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelected((current) => Math.max(current - 1, 0));
      }
      if (event.key === "Enter" && filtered[selected]) {
        event.preventDefault();
        onSelect(filtered[selected]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, open, onClose, onToggle, onSelect, selected]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return { query, setQuery, selected, setSelected, filtered };
}
