import { Slider, SliderLabel, SliderValue } from "@poise-ui/react/slider";

export function SliderDemo() {
  return (
    <Slider className="w-xs" defaultValue={24} min={0} max={40}>
      <SliderLabel>Value</SliderLabel>
      <SliderValue />
    </Slider>
  );
}
