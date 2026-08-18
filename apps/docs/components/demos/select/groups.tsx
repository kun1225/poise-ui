import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@poise-ui/react/select";

export function SelectGroupsDemo() {
  return (
    <Select>
      <SelectTrigger className="min-w-52" placeholder="Pick an easing" />
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Springs</SelectGroupLabel>
          <SelectItem value="snappy">Snappy</SelectItem>
          <SelectItem value="smooth">Smooth</SelectItem>
          <SelectItem value="bouncy">Bouncy</SelectItem>
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectGroupLabel>Curves</SelectGroupLabel>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="out-expo">Out expo</SelectItem>
          <SelectItem value="out-back" disabled>
            Out back
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
