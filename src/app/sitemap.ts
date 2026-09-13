import { storefrontFetch } from "../utils/storefrontFetch";
import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  // Use https in production, http in local development
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  if (tenantSlug === 'main') {
    return sitemapEntries;
  }

  try {
    // Fetch categories
    const categoriesRes = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/categories`, { next: { revalidate: 3600 } });
    if (categoriesRes.ok) {
      const categoriesJson = await categoriesRes.json();
      const categories = categoriesJson.data || [];
      
      categories.forEach((category: any) => {
        sitemapEntries.push({
          url: `${baseUrl}/category/${category.slug || category._id}`,
          lastModified: new Date(category.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });
    }

    // Fetch products (using a high limit to get all for sitemap)
    const productsRes = await storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?limit=1000`, { next: { revalidate: 3600 } });
    if (productsRes.ok) {
      const productsJson = await productsRes.json();
      const products = productsJson.data || [];
      
      products.forEach((product: any) => {
        sitemapEntries.push({
          url: `${baseUrl}/product/${product.slug || product._id}`,
          lastModified: new Date(product.updatedAt || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemapEntries;
}
