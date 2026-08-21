import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
} from "@poise-ui/react/morph-select";

export function MorphSelectSideDemo() {
  return (
    <MorphSelect defaultValue="top">
      <MorphSelectTrigger className="w-full max-w-52" />

      <MorphSelectContent side="top">
        <MorphSelectItem value="top">Grows upwards</MorphSelectItem>
        <MorphSelectItem value="seam">Welded on top</MorphSelectItem>
        <MorphSelectItem value="flip">Flips if space runs out</MorphSelectItem>
      </MorphSelectContent>
    </MorphSelect>
  );
}
