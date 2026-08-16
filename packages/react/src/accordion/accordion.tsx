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
      className={cn("py-1", className)}
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
        "text-muted-fg h-(--accordion-panel-height) overflow-hidden text-sm",
        "data-ending-style:h-0 data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:h-0 data-starting-style:translate-y-2",
        "duration-base ease-standard transition-[opacity,height,translate]",
        className,
      )}
      {...props}
    >
      <div className="px-4 pt-0.5 pb-2">{children}</div>
    </Primitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionPanel };
