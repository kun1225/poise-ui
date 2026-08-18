import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@poise-ui/react/select";

const weights = [
  "Thin",
  "Extra light",
  "Light",
  "Regular",
  "Medium",
  "Semibold",
  "Bold",
  "Black",
];

export function SelectAlignItemDemo() {
  return (
    <Select defaultValue="Medium">
      <SelectTrigger className="w-full max-w-52" />

      <SelectContent alignItemWithTrigger>
        {weights.map((weight) => (
          <SelectItem key={weight} value={weight}>
            {weight}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
