import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@poise-ui/react/select";

export function SelectPlacementDemo() {
  return (
    <Select defaultValue="top">
      <SelectTrigger className="w-full max-w-52" />

      <SelectContent side="top" align="end" sideOffset={12}>
        <SelectItem value="top">Opens upwards</SelectItem>
        <SelectItem value="end">Lined up on the right</SelectItem>
        <SelectItem value="offset">Held 12px clear</SelectItem>
      </SelectContent>
    </Select>
  );
}
