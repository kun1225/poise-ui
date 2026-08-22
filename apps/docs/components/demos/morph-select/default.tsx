import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
} from "@poise-ui/react/morph-select";

export function MorphSelectDemo() {
  return (
    <MorphSelect>
      <MorphSelectTrigger
        className="w-full max-w-52"
        placeholder="Pick a spring"
      />

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
