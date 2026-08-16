"use client";

import { Accordion as Primitive } from "@base-ui/react/accordion";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@poise-ui/shared";

function Accordion({ className, ...props }: Primitive.Root.Props) {
  return (
    <Primitive.Root
      data-slot="accordion"
      className={cn("divide-border w-full divide-y", className)}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: Primitive.Item.Props) {
  return (
    <Primitive.Item
      data-slot="accordion-item"
      className={cn(className)}
      {...props}
    />
  );
}

export type AccordionTriggerProps = Primitive.Trigger.Props & {
  headerClassName?: string;
};

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
          "group text-fg flex w-full cursor-pointer items-center justify-between gap-4 rounded-sm px-4 py-3 text-left text-sm font-medium",
          "hover:not-data-disabled:bg-muted",
          "focus-visible:outline-ring outline-2 -outline-offset-1 outline-transparent focus-visible:relative focus-visible:z-1 focus-visible:outline-offset-2",
          "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
          "duration-fast ease-standard transition-[background,outline,outline-offset]",
          className,
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={16}
          aria-hidden="true"
          className={cn(
            "text-muted-fg shrink-0",
            "duration-base ease-standard transition-transform",
            "group-data-panel-open:rotate-180",
            "group-hover:scale-115",
          )}
        />
      </Primitive.Trigger>
    </Primitive.Header>
  );
}

/**
 * Fades the panel's direct children in one after another, keyed off the
 * `data-starting-style` frame Base UI puts on the panel while it opens.
 *
 * The delays are a fixed ladder rather than a per-child variable, which keeps
 * the whole effect in CSS with no per-item JS. The fifth child onwards shares
 * the last step so a long panel does not drag. Only element children stagger,
 * since bare text has nothing to hang a delay on.
 *
 * Closing is deliberately not staggered - the panel collapses as one, which
 * reads as faster than reversing the ladder.
 */
const staggerChildren = cn(
  "[&>*]:duration-base [&>*]:ease-standard [&>*]:transition-[opacity,translate]",
  "group-data-starting-style/reveal:[&>*]:translate-y-1 group-data-starting-style/reveal:[&>*]:opacity-0",
  "[&>*:nth-child(2)]:delay-100",
  "[&>*:nth-child(3)]:delay-175",
  "[&>*:nth-child(4)]:delay-250",
  "[&>*:nth-child(n+5)]:delay-325",
  "motion-reduce:[&>*]:transition-none motion-reduce:[&>*]:delay-0",
);

export type AccordionPanelProps = Primitive.Panel.Props & {
  reveal?: "none" | "stagger";
};

function AccordionPanel({
  className,
  children,
  reveal = "none",
  ...props
}: AccordionPanelProps) {
  const staggered = reveal === "stagger";

  return (
    <Primitive.Panel
      data-slot="accordion-panel"
      className={cn(
        "text-muted-fg h-(--accordion-panel-height) overflow-hidden text-sm",
        "data-ending-style:h-0 data-ending-style:opacity-0 data-starting-style:h-0",
        "duration-base ease-standard transition-[opacity,height,translate] data-ending-style:translate-y-2 data-starting-style:translate-y-2",
        staggered
          ? "group/reveal"
          : "data-ending-style:translate-y-1 data-starting-style:translate-y-1",
        className,
      )}
      {...props}
    >
      <div className={cn("px-4 pt-0.5 pb-2", staggered && staggerChildren)}>
        {children}
      </div>
    </Primitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel };
