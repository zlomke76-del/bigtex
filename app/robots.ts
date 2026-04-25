import type { MetadataRoute } from "next";
import { siteUrl } from "./seo-content";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
