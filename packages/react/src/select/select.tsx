"use client";

import { Select as Primitive } from "@base-ui/react/select";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@poise-ui/shared";
import * as React from "react";

const Select = Primitive.Root;

type SelectOverlayContextValue = {
  registerHighlightedItem: (element: HTMLElement) => void;
  unregisterHighlightedItem: (element: HTMLElement) => void;
};

const SelectOverlayContext = React.createContext<
  SelectOverlayContextValue | undefined
>(undefined);

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
    "align" | "alignItemWithTrigger" | "alignOffset" | "side" | "sideOffset"
  > & {
    /** The positioner sits between the portal and the popup, and owns z-index. */
    positionerClassName?: string;
  };

/**
 * Portal, positioner, popup and list in one - none of the four is useful alone,
 * and the popup has to sit inside all of them to be positioned at all.
 *
 * `alignItemWithTrigger` defaults to off rather than Base UI's on, because that
 * mode drives the popup's height itself and ignores `side` and `align`. It is a
 * prop, not a decision made here - `data-side="none"` is the hook for the
 * styling it needs, and the popup carries those overrides below.
 */
function SelectContent({
  className,
  positionerClassName,
  children,
  alignItemWithTrigger = false,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  ...props
}: SelectContentProps) {
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [highlightedItem, setHighlightedItem] =
    React.useState<HTMLElement | null>(null);

  const overlayContext = React.useMemo(
    () => ({
      registerHighlightedItem: (element: HTMLElement) => {
        setHighlightedItem(element);
      },
      unregisterHighlightedItem: (element: HTMLElement) => {
        setHighlightedItem((current) => (current === element ? null : current));
      },
    }),
    [],
  );

  return (
    <Primitive.Portal>
      <Primitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className={cn("isolate z-50", positionerClassName)}
      >
        <Primitive.Popup
          className={cn(
            "group/select max-h-[min(18rem,var(--available-height))] min-w-(--anchor-width)",
            "duration-fast ease-standard origin-(--transform-origin) transition-[opacity,scale]",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
            "data-ending-style:duration-instant data-ending-style:scale-95 data-ending-style:opacity-0",
            "data-[side=none]:max-h-none",
            "data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100",
            "data-[side=none]:data-ending-style:transition-none data-[side=none]:data-starting-style:transition-none",
          )}
          {...props}
        >
          <div
            ref={popupRef}
            data-slot="select-content"
            className={cn(
              "border-border bg-bg text-fg relative max-h-[inherit] overflow-hidden rounded-lg border p-1 shadow-lg",
              "group-data-[side=none]/select:h-full group-data-[side=none]/select:max-h-none",
              className,
            )}
          >
            <SelectScrollUpButton />
            <SelectItemOverlay
              popupRef={popupRef}
              item={highlightedItem}
              className="bg-muted"
            />
            <SelectOverlayContext.Provider value={overlayContext}>
              <Primitive.List
                data-slot="select-list"
                className="relative z-10 max-h-[min(18rem,var(--available-height))] scroll-py-2 overflow-y-auto overscroll-contain py-1"
              >
                {children}
              </Primitive.List>
            </SelectOverlayContext.Provider>
            <SelectScrollDownButton />
          </div>
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
function SelectItem({
  className,
  children,
  label,
  ...props
}: Primitive.Item.Props) {
  return (
    <Primitive.Item
      {...props}
      label={label ?? (typeof children === "string" ? children : undefined)}
      data-slot="select-item"
      className={cn(
        "text-fg relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
        "data-disabled:text-muted-fg data-disabled:pointer-events-none",
        "duration-fast ease-standard transition-colors",
        className,
      )}
      render={(renderProps, state) => (
        <SelectItemSurface {...renderProps} highlighted={state.highlighted}>
          {children}
        </SelectItemSurface>
      )}
    />
  );
}

function SelectItemSurface({
  children,
  highlighted,
  ...props
}: React.ComponentPropsWithRef<"div"> & {
  highlighted: boolean;
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const overlayContext = React.useContext(SelectOverlayContext);

  React.useLayoutEffect(() => {
    const element = itemRef.current;
    if (!element || !overlayContext) return;

    if (highlighted) overlayContext.registerHighlightedItem(element);

    return () => {
      overlayContext.unregisterHighlightedItem(element);
    };
  }, [highlighted, overlayContext]);

  return (
    <div
      {...props}
      ref={(element) => {
        itemRef.current = element;
        if (typeof props.ref === "function") props.ref(element);
        else if (props.ref) props.ref.current = element;
      }}
    >
      <Primitive.ItemText className="relative z-10 min-w-0 flex-1 truncate">
        {children}
      </Primitive.ItemText>
      <Primitive.ItemIndicator
        className={cn(
          "text-muted-fg absolute right-2 z-10 flex items-center",
          "duration-base ease-out-back transition-[opacity,scale]",
          "data-starting-style:scale-50 data-starting-style:opacity-0",
          "data-ending-style:scale-50 data-ending-style:opacity-0",
        )}
      >
        <HugeiconsIcon icon={Tick02Icon} size={14} aria-hidden="true" />
      </Primitive.ItemIndicator>
    </div>
  );
}

function SelectItemOverlay({
  popupRef,
  item,
  className,
}: {
  popupRef: React.RefObject<HTMLDivElement | null>;
  item: HTMLElement | null;
  className: string;
}) {
  const [style, setStyle] = React.useState<React.CSSProperties>();

  React.useLayoutEffect(() => {
    const popup = popupRef.current;
    if (!popup || !item) {
      setStyle(undefined);
      return;
    }

    const scrollContainer = item.closest<HTMLElement>(
      '[data-slot="select-list"]',
    );
    if (!scrollContainer) return;

    const update = () => {
      setStyle({
        height: item.offsetHeight,
        left: scrollContainer.offsetLeft + item.offsetLeft,
        top:
          scrollContainer.offsetTop +
          item.offsetTop -
          scrollContainer.scrollTop,
        transform: "translateZ(0)",
        width: item.offsetWidth,
      });
    };

    update();
    scrollContainer.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(popup);
    resizeObserver.observe(scrollContainer);
    resizeObserver.observe(item);

    return () => {
      scrollContainer.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [item, popupRef]);

  if (!style) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-0 rounded-sm",
        "duration-fast ease-standard transition-[height,left,top,width]",
        className,
      )}
      style={style}
    />
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
        "text-muted-fg bg-bg top-0 z-20 flex w-full cursor-default items-center justify-center",
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
        "text-muted-fg bg-bg bottom-0 z-20 flex w-full cursor-default items-center justify-center",
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
