import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  let produkList = [];
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("produk").select("id, created_at");
    produkList = data || [];
  } catch {
    // Abaikan jika database error
  }

  const produkUrls = produkList.map((item) => ({
    url: `${baseUrl}/produk/${item.id}`,
    lastModified: item.created_at ? new Date(item.created_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tentang`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/favorit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...produkUrls,
  ];
}

