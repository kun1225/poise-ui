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

/** The only two sides that can weld to the trigger. */
type MorphSide = "top" | "bottom";

/** The gap the popup rests at, handed to CSS so the start pose can undo it. */
type MorphPopupStyle = React.CSSProperties & { "--morph-gap": string };

type MorphOverlayContextValue = {
  registerHighlightedItem: (element: HTMLElement) => void;
  unregisterHighlightedItem: (element: HTMLElement) => void;
};

const MorphOverlayContext = React.createContext<
  MorphOverlayContextValue | undefined
>(undefined);

const MorphSelect = Primitive.Root;

export type MorphSelectTriggerProps = Omit<
  Primitive.Trigger.Props,
  "children"
> & {
  placeholder?: React.ReactNode;
};

/**
 * Owns the value text and the chevron, so it takes no children. Base UI puts
 * `data-placeholder` on the trigger while nothing is selected, which is what
 * dims the value text - the value span itself never needs a state class.
 *
 * Base UI also puts `data-popup-side` here for as long as a popup exists, which
 * is both of the things the trigger needs to know: which edge the popup came out
 * of - the side it asked for, or the opposite one it flipped to - and that there
 * is a popup to paint above at all. `z-index` only lasts as long as that
 * attribute, so a resting trigger does not outrank anything on the page.
 *
 * The border stays present at every moment and only its colour changes, so
 * nothing shifts by the width of a border on the way in or out.
 */
function MorphSelectTrigger({
  className,
  placeholder = "Select…",
  ...props
}: MorphSelectTriggerProps) {
  return (
    <Primitive.Trigger
      data-slot="morph-select-trigger"
      className={cn(
        "group text-fg border-border bg-bg relative flex w-fit min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm",
        "hover:not-data-popup-side:not-data-disabled:bg-muted",
        "focus-visible:outline-ring outline-2 outline-offset-2 outline-transparent",
        "data-placeholder:text-muted-fg",
        "data-disabled:text-muted-fg data-disabled:cursor-not-allowed",
        // Above the popup for as long as there is one, so it can come out from
        // behind the trigger rather than over it.
        "data-popup-side:z-50",
        // The seam. Whichever edge the popup is behind stops being an edge, and
        // then rounds back out as the popup clears the trigger.
        "data-morph-welded:data-[popup-side=bottom]:rounded-b-none data-morph-welded:data-[popup-side=bottom]:border-b-transparent",
        "data-morph-welded:data-[popup-side=top]:rounded-t-none data-morph-welded:data-[popup-side=top]:border-t-transparent",
        // Two speeds on one element: the hover and focus cues stay quick, while
        // the seam waits. The delay is what makes the popup look like it grew
        // out of the trigger - the edge stays welded for as long as the popup is
        // still passing it, and only rounds out over the tail of the flight.
        // Delay plus duration is the flight exactly: 240 + 180 = 420 in, and
        // 120 + 180 = 300 back out.
        "ease-standard [transition-property:background-color,outline-color,border-color,border-radius]",
        "[transition-duration:var(--poise-duration-fast),var(--poise-duration-fast),var(--poise-duration-base),var(--poise-duration-base)]",
        "[transition-delay:0s,0s,var(--poise-duration-middle),var(--poise-duration-middle)]",
        // Closing is the shorter flight, so the wait before rounding out is
        // shorter too. No `data-popup-open` while `data-popup-side` is still
        // there is Base UI's way of saying the popup is on its way out. This
        // excludes the welded frame by hand: two attribute selectors would
        // otherwise outrank the rule below and defer the weld past its own
        // release, which looks exactly like the weld not working at all.
        "not-data-morph-welded:not-data-popup-open:data-popup-side:[transition-delay:0s,0s,var(--poise-duration-fast),var(--poise-duration-fast)]",
        // Welding is instant, releasing it is not. A duration and a delay only
        // apply to the change that starts while they are in effect, so the flat
        // edge lands in the frame it is asked for and the round-out gets the
        // wait. The delay has to be zeroed too, or the weld itself would be
        // scheduled 240ms out - by which time it has already been released.
        "data-morph-welded:[transition-delay:0s] data-morph-welded:[transition-duration:0s]",
        className,
      )}
      {...props}
      render={(renderProps, state) => (
        <MorphTriggerSurface {...renderProps} open={state.open} />
      )}
    >
      <Primitive.Value
        data-slot="morph-select-value"
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

/**
 * Holds the welded style for exactly one painted frame either side of an open
 * change, then drops it.
 *
 * A CSS transition can only run *from* a style that has been painted, and
 * `data-popup-open` arrives in the same frame as the popup itself - so keying
 * the seam off it would hold the trigger flat for as long as the popup is open
 * rather than for as long as it is behind the trigger. Painting welded first and
 * releasing it on the next frame hands the rest to the transition above, which
 * rounds the corners out over the same time the popup takes to clear the gap.
 * Closing is the mirror: flat for a frame, rounding out behind the retreating
 * popup.
 */
function MorphTriggerSurface({
  open,
  ...props
}: React.ComponentProps<"button"> & { open: boolean }) {
  const [welded, setWelded] = React.useState(false);
  const openedOnceRef = React.useRef(false);

  React.useLayoutEffect(() => {
    // The first pass is the initial mount, not an open change - welding there
    // would flash a flat-bottomed trigger on a page that has not been touched.
    if (!openedOnceRef.current) {
      openedOnceRef.current = true;
      return;
    }

    setWelded(true);
    const frame = requestAnimationFrame(() => setWelded(false));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return <button {...props} data-morph-welded={welded ? "" : undefined} />;
}

export type MorphSelectContentProps = Primitive.Popup.Props & {
  /** Which edge of the trigger the popup grows from. Flips if there is no room. */
  side?: MorphSide;
  /** Pixels the popup comes to rest clear of the trigger. */
  sideOffset?: number;
  /** The positioner sits between the portal and the popup, and owns z-index. */
  positionerClassName?: string;
};

/**
 * Portal, positioner, popup and list in one - none of the four is useful alone,
 * and the popup has to sit inside all of them to be positioned at all.
 *
 * The morph is all CSS transitions on the popup. Base UI decides when to unmount
 * the popup by watching for a transition on it, so the closing half only exists
 * because these live here rather than in a JS animation:
 *
 * - `translate` carries it out from behind the trigger. The distance is the
 *   trigger's own height plus the gap it comes to rest at, which is what puts
 *   the start pose exactly over the trigger rather than short of it.
 * - `grid-template-rows` grows it from the trigger's height to its own. `0fr`
 *   collapses the only row while `min-height` holds the box open at
 *   `--anchor-height`, which is what makes the start pose the trigger's own box
 *   rather than nothing at all. Neither end of that is `auto`, so it is a real
 *   interpolation.
 * - `border-radius`, `border-color` and `box-shadow` round the leading edge out
 *   and lift the panel off the page as the gap opens - the other half of the
 *   seam the trigger is holding. The shadow animates by colour rather than by
 *   `shadow-none`, so it interpolates from the same geometry instead of from a
 *   keyword, and nothing is cast around the trigger while the panel is still
 *   hidden behind it.
 * Nothing fades the popup itself. The wrapper inside it owns both the blur and
 * the fade, because a `filter` or an `opacity` on the popup takes its border and
 * shadow with it: the panel softens, widens and washes out just when it is
 * meant to be reading as the trigger's own box. The panel therefore stays solid
 * from the first frame - it is hidden because it is behind the trigger, not
 * because it is transparent - and only the rows arrive out of nothing. The
 * wrapper cannot see the popup's transition state on its own, so the popup lends
 * it one as a group.
 *
 * The popup is genuinely behind the trigger while it is behind it: the trigger
 * outranks the positioner for as long as a popup exists. That only holds while
 * both sit in the same stacking context - the popup is portaled to `<body>`, so
 * an ancestor of the trigger that makes a stacking context of its own and sits
 * below `z-50` will win instead, and the popup will pass over the trigger rather
 * than under it. Nothing else about the effect depends on it.
 *
 * The list carries the height cap rather than the popup, and is not stretched
 * to the row it sits in. Base UI reads the scroller's height one frame after
 * opening to decide whether the scroll arrows are needed, and never reads it
 * again unless you scroll - so a scroller whose height is the thing being
 * animated measures as scrollable and keeps an arrow it does not need. Sizing
 * the list itself leaves it the same height at every frame, clipped by the row
 * above it rather than squeezed by it.
 *
 * The width is `--anchor-width` rather than a prop, so the popup is always the
 * trigger's own box to start from. `align` is moot at exactly that width, and
 * `alignItemWithTrigger` is off because that mode drives the popup's height and
 * position itself.
 */
function MorphSelectContent({
  className,
  positionerClassName,
  children,
  side = "bottom",
  sideOffset = 6,
  style,
  ...props
}: MorphSelectContentProps) {
  const popupStyle: MorphPopupStyle = {
    ...style,
    "--morph-gap": `${sideOffset}px`,
  };
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
        alignItemWithTrigger={false}
        className={cn("isolate z-40", positionerClassName)}
      >
        <Primitive.Popup
          style={popupStyle}
          className={cn(
            "group/morph border-border bg-bg text-fg grid w-(--anchor-width) grid-rows-[1fr] overflow-hidden rounded-md border shadow-lg",
            "min-h-(--anchor-height)",
            // How far back over the trigger the start and end poses sit.
            "data-[side=bottom]:[--morph-shift:calc((var(--anchor-height)+var(--morph-gap))*-1)]",
            "data-[side=top]:[--morph-shift:calc(var(--anchor-height)+var(--morph-gap))]",
            "[translate:0_0]",
            "ease-standard [transition-property:grid-template-rows,translate,border-color,border-radius,box-shadow]",
            "[transition-duration:var(--poise-duration-slower),var(--poise-duration-slower),var(--poise-duration-base),var(--poise-duration-base),var(--poise-duration-base)]",
            "[transition-delay:0s,0s,var(--poise-duration-middle),var(--poise-duration-middle),var(--poise-duration-middle)]",
            "data-starting-style:grid-rows-[0fr]",
            "data-starting-style:[translate:0_var(--morph-shift)]",
            "data-ending-style:grid-rows-[0fr]",
            "data-ending-style:[transition-duration:var(--poise-duration-slow),var(--poise-duration-slow),var(--poise-duration-base),var(--poise-duration-base),var(--poise-duration-base)]",
            "data-ending-style:[transition-delay:0s,0s,var(--poise-duration-fast),var(--poise-duration-fast),var(--poise-duration-fast)]",
            "data-ending-style:[translate:0_var(--morph-shift)]",
            // The popup's half of the seam: flat against the trigger at both
            // ends of the flight, rounded once it is clear of it.
            "data-ending-style:shadow-transparent data-starting-style:shadow-transparent",
            "data-[side=bottom]:data-starting-style:rounded-t-none data-[side=bottom]:data-starting-style:border-t-transparent",
            "data-[side=bottom]:data-ending-style:rounded-t-none data-[side=bottom]:data-ending-style:border-t-transparent",
            "data-[side=top]:data-starting-style:rounded-b-none data-[side=top]:data-starting-style:border-b-transparent",
            "data-[side=top]:data-ending-style:rounded-b-none data-[side=top]:data-ending-style:border-b-transparent",
          )}
          {...props}
        >
          <div
            ref={popupRef}
            data-slot="morph-select-content"
            className={cn(
              "relative min-h-0 overflow-hidden p-1",
              "duration-slower ease-standard opacity-100 [filter:blur(0px)] transition-[filter,opacity]",
              "group-data-starting-style/morph:opacity-0 group-data-starting-style/morph:[filter:blur(6px)]",
              "group-data-ending-style/morph:opacity-0 group-data-ending-style/morph:[filter:blur(6px)]",
              "group-data-ending-style/morph:duration-slow",
              className,
            )}
          >
            <MorphSelectScrollUpButton />
            <MorphSelectItemOverlay
              popupRef={popupRef}
              item={highlightedItem}
              className="bg-muted"
            />
            <MorphOverlayContext.Provider value={overlayContext}>
              <Primitive.List
                data-slot="morph-select-list"
                className="relative z-10 max-h-[min(18rem,var(--available-height))] scroll-py-2 overflow-y-auto overscroll-contain py-1"
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

/**
 * The checkmark sits in an absolute slot rather than the item's flex row, so a
 * row gaining or losing it never resizes the popup.
 */
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
        "text-fg relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none",
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
  const overlayContext = React.useContext(MorphOverlayContext);

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

function MorphSelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.ScrollDownArrow>) {
  return (
    <Primitive.ScrollDownArrow
      data-slot="morph-select-scroll-down-button"
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
  MorphSelect,
  MorphSelectContent,
  MorphSelectGroup,
  MorphSelectGroupLabel,
  MorphSelectItem,
  MorphSelectSeparator,
  MorphSelectScrollDownButton,
  MorphSelectScrollUpButton,
  MorphSelectTrigger,
};
