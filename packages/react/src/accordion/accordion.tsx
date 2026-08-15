"use client";

import type * as React from "react";

import { Accordion as Primitive } from "@base-ui/react/accordion";

import { cn } from "@poise-ui/shared";

/**
 * Panel height is animated off Base UI's `--accordion-panel-height` variable
 * rather than JS, so the transition survives being copied into a project that
 * has no motion library installed.
 */
const PANEL_TRANSITION =
  "transition-[height] duration-[var(--poise-duration-base)] ease-[var(--poise-ease-standard)]";

function Accordion({ className, ...props }: Primitive.Root.Props) {
  return (
    <Primitive.Root
      data-slot="accordion"
      className={cn(
        "w-full divide-y divide-border rounded-md border border-border",
        className,
      )}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: Primitive.Item.Props) {
  return (
    <Primitive.Item
      data-slot="accordion-item"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

export type AccordionTriggerProps = Primitive.Trigger.Props & {
  /** Class names for the `<h3>` that wraps the trigger button. */
  headerClassName?: string;
};

/**
 * Header and Trigger are collapsed into one component: the header exists only
 * to carry the heading role, and splitting it would make every call site
 * repeat the same two-element pair.
 */
function AccordionTrigger({
  className,
  headerClassName,
  children,
  ...props
}: AccordionTriggerProps) {
  return (
    <Primitive.Header data-slot="accordion-header" className={headerClassName}>
      <Primitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium text-fg",
          "hover:not-data-disabled:bg-muted",
          "focus-visible:relative focus-visible:z-1 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
          "data-disabled:cursor-not-allowed data-disabled:text-muted-fg",
          "transition-colors duration-[var(--poise-duration-fast)] ease-[var(--poise-ease-standard)]",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronIcon
          className={cn(
            "shrink-0 text-muted-fg",
            "transition-transform duration-[var(--poise-duration-base)] ease-[var(--poise-ease-standard)]",
            "group-data-panel-open:rotate-180",
          )}
        />
      </Primitive.Trigger>
    </Primitive.Header>
  );
}

function AccordionPanel({
  className,
  children,
  ...props
}: Primitive.Panel.Props) {
  return (
    <Primitive.Panel
      data-slot="accordion-panel"
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-muted-fg",
        "data-starting-style:h-0 data-ending-style:h-0",
        PANEL_TRANSITION,
        className,
      )}
      {...props}
    >
      <div className="px-4 pb-3">{children}</div>
    </Primitive.Panel>
  );
}

function ChevronIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel };
