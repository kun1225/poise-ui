import { RelightImage } from "@poise-ui/react/relight-image";

export function RelightImageDemo() {
  return (
    <RelightImage
      src="/images/relight-image/example.jpg"
      depthSrc="/images/relight-image/example-depth.webp"
      alt="A marble sculpture of a mother holding two children"
      className="aspect-3/2 w-full max-w-2xl rounded-xl"
      settings={{
        lightColor: "#e7dcd0",
        lightIntensity: 10.1,
        lightElevation: 1.97,
        ambientIntensity: 0.02,
        depthSmoothing: 0.5,
        depthStrength: 1.9,
        normalStrength: 2.16,
        detailStrength: 0.7,
        shadowSoftness: 0.152,
      }}
    />
  );
}
