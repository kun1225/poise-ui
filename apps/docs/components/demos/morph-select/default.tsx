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
        <MorphSelectItem value="snappy">Snappy</MorphSelectItem>
        <MorphSelectItem value="smooth">Smooth</MorphSelectItem>
        <MorphSelectItem value="bouncy">Bouncy</MorphSelectItem>
      </MorphSelectContent>
    </MorphSelect>
  );
}
