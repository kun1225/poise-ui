import type { BlurConfig } from "../blur-config";
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${log}`);
  }
  return program;
}

const UNIFORM_NAMES = [
  "u_image",
  "u_imageSize",
  "u_coverScale",
  "u_turn",
  "u_phase",
  "u_blurAngle",
  "u_blurSpread",
  "u_blackGradient",
] as const;

type UniformName = (typeof UNIFORM_NAMES)[number];

/** WebGL renderer for the fold image and effects. */
export class DuoTiltRenderer {
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private texture: WebGLTexture | null = null;
  private uniforms = new Map<UniformName, WebGLUniformLocation | null>();
  private coverScale: [number, number] = [1, 1];
  private disposed = false;
  private onContextLost = (event: Event) => {
    event.preventDefault();
  };
  private onContextRestored = () => {
    if (!this.disposed) this.setup();
  };

  constructor(private canvas: HTMLCanvasElement) {
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    this.setup();
  }

  private setup() {
    const gl = this.canvas.getContext("webgl2", {
      antialias: true,
      alpha: false,
    });
    if (!gl) {
      console.warn("[duo-tilt] WebGL2 is not available in this browser.");
      return;
    }
    this.gl = gl;
    this.program = createProgram(gl);
    this.vao = gl.createVertexArray();
    this.texture = gl.createTexture();

    for (const name of UNIFORM_NAMES) {
      this.uniforms.set(name, gl.getUniformLocation(this.program, name));
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  get ready() {
    return this.gl !== null;
  }

  async setImage(src: string) {
    const gl = this.gl;
    if (!gl || !this.texture) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    });
    if (this.disposed) return;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    const canvasAspect = this.canvas.width / Math.max(this.canvas.height, 1);
    const imageAspect = image.naturalWidth / Math.max(image.naturalHeight, 1);
    this.coverScale =
      imageAspect > canvasAspect
        ? [canvasAspect / imageAspect, 1]
        : [1, imageAspect / canvasAspect];
  }

  resize(cssWidth: number, cssHeight: number, pixelRatio: number) {
    const width = Math.max(1, Math.round(cssWidth * pixelRatio));
    const height = Math.max(1, Math.round(cssHeight * pixelRatio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl?.viewport(0, 0, width, height);
    }
  }

  draw(angleDeg: number, config: BlurConfig) {
    const gl = this.gl;
    if (!gl || !this.program || !this.vao) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const turn = Math.min(Math.abs(angleDeg) / 180, 1);
    const phase = angleDeg >= 0 ? 1 : 0;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    const u = (name: UniformName) => this.uniforms.get(name) ?? null;
    gl.uniform1i(u("u_image"), 0);
    gl.uniform2f(u("u_imageSize"), width, height);
    gl.uniform2f(u("u_coverScale"), this.coverScale[0], this.coverScale[1]);
    gl.uniform1f(u("u_turn"), turn);
    gl.uniform1f(u("u_phase"), phase);
    gl.uniform3f(
      u("u_blurAngle"),
      config.strength,
      config.fullAngle,
      config.anglePower,
    );
    gl.uniform3f(
      u("u_blurSpread"),
      config.fullDistance,
      config.distancePower,
      config.edgeBlur,
    );
    gl.uniform3f(
      u("u_blackGradient"),
      config.gradientOpacity,
      config.gradientStart,
      config.gradientEnd,
    );

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    this.disposed = true;
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.canvas.removeEventListener(
      "webglcontextrestored",
      this.onContextRestored,
    );
    const gl = this.gl;
    if (!gl) return;
    if (this.program) gl.deleteProgram(this.program);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.texture) gl.deleteTexture(this.texture);
    this.gl = null;
  }
}
