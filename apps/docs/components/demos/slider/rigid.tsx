import { Slider, SliderLabel, SliderValue } from "@poise-ui/react/slider";

export function SliderRigidDemo() {
  return (
    <Slider className="w-xs" defaultValue={24} min={0} max={40} elastic={false}>
      <SliderLabel>Corner Radius</SliderLabel>
      <SliderValue />
    </Slider>
  );
}
