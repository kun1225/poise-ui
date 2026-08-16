"use client";

import { Accordion as Primitive } from "@base-ui/react/accordion";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@poise-ui/shared";

export type MorphAccordionProps = Primitive.Root.Props & {
  /** Divide rows that are both closed. Off leaves the stack as one blank card. */
  hasBorder?: boolean;
  /** Shrink the rows that stayed closed while another row is open. */
  scale?: boolean;
};

/**
 * Both options resolve to a custom property rather than being handed down the
 * tree, so an item needs no knowledge of its root and the whole component
 * stays free of context. Either one can also be set through `className`.
 *
 * The divider reads `--poise-color-border` rather than `--color-border`: the
 * token file maps the Tailwind theme with `@theme inline`, so the theme names
 * only exist at build time and resolve to nothing at runtime.
 */
function MorphAccordion({
  className,
  hasBorder = true,
  scale = false,
  ...props
}: MorphAccordionProps) {
  return (
    <Primitive.Root
      data-slot="morph-accordion"
      className={cn(
        "isolate w-full [--morph-gap:1.5rem]",
        hasBorder
          ? "[--morph-divider:var(--poise-color-border)]"
          : "[--morph-divider:transparent]",
        scale ? "[--morph-closed-scale:0.96]" : "[--morph-closed-scale:1]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Closed, the stack reads as a single card. Opening an item detaches it: it
 * rounds on all four corners and its neighbours slide clear by `--morph-gap`,
 * leaving the rows above and below sealed as cards of their own.
 *
 * The gap is a translate rather than a margin, so the card you clicked stays
 * put under the pointer and only its neighbours move. The trade is that they
 * move outside the accordion's own box - leave room around it.
 *
 * Every border is present at every moment and only its colour changes, so none
 * of this shifts layout by the width of a border. The top edge carries
 * `--morph-divider`, which is what `hasBorder` switches off; the edges that
 * seal a card override it and stay painted either way.
 *
 * The two selectors that move a neighbour also scale it, since "sits beside
 * the open card" is the same condition for both.
 */
const morphItem = cn(
  "bg-bg relative border border-transparent",
  "border-x-border border-t-(--morph-divider)",
  "translate-y-0 scale-100",
  "last:border-b-border first:border-t-border first:rounded-t-2xl last:rounded-b-2xl",
  "[&:has(button:hover:not([data-disabled]))]:bg-muted",
  // The open card, and the two edges it seals against.
  "data-open:border-t-border data-open:border-b-border data-open:z-1 data-open:rounded-2xl",
  "[&:has(+[data-open])]:border-b-border [&:has(+[data-open])]:rounded-b-2xl",
  "[[data-open]+&]:border-t-border [[data-open]+&]:rounded-t-2xl",
  // Neighbours move away from the open card and drop behind it; the card
  // itself does neither.
  "[&:has(~[data-open])]:translate-y-[calc(var(--morph-gap)*-1)] [&:has(~[data-open])]:scale-(--morph-closed-scale)",
  "[[data-open]~&]:translate-y-[var(--morph-gap)] [[data-open]~&]:scale-(--morph-closed-scale)",
  "duration-middle ease-standard transition-[border-color,border-radius,translate,scale,background-color]",
);

function MorphAccordionItem({ className, ...props }: Primitive.Item.Props) {
  return (
    <Primitive.Item
      data-slot="morph-accordion-item"
      className={cn(morphItem, className)}
      {...props}
    />
  );
}

export type MorphAccordionTriggerProps = Primitive.Trigger.Props & {
  headerClassName?: string;
};

function MorphAccordionTrigger({
  className,
  headerClassName,
  children,
  ...props
}: MorphAccordionTriggerProps) {
  return (
    <Primitive.Header
      data-slot="morph-accordion-header"
      className={headerClassName}
    >
      <Primitive.Trigger
        data-slot="morph-accordion-trigger"
        className={cn(
          "group text-fg flex w-full cursor-pointer items-center gap-4 rounded-[inherit] px-4 py-3.5 text-left text-sm font-medium",
          "focus-visible:outline-ring outline-2 -outline-offset-1 outline-transparent focus-visible:relative focus-visible:z-1 focus-visible:outline-offset-2",
          "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
          "duration-fast ease-standard transition-[outline,outline-offset]",
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <HugeiconsIcon
          icon={PlusSignIcon}
          size={16}
          aria-hidden="true"
          className={cn(
            "text-muted-fg shrink-0 opacity-70",
            "duration-middle ease-standard transition-[rotate,opacity]",
            "group-hover:opacity-100",
            "group-data-panel-open:rotate-225",
          )}
        />
      </Primitive.Trigger>
    </Primitive.Header>
  );
}

const contentReveal = cn(
  "duration-middle ease-standard transition-[translate,opacity,filter]",
  "group-data-starting-style/morph:translate-y-4 group-data-starting-style/morph:opacity-40 group-data-starting-style/morph:blur-sm",
  "group-data-ending-style/morph:translate-y-4 group-data-ending-style/morph:opacity-40 group-data-ending-style/morph:blur-sm",
);

function MorphAccordionPanel({
  className,
  children,
  ...props
}: Primitive.Panel.Props) {
  return (
    <Primitive.Panel
      data-slot="morph-accordion-panel"
      className={cn(
        "group/morph text-muted-fg h-(--accordion-panel-height) overflow-hidden text-sm",
        "data-ending-style:h-0 data-starting-style:h-0",
        "duration-slower ease-out-back transition-[height]",
        className,
      )}
      {...props}
    >
      <div className={cn("px-4 pb-4", contentReveal)}>{children}</div>
    </Primitive.Panel>
  );
}

export {
  MorphAccordion,
  MorphAccordionItem,
  MorphAccordionTrigger,
  MorphAccordionPanel,
};
