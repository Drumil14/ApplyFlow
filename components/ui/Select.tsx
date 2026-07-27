"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  options: SelectOption[];
  /** Controlled value. Omit for an uncontrolled select (use defaultValue). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** When set, mirrors the value into a hidden input so native <form> submission works. */
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Accessible listbox select (WAI-ARIA APG collapsed listbox pattern).
 * DOM focus lives on the listbox while open; `aria-activedescendant` marks the
 * active option. Full keyboard support: Up/Down/Home/End, Enter/Space to choose,
 * Escape to dismiss, plus typeahead. Monochrome, gradient-surface styling — no
 * OS-native rendering, so no blue highlight.
 */
export function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder = "Select…",
  disabled = false,
  className,
  buttonClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby
}: SelectProps) {
  const reactId = useId();
  const baseId = id ?? `select-${reactId}`;
  const listId = `${baseId}-listbox`;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? "");
  const selected = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === selected))
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const typeahead = useRef<{ query: string; timer: ReturnType<typeof setTimeout> | null }>({
    query: "",
    timer: null
  });

  const selectedOption = options.find((option) => option.value === selected) ?? null;

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    if (!isControlled) setInternal(option.value);
    onChange?.(option.value);
  };

  const openList = () => {
    if (disabled) return;
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === selected)));
    setOpen(true);
  };

  const closeList = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };

  // Dismiss on outside pointer press.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Move focus into the listbox on open.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // Keep the active option visible.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const runTypeahead = (key: string) => {
    if (typeahead.current.timer) clearTimeout(typeahead.current.timer);
    typeahead.current.query += key.toLowerCase();
    const query = typeahead.current.query;
    const index = options.findIndex((option) => option.label.toLowerCase().startsWith(query));
    if (index >= 0) setActiveIndex(index);
    typeahead.current.timer = setTimeout(() => {
      typeahead.current.query = "";
    }, 600);
  };

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(options.length - 1, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        closeList();
        break;
      case "Escape":
        event.preventDefault();
        closeList();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          runTypeahead(event.key);
        }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? <input type="hidden" name={name} value={selected} /> : null}

      <button
        ref={buttonRef}
        type="button"
        id={baseId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-hairline bg-surface-inset px-3 text-left text-base text-content outline-none transition-colors hover:border-hairline-strong focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-50",
          buttonClassName
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-content-tertiary")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-content-tertiary" aria-hidden="true" />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          aria-activedescendant={`${baseId}-opt-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className="panel absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-hairline p-1 shadow-lg outline-none"
        >
          {options.map((option, index) => {
            const isSelected = option.value === selected;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value || `opt-${index}`}
                id={`${baseId}-opt-${index}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => {
                  commit(index);
                  closeList();
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive ? "bg-[rgb(var(--line)/0.08)] text-content" : "text-content-secondary"
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <Check className="h-4 w-4 shrink-0 text-content" aria-hidden="true" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
