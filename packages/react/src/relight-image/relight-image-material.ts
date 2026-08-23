import {
  float,
  Fn,
  int,
  Loop,
  luminance,
  modelScale,
  positionWorld,
  screenSize,
  screenUV,
  texture,
  uniform,
  vec2,
  vec3,
} from "three/tsl";
import {
  MeshPhongNodeMaterial,
  type DataTexture,
  type Node,
  type Texture,
  type Vector3,
} from "three/webgpu";

export type RelightImageSettings = {
  lightColor: string;
  lightIntensity: number;
  lightElevation: number;
  ambientIntensity: number;
  depthSmoothing: number;
  depthStrength: number;
  normalStrength: number;
  detailStrength: number;
  shadowStrength: number;
  shadowSoftness: number;
};

export const defaultRelightImageSettings: RelightImageSettings = {
  lightColor: "#e1ded1",
  lightIntensity: 2.35,
  lightElevation: 0.9,
  ambientIntensity: 0.3,
  depthSmoothing: 1.3,
  depthStrength: 4,
  normalStrength: 3,
  detailStrength: 3,
  shadowStrength: 0.86,
  shadowSoftness: 0.092,
};

const DETAIL_GAIN = 4;
const DETAIL_LOD = 3;
const DETAIL_STEP_TEXELS = 8;
const GRADIENT_TEXELS = 3;
const MIN_LIGHT_ANGLE = 0.15;
const SHADOW_STEPS = 12;
const SOFTNESS_GROWTH = 3;

export function createRelightMaterial({
  map,
  depthMap,
  smoothDepthMap,
  lightPosition,
  settings,
}: {
  map: Texture;
  depthMap: Texture;
  smoothDepthMap: DataTexture;
  lightPosition: Vector3;
  settings: RelightImageSettings;
}) {
  const mapNode = texture(map);
  const depthNode = texture(depthMap);
  const smoothDepthNode = texture(smoothDepthMap);
  const displacement = uniform(settings.depthStrength);
  const normalStrength = uniform(settings.normalStrength);
  const detailStrength = uniform(settings.detailStrength);
  const shadowStrength = uniform(settings.shadowStrength);
  const shadowSoftness = uniform(settings.shadowSoftness);
  const lightPositionNode = uniform(lightPosition);

  const viewAspect = screenSize.x.div(screenSize.y);
  const mapSize = vec2(mapNode.size(int(0)) as Node<"ivec2">);
  const imageAspect = mapSize.x.div(mapSize.y);
  const coverScale = imageAspect
    .greaterThan(viewAspect)
    .select(
      vec2(viewAspect.div(imageAspect), 1),
      vec2(1, imageAspect.div(viewAspect)),
    );
  const uv = screenUV.flipY().sub(0.5).mul(coverScale).add(0.5);
  const depth = depthNode.sample(uv).r;
  const depthStep = vec2(GRADIENT_TEXELS).div(
    vec2(smoothDepthNode.size(int(0)) as Node<"ivec2">),
  );
  const depthAlongX = vec2(depthStep.x, 0);
  const depthAlongY = vec2(0, depthStep.y);
  const depthSlope = vec2(
    smoothDepthNode
      .sample(uv.add(depthAlongX))
      .r.sub(smoothDepthNode.sample(uv.sub(depthAlongX)).r),
    smoothDepthNode
      .sample(uv.add(depthAlongY))
      .r.sub(smoothDepthNode.sample(uv.sub(depthAlongY)).r),
  ).mul(0.5);
  const slope = depthSlope
    .mul(coverScale)
    .div(depthStep.mul(modelScale.xy))
    .mul(displacement)
    .mul(normalStrength);

  const detailStep = vec2(DETAIL_STEP_TEXELS).div(mapSize);
  const detailAlongX = vec2(detailStep.x, 0);
  const detailAlongY = vec2(0, detailStep.y);
  const detail = vec2(
    luminance(
      mapNode.sample(uv.add(detailAlongX)).level(float(DETAIL_LOD)).rgb,
    ).sub(
      luminance(
        mapNode.sample(uv.sub(detailAlongX)).level(float(DETAIL_LOD)).rgb,
      ),
    ),
    luminance(
      mapNode.sample(uv.add(detailAlongY)).level(float(DETAIL_LOD)).rgb,
    ).sub(
      luminance(
        mapNode.sample(uv.sub(detailAlongY)).level(float(DETAIL_LOD)).rgb,
      ),
    ),
  )
    .mul(0.5)
    .mul(detailStrength)
    .mul(DETAIL_GAIN);
  const normal = vec3(slope.x.negate(), slope.y.negate(), float(1))
    .add(vec3(detail.x.negate(), detail.y.negate(), 0))
    .normalize();

  const shadow = Fn(() => {
    const surfacePosition = vec3(
      positionWorld.xy,
      depth.sub(1).mul(displacement),
    );
    const surfaceToLight = lightPositionNode.sub(surfacePosition);
    const lightDirection = surfaceToLight.div(
      surfaceToLight.length().max(0.001),
    );
    const surfaceDepth = smoothDepthNode.sample(uv).r;
    const remainingDepth = surfaceDepth.oneMinus();
    const rayOffset = lightDirection.xy
      .div(lightDirection.z.max(MIN_LIGHT_ANGLE))
      .mul(displacement)
      .mul(coverScale)
      .div(modelScale.xy)
      .mul(remainingDepth);
    const maxOcclusion = float(0).toVar();

    Loop(SHADOW_STEPS, ({ i }) => {
      const progress = float(i).add(1).div(SHADOW_STEPS);
      const rayDepth = surfaceDepth.add(remainingDepth.mul(progress));
      const blockerDepth = smoothDepthNode.sample(
        uv.add(rayOffset.mul(progress)),
      ).r;
      const softness = shadowSoftness.mul(progress.mul(SOFTNESS_GROWTH).add(1));
      const occlusion = blockerDepth.sub(rayDepth).div(softness).clamp(0, 1);

      maxOcclusion.assign(maxOcclusion.max(occlusion));
    });

    return maxOcclusion
      .mul(shadowStrength)
      .mul(lightDirection.z.greaterThan(0).select(1, 0))
      .oneMinus();
  })();

  const material = new MeshPhongNodeMaterial({ specular: 0x000000 });
  material.colorNode = mapNode.sample(uv).rgb;
  material.normalNode = normal;
  material.aoNode = shadow;

  return material;
}
