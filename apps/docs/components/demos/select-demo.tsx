import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@poise-ui/react/select";

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-full max-w-48" placeholder="Pick a spring" />

      <SelectContent>
        <SelectItem value="snappy">Snappy</SelectItem>
        <SelectItem value="smooth">Smooth</SelectItem>
        <SelectItem value="bouncy">Bouncy</SelectItem>
      </SelectContent>
    </Select>
  );
}
