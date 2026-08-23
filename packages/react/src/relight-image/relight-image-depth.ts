import {
  DataTexture,
  DataUtils,
  HalfFloatType,
  LinearFilter,
  RedFormat,
} from "three/webgpu";

const TOLERANCE = 1.5 / 255;
const SMOOTH_RADIUS = 2;
const WORKING_WIDTH = 1024;

export type DepthField = {
  values: Float32Array;
  width: number;
  height: number;
};

function blurAxis(
  source: Float32Array,
  target: Float32Array,
  { width, height, radius }: Omit<DepthField, "values"> & { radius: number },
) {
  const span = radius * 2 + 1;

  for (let row = 0; row < height; row++) {
    const offset = row * width;
    let sum = source[offset]! * radius;

    for (let column = 0; column <= radius; column++) {
      sum += source[offset + Math.min(column, width - 1)]!;
    }

    for (let column = 0; column < width; column++) {
      target[column * height + row] = sum / span;
      sum -= source[offset + Math.max(column - radius, 0)]!;
      sum += source[offset + Math.min(column + radius + 1, width - 1)]!;
    }
  }
}

function boxBlur(field: DepthField, radius: number) {
  if (radius < 1) return;

  const transposed = new Float32Array(field.values.length);
  blurAxis(field.values, transposed, {
    width: field.width,
    height: field.height,
    radius,
  });
  blurAxis(transposed, field.values, {
    width: field.height,
    height: field.width,
    radius,
  });
}

export function smoothBands(field: DepthField, radius: number) {
  const original = field.values.slice();
  boxBlur(field, radius);

  for (let index = 0; index < field.values.length; index++) {
    field.values[index] = Math.min(
      Math.max(field.values[index]!, original[index]! - TOLERANCE),
      original[index]! + TOLERANCE,
    );
  }

  boxBlur(field, SMOOTH_RADIUS);
}

type DepthImage = CanvasImageSource & { width: number; height: number };

export function createSmoothDepthTexture(
  image: DepthImage,
  smoothingPercent: number,
) {
  const scale = Math.min(1, WORKING_WIDTH / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("RelightImage could not create a 2D canvas context.");
  }

  canvas.width = width;
  canvas.height = height;
  context.setTransform(1, 0, 0, -1, 0, height);
  context.drawImage(image, 0, 0, width, height);

  const pixels = context.getImageData(0, 0, width, height).data;
  const field: DepthField = {
    values: new Float32Array(width * height),
    width,
    height,
  };

  for (let index = 0; index < field.values.length; index++) {
    field.values[index] = pixels[index * 4]! / 255;
  }

  smoothBands(
    field,
    Math.round((Math.max(0, smoothingPercent) / 100) * width),
  );

  const halfFloats = new Uint16Array(field.values.length);
  for (let index = 0; index < halfFloats.length; index++) {
    halfFloats[index] = DataUtils.toHalfFloat(field.values[index]!);
  }

  const texture = new DataTexture(
    halfFloats,
    width,
    height,
    RedFormat,
    HalfFloatType,
  );
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  return texture;
}
