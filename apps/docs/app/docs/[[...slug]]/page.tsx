import { notFound } from "next/navigation";

import { mdxComponents } from "@/mdx-components";
import { source } from "@/lib/source";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article className="prose">
      <h1>{page.data.title}</h1>
      {page.data.description ? (
        <p className="text-muted-fg">{page.data.description}</p>
      ) : null}
      <MDX components={mdxComponents} />
    </article>
  );
}
