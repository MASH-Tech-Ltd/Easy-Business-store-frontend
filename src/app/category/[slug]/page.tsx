import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getStoreLogoUrl, getCategoryCardImageUrl, getProductCardImageUrl } from '@/utils/imageOptimizer';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { getCategories } from '@/core/api/category';
import { getProducts } from '@/core/api/product';
import { themeRegistry } from '@/themes/themeRegistry';
import { getStoreName, getRequestContext, getSiteOrigin } from '@/utils/seo';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || '');
  const { tenantSlug, requestOrigin } = await getRequestContext();

  const [storeInfo, categories] = await Promise.all([
    getStoreInfo(tenantSlug),
    getCategories(tenantSlug),
  ]);

  const category = categories?.find(
    (c: any) =>
      c.slug === decodedSlug ||
      c.slug === resolvedParams.slug ||
      c._id === decodedSlug ||
      c._id === resolvedParams.slug
  );

  if (!category && tenantSlug !== 'main') {
    return {
      title: 'Category Not Found',
      robots: { index: false, follow: false },
    };
  }

  const categoryName = category?.name
    ? category.name
    : decodedSlug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);

  // Fetch products in this category to calculate dynamic price range for rich results
  const products = await getProducts(
    tenantSlug,
    `category=${category?._id || decodedSlug}&limit=20`
  );
  const prices = products
    .map((p: any) => p.salePrice ?? p.price)
    .filter((pr: any) => typeof pr === 'number' && pr > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const isBengali =
    /[\u0980-\u09FF]/.test(categoryName) || storeInfo?.language === 'bn';

  // Dynamic language-sensitive SEO titles and descriptions
  const priceText =
    minPrice > 0
      ? isBengali
        ? ` দাম শুরু ৳${minPrice.toLocaleString()}${maxPrice > minPrice ? ` থেকে ৳${maxPrice.toLocaleString()}` : ''}।`
        : ` Prices start from ৳${minPrice.toLocaleString()}${maxPrice > minPrice ? ` to ৳${maxPrice.toLocaleString()}` : ''}.`
      : '';

  const title = isBengali
    ? `${categoryName} - সেরা কালেকশন ও দাম | ${storeName}`
    : `${categoryName} - Buy Online at Best Price | ${storeName}`;

  const description =
    category?.description ||
    (isBengali
      ? `সেরা মানের ${categoryName} কিনুন ${storeName} থেকে।${priceText} সারাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি সুবিধা।`
      : `Shop the latest collection of ${categoryName} online at ${storeName}.${priceText} genuine products with fast delivery across Bangladesh.`);

  const ogImage =
    getCategoryCardImageUrl(category?.image?.secure_url || category?.image) ||
    (storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : null);

  const canonicalPath = `/category/${encodeURIComponent(category?.slug || decodedSlug)}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const keywords = isBengali
    ? [
        categoryName,
        `${categoryName} এর দাম`,
        `${categoryName} কালেকশন`,
        `${categoryName} কিনুন`,
        storeName,
        'অনলাইন শপিং',
        'বাংলাদেশ',
      ].join(', ')
    : [
        categoryName,
        `buy ${categoryName}`,
        `${categoryName} price in BD`,
        `${categoryName} online`,
        `${categoryName} Bangladesh`,
        storeName,
        'online shopping',
      ].join(', ');

  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    category: categoryName,
    classification: 'eCommerce, Shopping',
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: storeName,
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: categoryName,
            },
          ]
        : [],
      locale: isBengali ? 'bn_BD' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    other: {
      'product:category': categoryName,
      ...(minPrice > 0 ? { 'og:price:amount': String(minPrice) } : {}),
      'og:price:currency': storeInfo?.currency || 'BDT',
      'og:locale:alternate': isBengali ? 'en_US' : 'bn_BD',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug || '');
  const { tenantSlug, requestOrigin } = await getRequestContext();

  let themeId = 'design-01';
  let storeInfo = null;
  let categories: any[] = [];
  let category: any = null;
  let products: any[] = [];

  if (tenantSlug !== 'main') {
    const [themeRes, storeInfoRes, catRes] = await Promise.all([
      getTheme(tenantSlug),
      getStoreInfo(tenantSlug),
      getCategories(tenantSlug),
    ]);
    if (themeRes?.themeId && themeRegistry[themeRes.themeId]) {
      themeId = themeRes.themeId;
    }
    storeInfo = storeInfoRes;
    categories = catRes || [];
    category = categories.find(
      (c: any) =>
        c.slug === decodedSlug ||
        c.slug === resolvedParams.slug ||
        c._id === decodedSlug ||
        c._id === resolvedParams.slug
    );
    if (category?._id || decodedSlug) {
      products = await getProducts(
        tenantSlug,
        `category=${category?._id || decodedSlug}&limit=20`
      );
    }
  }

  if (!category && tenantSlug !== 'main') {
    notFound();
  }

  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);
  const categoryName = category?.name
    ? category.name
    : decodedSlug
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

  const prices = products
    .map((p: any) => p.salePrice ?? p.price)
    .filter((pr: any) => typeof pr === 'number' && pr > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const canonicalPath = `/category/${encodeURIComponent(category?.slug || decodedSlug)}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const isBengali =
    /[\u0980-\u09FF]/.test(categoryName) || storeInfo?.language === 'bn';
  const collectionTitle = isBengali
    ? `${categoryName} - সেরা কালেকশন ও দাম | ${storeName}`
    : `${categoryName} Price in Bangladesh | ${storeName}`;
  const collectionDesc =
    category?.description ||
    (isBengali
      ? `সেরা মানের ${categoryName} কিনুন ${storeName} থেকে।${minPrice > 0 ? ` দাম শুরু ৳${minPrice.toLocaleString()} থেকে।` : ''}`
      : `Shop authentic ${categoryName} online at ${storeName}.${minPrice > 0 ? ` Prices starting from BDT ${minPrice.toLocaleString()}.` : ''}`);

  // BreadcrumbList JSON-LD for Google Sitelinks / Category path
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: `${baseUrl}/categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: canonicalUrl,
      },
    ],
  };

  // Currency symbol and code
  const currencyCode = storeInfo?.currency || 'BDT';

  // CollectionPage JSON-LD with Product Offers in ItemList for Google Merchant Carousels
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collectionTitle,
    description: collectionDesc,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      name: categoryName,
      numberOfItems: products.length,
      itemListElement: products.slice(0, 15).map((prod: any, idx: number) => {
        const prodPrice = Number(prod.salePrice ?? prod.discountedPrice ?? prod.price ?? 0);
        const prodImg = getProductCardImageUrl(prod.images?.[0]?.secure_url || prod.images?.[0]) || (storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : undefined);
        const prodUrl = `${baseUrl}/product/${encodeURIComponent(prod.slug || prod._id)}`;

        return {
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: prod.title,
            description: prod.shortDescription || prod.title,
            image: prodImg ? [prodImg] : undefined,
            url: prodUrl,
            offers: {
              '@type': 'Offer',
              price: prodPrice > 0 ? prodPrice : undefined,
              priceCurrency: currencyCode,
              availability:
                prod.stock > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              url: prodUrl,
              seller: {
                '@type': 'Organization',
                name: storeName,
              },
            },
          },
        };
      }),
    },
    ...(minPrice > 0
      ? {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice: minPrice,
            highPrice: maxPrice,
            priceCurrency: currencyCode,
            offerCount: products.length,
          },
        }
      : {}),
  };

  // OnlineStore Organization JSON-LD
  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: storeName,
    url: baseUrl,
    logo: storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : undefined,
    description: storeInfo?.description || `${storeName} official online store`,
    currenciesAccepted: currencyCode,
    paymentAccepted: 'Cash on Delivery, Digital Payment, bKash, Nagad',
    areaServed: 'Bangladesh',
  };

  // Dynamic FAQPage JSON-LD (triggers rich expandable Q&A in Google Search results)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: isBengali
      ? [
          {
            '@type': 'Question',
            name: `${storeName} থেকে ${categoryName} কীভাবে কিনবেন?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `খুব সহজেই ${storeName} ওয়েবসাইট থেকে আপনার পছন্দের ${categoryName} কার্টে যুক্ত করে নাম, ঠিকানা ও ফোন নম্বর দিয়ে ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারেন।`,
            },
          },
          ...(minPrice > 0
            ? [
                {
                  '@type': 'Question',
                  name: `${categoryName} এর দাম কেমন?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${storeName}-এ ${categoryName} এর দাম শুরু ৳${minPrice.toLocaleString()} থেকে ৳${maxPrice.toLocaleString()} পর্যন্ত।`,
                  },
                },
              ]
            : []),
          {
            '@type': 'Question',
            name: 'সারাদেশে কি ক্যাশ অন ডেলিভারি পাওয়া যাবে?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'হ্যাঁ, ঢাকা সহ সমগ্র বাংলাদেশে দ্রুত হোম ডেলিভারি এবং ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।',
            },
          },
          {
            '@type': 'Question',
            name: 'পণ্য কি আসল এবং ওয়ারেন্টি আছে?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${storeName}-এর প্রতিটি পণ্য ১০০% অরিজিনাল ও মানসম্মত। নির্দিষ্ট পণ্যে প্রযোজ্য ব্র্যান্ড বা অফিসিয়াল ওয়ারেন্টি সুবিধা পাবেন।`,
            },
          },
        ]
      : [
          {
            '@type': 'Question',
            name: `How can I buy ${categoryName} from ${storeName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `You can easily browse and order ${categoryName} online at ${storeName}. Simply add items to your cart, provide your delivery address, and choose Cash on Delivery or online payment.`,
            },
          },
          ...(minPrice > 0
            ? [
                {
                  '@type': 'Question',
                  name: `What is the price range of ${categoryName} in Bangladesh?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `At ${storeName}, ${categoryName} prices range from ৳${minPrice.toLocaleString()} to ৳${maxPrice.toLocaleString()} with guaranteed authentic quality.`,
                  },
                },
              ]
            : []),
          {
            '@type': 'Question',
            name: `Does ${storeName} offer Cash on Delivery across Bangladesh?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, fast home delivery and cash on delivery are available in Dhaka and all districts across Bangladesh.',
            },
          },
          {
            '@type': 'Question',
            name: `Are the products in ${categoryName} authentic?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `All ${categoryName} products sold on ${storeName} are 100% genuine and sourced with quality inspection and applicable warranty.`,
            },
          },
        ],
  };

  const ThemeCategory = themeRegistry[themeId]?.Category || themeRegistry['design-01'].Category;

  return (
    <>
      {/* Search Engine Semantic H1 Heading */}
      <h1 className="sr-only">{collectionTitle}</h1>

      {/* Structured Data: Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Structured Data: Collection & ItemList Products */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* Structured Data: OnlineStore Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      {/* Structured Data: FAQ Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <ThemeCategory tenantSlug={tenantSlug} params={params} searchParams={searchParams} />
    </>
  );
}
