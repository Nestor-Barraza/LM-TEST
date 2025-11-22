import type { MetadataRoute } from 'next';
import sql from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const products = await sql`
    SELECT id, created_at, updated_at
    FROM products
    WHERE is_active = true
    ORDER BY updated_at DESC
  `;

  const categories = await sql`
    SELECT slug, created_at, updated_at
    FROM categories
    ORDER BY updated_at DESC
  `;

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at || product.created_at,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.updated_at || category.created_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    ...productUrls,
    ...categoryUrls,
  ];
}

export const revalidate = 3600;
