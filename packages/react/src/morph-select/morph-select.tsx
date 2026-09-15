"use client";

import { Select as Primitive } from "@base-ui/react/select";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { eases, springs } from "@poise-ui/motion";
import { cn } from "@poise-ui/shared";
import { motion } from "motion/react";
import * as React from "react";

type MorphSide = "top" | "bottom";

/** How an item hands itself to the overlay that follows the highlight. */
const MorphOverlayContext = React.createContext<
  React.Dispatch<React.SetStateAction<HTMLElement | null>> | undefined
>(undefined);

type MorphRootContextValue = {
  actionsRef: React.RefObject<Primitive.Root.Actions | null>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

const MorphRootContext = React.createContext<MorphRootContextValue | undefined>(
  undefined,
);

/** Keeps a local ref while still honouring the one the caller passed. */
const mergeRefs =
  <T,>(local: React.RefObject<T | null>, forwarded: React.Ref<T> | undefined) =>
  (element: T | null) => {
    local.current = element;
    if (typeof forwarded === "function") forwarded(element);
    else if (forwarded) forwarded.current = element;
  };

function useMorphRoot(part: string) {
  const context = React.useContext(MorphRootContext);
  if (!context) {
    throw new Error(`<${part}> must be rendered inside <MorphSelect>.`);
  }
  return context;
}

export type MorphSelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = Omit<Primitive.Root.Props<Value, Multiple>, "actionsRef">;

/**
 * Base UI unmounts the popup when a CSS transition on it ends. There is none
 * now, so `actionsRef` turns that off and `MorphSelectContent` unmounts the
 * popup itself once the closing spring settles.
 */
function MorphSelect<Value, Multiple extends boolean | undefined = false>(
  props: MorphSelectProps<Value, Multiple>,
) {
  const actionsRef = React.useRef<Primitive.Root.Actions | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  return (
    <MorphRootContext.Provider value={{ actionsRef, triggerRef }}>
      <Primitive.Root {...props} actionsRef={actionsRef} />
    </MorphRootContext.Provider>
  );
}

export type MorphSelectTriggerProps = Primitive.Trigger.Props & {
  placeholder?: React.ReactNode;
};

function MorphSelectTrigger({
  className,
  placeholder = "Select…",
  ref,
  children,
  ...props
}: MorphSelectTriggerProps) {
  const { triggerRef } = useMorphRoot("MorphSelectTrigger");

  return (
    <Primitive.Trigger
      data-slot="morph-select-trigger"
      className={cn(
        "group text-fg border-border bg-bg relative flex h-10 w-fit min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm",
        "active:scale-98",
        "hover:not-data-disabled:bg-muted data-popup-open:not-data-disabled:bg-muted",
        "focus-visible:outline-ring outline-2 outline-offset-2 outline-transparent",
        "data-placeholder:text-muted-fg",
        "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
        // Above the popup, so the popup is hidden until it grows clear.
        "data-popup-side:z-50",
        "duration-fast ease-standard transition-[background-color,outline-color,scale]",
        className,
      )}
      {...props}
      ref={mergeRefs(triggerRef, ref)}
    >
      {children}
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

function MorphSelectValue({ className, ...props }: Primitive.Value.Props) {
  return (
    <Primitive.Value
      data-slot="morph-select-value"
      className={cn("min-w-0 truncate text-left", className)}
      {...props}
    />
  );
}

export type MorphSelectContentProps = Primitive.Popup.Props & {
  side?: MorphSide;
  sideOffset?: number;
  positionerClassName?: string;
};

/**
 * `alignItemWithTrigger` is off because that mode drives the popup's height and
 * position itself.

 */
function MorphSelectContent({
  className,
  positionerClassName,
  children,
  side = "bottom",
  sideOffset = 6,
  ...props
}: MorphSelectContentProps) {
  const { actionsRef, triggerRef } = useMorphRoot("MorphSelectContent");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = React.useState<{
    width: number;
    height: number;
  }>();
  const [highlightedItem, setHighlightedItem] =
    React.useState<HTMLElement | null>(null);

  const measureContent = React.useCallback((element: HTMLDivElement | null) => {
    contentRef.current = element;
    if (!element) return;

    const update = () =>
      setNaturalSize((current) =>
        current?.width === element.offsetWidth &&
        current?.height === element.offsetHeight
          ? current
          : { width: element.offsetWidth, height: element.offsetHeight },
      );

    update();

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);

    return () => {
      contentRef.current = null;
      resizeObserver.disconnect();
    };
  }, []);

  // Measured off the trigger, not off `--anchor-width` / `--anchor-height`:
  // custom properties read back unresolved, and Motion needs a number.
  const collapsedPose = (resolvedSide: Primitive.Popup.State["side"]) => {
    const trigger = triggerRef.current;
    const width = trigger?.offsetWidth ?? 0;
    const height = trigger?.offsetHeight ?? 0;
    const shift = height + sideOffset;

    return { width, height, y: resolvedSide === "top" ? shift : -shift };
  };

  return (
    <Primitive.Portal>
      <Primitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align="start"
        alignItemWithTrigger={false}
        className={cn("isolate z-40", positionerClassName)}
      >
        <Primitive.Popup
          className="group/morph pointer-events-none relative"
          {...props}
          render={(
            { children: popupChildren, style, ...renderProps },
            state,
          ) => (
            <div {...renderProps} style={{ ...style, ...naturalSize }}>
              <motion.div
                className={cn(
                  "border-border bg-bg text-fg pointer-events-auto absolute left-0 overflow-hidden rounded-md border shadow-lg",
                  state.side === "top" ? "bottom-0" : "top-0",
                  "duration-slower ease-standard transition-shadow",
                  "group-data-starting-style/morph:shadow-transparent",
                  "group-data-ending-style/morph:duration-base group-data-ending-style/morph:shadow-transparent",
                )}
                initial={collapsedPose(state.side)}
                animate={
                  state.open && naturalSize
                    ? { ...naturalSize, y: 0 }
                    : collapsedPose(state.side)
                }
                transition={state.open ? springs.smooth : eases.standard}
                // Base UI is not watching, so say when the popup can go.
                onAnimationComplete={() => {
                  if (!state.open) actionsRef.current?.unmount();
                }}
              >
                {popupChildren}
              </motion.div>
            </div>
          )}
        >
          <div
            ref={measureContent}
            data-slot="morph-select-content"
            className={cn(
              "relative w-max max-w-(--available-width) min-w-(--anchor-width) p-1",
              "duration-slower ease-standard opacity-100 transition-[filter,opacity]",
              "group-data-starting-style/morph:opacity-0 group-data-starting-style/morph:blur-sm",
              "group-data-ending-style/morph:filter-sm group-data-ending-style/morph:opacity-0",
              "group-data-ending-style/morph:duration-slow",
              className,
            )}
          >
            <MorphSelectScrollUpButton />

            <MorphSelectItemOverlay
              popupRef={contentRef}
              item={highlightedItem}
              className="bg-muted"
            />
            <MorphOverlayContext.Provider value={setHighlightedItem}>
              <Primitive.List
                data-slot="morph-select-list"
                className="relative z-10 max-h-[min(18rem,var(--available-height))] scroll-py-2 overflow-y-auto overscroll-contain"
              >
                {children}
              </Primitive.List>
            </MorphOverlayContext.Provider>

            <MorphSelectScrollDownButton />
          </div>
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

function MorphSelectGroup({ className, ...props }: Primitive.Group.Props) {
  return (
    <Primitive.Group
      data-slot="morph-select-group"
      className={cn("scroll-my-1", className)}
      {...props}
    />
  );
}

function MorphSelectGroupLabel({
  className,
  ...props
}: Primitive.GroupLabel.Props) {
  return (
    <Primitive.GroupLabel
      data-slot="morph-select-group-label"
      className={cn("text-muted-fg px-2 py-1.5 text-xs font-medium", className)}
      {...props}
    />
  );
}

function MorphSelectItem({
  className,
  children,
  label,
  ...props
}: Primitive.Item.Props) {
  return (
    <Primitive.Item
      {...props}
      label={label ?? (typeof children === "string" ? children : undefined)}
      data-slot="morph-select-item"
      className={cn(
        "text-fg relative flex h-10 cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
        "data-disabled:text-muted-fg data-disabled:pointer-events-none",
        "duration-fast ease-standard transition-colors",
        className,
      )}
      render={(renderProps, state) => (
        <MorphSelectItemSurface
          {...renderProps}
          highlighted={state.highlighted}
        >
          {children}
        </MorphSelectItemSurface>
      )}
    />
  );
}

function MorphSelectItemSurface({
  children,
  highlighted,
  ...props
}: React.ComponentPropsWithRef<"div"> & {
  highlighted: boolean;
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const setHighlightedItem = React.useContext(MorphOverlayContext);

  React.useLayoutEffect(() => {
    const element = itemRef.current;
    if (!element || !setHighlightedItem || !highlighted) return;

    setHighlightedItem(element);

    return () =>
      setHighlightedItem((current) => (current === element ? null : current));
  }, [highlighted, setHighlightedItem]);

  return (
    <div {...props} ref={mergeRefs(itemRef, props.ref)}>
      <Primitive.ItemText className="relative z-10 min-w-0 flex-1 truncate">
        {children}
      </Primitive.ItemText>
      <Primitive.ItemIndicator
        className={cn(
          "text-muted-fg absolute right-2 z-10 flex items-center",
          "duration-base transition-[opacity,scale] ease-in-out",
          "data-starting-style:scale-50 data-starting-style:opacity-0",
          "data-ending-style:scale-50 data-ending-style:opacity-0",
        )}
      >
        <HugeiconsIcon icon={Tick02Icon} size={14} aria-hidden="true" />
      </Primitive.ItemIndicator>
    </div>
  );
}

function MorphSelectItemOverlay({
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
    if (!popup || !item) return;

    const scrollContainer = item.closest<HTMLElement>(
      '[data-slot="morph-select-list"]',
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

function MorphSelectSeparator({
  className,
  ...props
}: Primitive.Separator.Props) {
  return (
    <Primitive.Separator
      data-slot="morph-select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function MorphSelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.ScrollUpArrow>) {
  return (
    <Primitive.ScrollUpArrow
      data-slot="morph-select-scroll-up-button"
      className={cn(
        "text-muted-fg bg-bg top-0 z-20 flex w-full cursor-default items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowUp01Icon} size={16} aria-hidden="true" />
    </Primitive.ScrollUpArrow>
  );
}

function MorphSelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.ScrollDownArrow>) {
  return (
    <Primitive.ScrollDownArrow
      data-slot="morph-select-scroll-down-button"
      className={cn(
        "text-muted-fg bg-bg bottom-0 z-20 flex w-full cursor-default items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowDown01Icon} size={16} aria-hidden="true" />
    </Primitive.ScrollDownArrow>
  );
}

export {
  MorphSelect,
  MorphSelectContent,
  MorphSelectGroup,
  MorphSelectGroupLabel,
  MorphSelectItem,
  MorphSelectSeparator,
  MorphSelectScrollDownButton,
  MorphSelectScrollUpButton,
  MorphSelectTrigger,
  MorphSelectValue,
};
