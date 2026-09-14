import { DuoTiltDemo } from "@/components/lab/duo-tilt/duo-tilt-demo";

export default function DuoTiltPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Duo tilt</h1>
      <p className="text-muted-fg mt-2">
        Reverse-engineered from{" "}
        <a
          href="https://solotilt.com"
          className="underline underline-offset-4"
          target="_blank"
          rel="noreferrer"
        >
          solotilt.com
        </a>
        : gravity drives a fold angle, which drives a perspective remap and a
        depth-of-field blur. Two renderers, same input - CSS 3D transforms vs. a
        WebGL2 shader.
      </p>
      <div className="mt-8">
        <DuoTiltDemo />
      </div>
    </div>
  );
}
