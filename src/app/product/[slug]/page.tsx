import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTheme, getStoreInfo } from "@/core/api/store";
import { getProductBySlug } from "@/core/api/product";
import { themeRegistry } from "@/themes/themeRegistry";
import { getStoreName, getRequestContext, getSiteOrigin } from "@/utils/seo";
import { getProductMainImageUrl, getStoreLogoUrl } from "@/utils/imageOptimizer";
import type { Metadata, ResolvingMetadata } from "next";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || '');
  const { tenantSlug, requestOrigin } = await getRequestContext();

  const [storeInfo, product] = await Promise.all([
    getStoreInfo(tenantSlug),
    getProductBySlug(tenantSlug, decodedSlug || resolvedParams.slug),
  ]);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);
  const title = `${product.title} | ${storeName}`;
  const description =
    product.shortDescription ||
    product.description?.substring(0, 160)?.replace(/<[^>]*>?/gm, "") ||
    `Buy ${product.title}`;

  const fallbackImage = storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : "/favicon.ico";
  const imageUrl = product.images?.[0]?.secure_url ? getProductMainImageUrl(product.images[0].secure_url) : fallbackImage;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      product.title,
      product.category,
      product.brand,
      storeName,
      "buy online",
      "ecommerce",
    ]
      .filter(Boolean)
      .join(", "),
    alternates: {
      canonical: `${baseUrl}/product/${resolvedParams.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/product/${resolvedParams.slug}`,
      siteName: storeName,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

import TrackViewItem from "@/components/TrackViewItem";

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || '');
  const { tenantSlug, requestOrigin } = await getRequestContext();

  let themeId = "design-01";
  let product = null;
  let storeInfo = null;
  let themeInfo = null;

  if (tenantSlug !== "main") {
    const [productRes, storeInfoRes, themeRes] = await Promise.all([
      getProductBySlug(tenantSlug, decodedSlug || resolvedParams.slug),
      getStoreInfo(tenantSlug),
      getTheme(tenantSlug),
    ]);
    product = productRes;
    storeInfo = storeInfoRes;
    themeInfo = themeRes;
    if (themeRes && themeRes.themeId && themeRegistry[themeRes.themeId]) {
      themeId = themeRes.themeId;
    }
  }

  if (!product && tenantSlug !== "main") {
    notFound();
  }

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);

  const categoryName = typeof product?.category === 'object'
    ? product.category?.name
    : product?.category || 'All Products';
  const categorySlug = typeof product?.category === 'object'
    ? (product.category?.slug || product.category?._id)
    : product?.category;

  const breadcrumbJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${baseUrl}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryName,
            item: categorySlug ? `${baseUrl}/category/${categorySlug}` : `${baseUrl}/products`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.title,
            item: `${baseUrl}/product/${resolvedParams.slug}`,
          },
        ],
      }
    : null;

  // Build JSON-LD Product structured data for Google rich results
  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description:
          product.shortDescription ||
          product.description?.replace(/<[^>]*>?/gm, "") ||
          product.title,
        image:
          product.images?.map((img: any) => getProductMainImageUrl(img.secure_url)).filter(Boolean) ||
          [],
        sku: product.sku || product._id,
        brand: product.brand
          ? {
              "@type": "Brand",
              name: product.brand,
            }
          : undefined,
        offers: {
          "@type": "Offer",
          url: `${baseUrl}/product/${resolvedParams.slug}`,
          priceCurrency: storeInfo?.currency || "BDT",
          price: product.salePrice ?? product.price ?? 0,
          availability:
            (product.stock ?? 1) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: storeName,
          },
        },
      }
    : null;

  const primaryImageUrl = product?.images?.[0]?.secure_url || product?.image?.secure_url || (typeof product?.image === "string" ? product.image : null);

  const ThemeProduct =
    themeRegistry[themeId]?.Product || themeRegistry["design-01"].Product;

  return (
    <>
      {primaryImageUrl && (
        <link
          rel="preload"
          as="image"
          href={getProductMainImageUrl(primaryImageUrl)}
          fetchPriority="high"
        />
      )}

      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ThemeProduct
        tenantSlug={tenantSlug}
        params={params}
        initialProduct={product}
        initialStoreInfo={storeInfo}
        initialTheme={themeInfo}
      />
    </>
  );
}
