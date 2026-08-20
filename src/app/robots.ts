import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block internal/private routes from being indexed
        disallow: [
          "/dashboard",
          "/dashboard/",
          "/api/",
          "/onboarding",
          "/onboarding/",
        ],
      },
    ],
    sitemap: "https://violink.space/sitemap.xml",
  };
}
