import { Slider, SliderLabel, SliderValue } from "@poise-ui/react/slider";

export function SliderTwoDemo() {
  return (
    <Slider className="w-xs" defaultValue={[0, 24]} min={0} max={40}>
      <SliderLabel>Value</SliderLabel>
      <SliderValue />
    </Slider>
  );
}
