/** Fragment shader for depth-of-field and fold lighting effects. */

/** No attributes: a fullscreen triangle generated from gl_VertexID. */
export const VERTEX_SHADER = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 p = pos[gl_VertexID];
  v_uv = (p + 1.0) * 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_imageSize;
uniform vec2 u_coverScale;
uniform float u_turn;
uniform float u_phase;
uniform vec3 u_blurAngle;
uniform vec3 u_blurSpread;
uniform vec3 u_blackGradient;
in vec2 v_uv;
out vec4 outColor;

vec2 imageCoordinates(vec2 uv) {
  return vec2(0.5) + (uv - vec2(0.5)) * u_coverScale;
}

void main() {
  float turn = clamp(u_turn, 0.0, 1.0);
  vec2 uv = imageCoordinates(v_uv);
  if (turn <= 0.00001) {
    outColor = vec4(textureLod(u_image, uv, 0.0).rgb, 1.0);
    return;
  }

  float outer = step(0.5, u_phase);
  float hinge = mix(1.0, 0.0, outer);
  float fromHinge = abs(v_uv.x - hinge);
  float tilt = turn * 1.570796327;
  float sine = sin(tilt);

  float blurAngle = pow(smoothstep(0.0, radians(u_blurAngle.y), tilt), u_blurAngle.z);
  float blurSpread = pow(smoothstep(0.0, u_blurSpread.x, fromHinge), u_blurSpread.y);
  float defocus = blurAngle * mix(u_blurSpread.z, 1.0, blurSpread);
  float sigma = u_imageSize.x * u_blurAngle.x * defocus;
  float lod = max(0.0, log2(max(sigma, 1.0)));

  vec3 content = textureLod(u_image, uv, lod).rgb;

  float glass = sine * pow(fromHinge, 1.6);
  content *= 1.0 - mix(0.28, 0.06, outer) * glass;

  float reflection = exp(-pow((fromHinge - 0.70) / 0.30, 2.0)) * sine;
  content += vec3(0.82, 0.85, 0.86) * reflection * 0.06;

  float blackFade = clamp((fromHinge - u_blackGradient.y) / max(u_blackGradient.z - u_blackGradient.y, 0.001), 0.0, 1.0);
  content *= 1.0 - u_blackGradient.x * blurAngle * blackFade;

  outColor = vec4(content, 1.0);
}
`;
