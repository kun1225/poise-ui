import { Slider, SliderLabel, SliderValue } from "@poise-ui/react/slider";

export function SliderStepsDemo() {
  return (
    <Slider
      className="w-xs"
      defaultValue={60}
      min={0}
      max={100}
      step={5}
      format={{ style: "unit", unit: "percent" }}
    >
      <SliderLabel>Opacity</SliderLabel>
      <SliderValue />
    </Slider>
  );
}
