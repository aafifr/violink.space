import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE = "https://violink.space";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all public profile slugs from DB
  const profiles = await prisma.profile.findMany({
    select: { slug: true, updatedAt: true },
    where:  { slug: { not: "" } },
  });

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             BASE,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        1,
    },
    {
      url:             `${BASE}/login`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
  ];

  // Dynamic public profile pages (one URL per user)
  const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
    url:             `${BASE}/${p.slug}`,
    lastModified:    p.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  return [...staticRoutes, ...profileRoutes];
}
