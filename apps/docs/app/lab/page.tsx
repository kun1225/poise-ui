import Link from "next/link";

/** Not linked from the site nav - unlisted, share links by hand. */
const EXPERIMENTS = [
  {
    href: "/lab/duo-tilt",
    title: "Duo tilt",
    description: "iPhone-fold-style motion parallax, tilt or drag driven.",
  },
];

export default function LabPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Lab</h1>
      <p className="text-muted-fg mt-2">
        Experiments that haven&apos;t earned a place in the component library
        yet.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {EXPERIMENTS.map((experiment) => (
          <li key={experiment.href}>
            <Link
              href={experiment.href}
              className="border-border hover:border-accent block rounded-xl border p-5 transition-colors"
            >
              <div className="font-medium">{experiment.title}</div>
              <p className="text-muted-fg mt-1 text-sm">
                {experiment.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
