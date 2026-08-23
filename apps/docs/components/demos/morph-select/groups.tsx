import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectGroup,
  MorphSelectGroupLabel,
  MorphSelectItem,
  MorphSelectSeparator,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@poise-ui/react/morph-select";

export function MorphSelectGroupsDemo() {
  return (
    <MorphSelect>
      <MorphSelectTrigger className="max-w-52">
        <MorphSelectValue placeholder="Pick a spring" className="capitalize" />
      </MorphSelectTrigger>

      <MorphSelectContent>
        <MorphSelectGroup>
          <MorphSelectGroupLabel>Springs</MorphSelectGroupLabel>
          <MorphSelectItem value="snappy">Snappy</MorphSelectItem>
          <MorphSelectItem value="smooth">Smooth</MorphSelectItem>
          <MorphSelectItem value="bouncy">Bouncy</MorphSelectItem>
        </MorphSelectGroup>

        <MorphSelectSeparator />

        <MorphSelectGroup>
          <MorphSelectGroupLabel>Curves</MorphSelectGroupLabel>
          <MorphSelectItem value="standard">Standard</MorphSelectItem>
          <MorphSelectItem value="out-expo">Out expo</MorphSelectItem>
          <MorphSelectItem value="out-back" disabled>
            Out back
          </MorphSelectItem>
        </MorphSelectGroup>
      </MorphSelectContent>
    </MorphSelect>
  );
}
