"use client";

import { Select as Primitive } from "@base-ui/react/select";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@poise-ui/shared";
import type * as React from "react";

const Select = Primitive.Root;

export type SelectTriggerProps = Omit<Primitive.Trigger.Props, "children"> & {
  placeholder?: React.ReactNode;
};

/**
 * Owns the value text and the chevron, so it takes no children. Base UI puts
 * `data-placeholder` on the trigger while nothing is selected, which is what
 * dims the value text - the value span itself never needs a state class.
 */
function SelectTrigger({
  className,
  placeholder = "Select…",
  ...props
}: SelectTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "group text-fg border-border bg-bg flex w-fit min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm",
        "hover:not-data-disabled:bg-muted data-popup-open:not-data-disabled:bg-muted",
        "focus-visible:outline-ring outline-2 outline-offset-2 outline-transparent",
        "data-placeholder:text-muted-fg",
        "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
        "duration-fast ease-standard transition-[background,outline-color]",
        className,
      )}
      {...props}
    >
      <Primitive.Value
        data-slot="select-value"
        placeholder={placeholder}
        className="min-w-0 truncate"
      />
      <Primitive.Icon
        render={
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={16}
            aria-hidden="true"
            className={cn(
              "text-muted-fg shrink-0",
              "duration-base ease-standard transition-transform",
              "group-data-popup-open:rotate-180",
            )}
          />
        }
      />
    </Primitive.Trigger>
  );
}

export type SelectContentProps = Primitive.Popup.Props &
  Pick<
    Primitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    /** The positioner sits between the portal and the popup, and owns z-index. */
    positionerClassName?: string;
  };

/**
 * Portal, positioner, popup and list in one - none of the four is useful alone,
 * and the popup has to sit inside all of them to be positioned at all.
 *
 * `alignItemWithTrigger` is off: that mode overlaps the trigger and drives the
 * popup's height itself, which fights both the transition and `align`.
 */
function SelectContent({
  className,
  positionerClassName,
  children,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  ...props
}: SelectContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={false}
        className={cn("isolate z-50", positionerClassName)}
      >
        <Primitive.Popup
          data-slot="select-content"
          className={cn(
            "border-border bg-bg text-fg relative min-w-(--anchor-width) rounded-lg border p-1 shadow-lg",
            "max-h-[min(18rem,var(--available-height))] scroll-py-1 overflow-y-auto overscroll-contain",
            "duration-fast ease-standard origin-(--transform-origin) transition-[opacity,scale]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:duration-instant data-ending-style:scale-95 data-ending-style:opacity-0",
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <Primitive.List>{children}</Primitive.List>
          <SelectScrollDownButton />
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

function SelectGroup({ className, ...props }: Primitive.Group.Props) {
  return (
    <Primitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  );
}

function SelectGroupLabel({ className, ...props }: Primitive.GroupLabel.Props) {
  return (
    <Primitive.GroupLabel
      data-slot="select-group-label"
      className={cn("text-muted-fg px-2 py-1.5 text-xs font-medium", className)}
      {...props}
    />
  );
}

/**
 * The checkmark sits in an absolute slot rather than the item's flex row, so a
 * row gaining or losing it never resizes the popup.
 */
function SelectItem({ className, children, ...props }: Primitive.Item.Props) {
  return (
    <Primitive.Item
      data-slot="select-item"
      className={cn(
        "text-fg relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
        "data-highlighted:bg-muted",
        "data-disabled:text-muted-fg data-disabled:pointer-events-none",
        "duration-fast ease-standard transition-colors",
        className,
      )}
      {...props}
    >
      <Primitive.ItemText className="min-w-0 flex-1 truncate">
        {children}
      </Primitive.ItemText>
      <Primitive.ItemIndicator
        className={cn(
          "text-muted-fg absolute right-2 flex items-center",
          "duration-base ease-out-back transition-[opacity,scale]",
          "data-starting-style:scale-50 data-starting-style:opacity-0",
          "data-ending-style:scale-50 data-ending-style:opacity-0",
        )}
      >
        <HugeiconsIcon icon={Tick02Icon} size={14} aria-hidden="true" />
      </Primitive.ItemIndicator>
    </Primitive.Item>
  );
}

function SelectSeparator({ className, ...props }: Primitive.Separator.Props) {
  return (
    <Primitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.ScrollUpArrow>) {
  return (
    <Primitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "text-muted-fg bg-bg top-0 flex w-full cursor-default items-center justify-center py-1",
        "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowUp01Icon} size={16} aria-hidden="true" />
    </Primitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.ScrollDownArrow>) {
  return (
    <Primitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "text-muted-fg bg-bg bottom-0 flex w-full cursor-default items-center justify-center py-1",
        "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowDown01Icon} size={16} aria-hidden="true" />
    </Primitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
};
