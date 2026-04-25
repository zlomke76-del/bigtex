import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoProblemPage } from "../../components/SeoProblemPage";
import { getSeoPage, seoPages, siteUrl } from "../../seo-content";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    return {
      title: "Houston Pool Supply Help | Big Tex Pool Supplies",
      description:
        "Get fast help identifying pool parts, chemicals, and equipment issues in Houston.",
    };
  }

  const canonical = `${siteUrl()}/houston/${page.slug}`;

  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: canonical,
      type: "website",
      locale: "en_US",
      siteName: "Big Tex Pool Supplies",
    },
  };
}

export default async function HoustonSeoPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSeoPage(slug);

  if (!page) {
    notFound();
  }

  return <SeoProblemPage page={page} />;
}
