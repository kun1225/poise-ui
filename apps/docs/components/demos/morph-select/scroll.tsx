import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
} from "@poise-ui/react/morph-select";

const cities = [
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

export function MorphSelectScrollDemo() {
  return (
    <MorphSelect defaultValue="Taipei">
      <MorphSelectTrigger
        className="w-full max-w-52"
        placeholder="Pick a city"
      />

      <MorphSelectContent>
        {cities.map((city) => (
          <MorphSelectItem key={city} value={city}>
            {city}
          </MorphSelectItem>
        ))}
      </MorphSelectContent>
    </MorphSelect>
  );
}
