import type { MetadataRoute } from "next";
import { seoPages, siteUrl } from "./seo-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl();
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/houston`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...seoPages.map((page) => ({
      url: `${baseUrl}/houston/${page.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: page.category === "commercial" ? 0.88 : 0.82,
    })),
  ];
}
