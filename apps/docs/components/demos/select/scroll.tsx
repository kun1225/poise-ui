import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@poise-ui/react/select";

const timezones = [
  "Anchorage",
  "Auckland",
  "Bangkok",
  "Berlin",
  "Chicago",
  "Denver",
  "Dubai",
  "Kolkata",
  "Lagos",
  "London",
  "Los Angeles",
  "Mexico City",
  "New York",
  "Paris",
  "São Paulo",
  "Seoul",
  "Sydney",
  "Taipei",
  "Tokyo",
  "Toronto",
];

export function SelectScrollDemo() {
  return (
    <Select defaultValue="Taipei">
      <SelectTrigger className="w-full max-w-52" placeholder="Pick a city" />

      <SelectContent>
        {timezones.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
