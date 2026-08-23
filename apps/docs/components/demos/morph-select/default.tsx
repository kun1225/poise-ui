import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@poise-ui/react/morph-select";

export function MorphSelectDemo() {
  return (
    <MorphSelect>
      <MorphSelectTrigger className="w-full max-w-52">
        <MorphSelectValue placeholder="Pick a spring" className="capitalize" />
      </MorphSelectTrigger>

      <MorphSelectContent>
        <MorphSelectItem value="snappy">
          Snappy — buttons and toggles
        </MorphSelectItem>
        <MorphSelectItem value="smooth">
          Smooth — panels and popovers
        </MorphSelectItem>
        <MorphSelectItem value="bouncy">
          Bouncy — deliberate overshoot
        </MorphSelectItem>
      </MorphSelectContent>
    </MorphSelect>
  );
}
