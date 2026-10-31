import { getStoreLogoUrl } from '@/utils/imageOptimizer';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import { getStoreName, getRequestContext, getSiteOrigin } from '@/utils/seo';
import { getStandardPolicyContent, type PolicyKey } from '@/utils/policyTemplates';
import type { Metadata, ResolvingMetadata } from 'next';

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

interface PolicyConfig {
  title: string;
  field: PolicyKey;
  canonicalSlug: string;
}

const POLICY_MAP: Record<string, PolicyConfig> = {
  'about-us': { title: 'About Us', field: 'aboutUs', canonicalSlug: 'about-us' },
  'about': { title: 'About Us', field: 'aboutUs', canonicalSlug: 'about-us' },
  'privacy-policy': { title: 'Privacy Policy', field: 'privacyPolicy', canonicalSlug: 'privacy-policy' },
  'privacy': { title: 'Privacy Policy', field: 'privacyPolicy', canonicalSlug: 'privacy-policy' },
  'terms-and-conditions': { title: 'Terms & Conditions', field: 'termsAndConditions', canonicalSlug: 'terms-and-conditions' },
  'terms': { title: 'Terms & Conditions', field: 'termsAndConditions', canonicalSlug: 'terms-and-conditions' },
  'return-policy': { title: 'Return & Refund Policy', field: 'returnPolicy', canonicalSlug: 'return-policy' },
  'refund': { title: 'Return & Refund Policy', field: 'returnPolicy', canonicalSlug: 'return-policy' },
  'returns': { title: 'Return & Refund Policy', field: 'returnPolicy', canonicalSlug: 'return-policy' },
};

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const policyKey = resolvedParams.type?.toLowerCase();
  const policyInfo = POLICY_MAP[policyKey];

  if (!policyInfo) {
    return {
      title: 'Policy Not Found',
      robots: { index: false, follow: false },
    };
  }

  const { tenantSlug, requestOrigin } = await getRequestContext();
  const storeInfo = await getStoreInfo(tenantSlug);
  const baseUrl = getSiteOrigin(requestOrigin, storeInfo);
  const storeName = getStoreName(storeInfo, tenantSlug);

  const title = `${policyInfo.title} | ${storeName}`;
  const description = `Read the official ${policyInfo.title} of ${storeName}. Verified retail guidelines, buyer protection, customer service, and terms.`;
  const ogImage = storeInfo?.logo ? getStoreLogoUrl(storeInfo.logo) : null;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${baseUrl}/policies/${policyInfo.canonicalSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/policies/${policyInfo.canonicalSlug}`,
      siteName: storeName,
      images: ogImage ? [{ url: ogImage, alt: storeName }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const policyKey = resolvedParams.type?.toLowerCase();
  const policyInfo = POLICY_MAP[policyKey];

  if (!policyInfo) {
    notFound();
  }

  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  let themeId = 'design-01';
  let policyContent = '';
  let storeInfo = null;
  let themeInfo: any = null;

  if (tenantSlug !== 'main') {
    const [theme, info] = await Promise.all([
      getTheme(tenantSlug),
      getStoreInfo(tenantSlug)
    ]);
    storeInfo = info;
    themeInfo = theme;
    if (theme && theme.themeId && themeRegistry[theme.themeId]) {
      themeId = theme.themeId;
    }
    
    // Dynamically generate 100% English policies incorporating live store details & merchant return customizations
    const customContent = theme?.footer?.policies?.[policyInfo.field]?.trim();
    const storeName = getStoreName(storeInfo, tenantSlug);
    const email = theme?.footer?.contactInfo?.email || storeInfo?.contactEmail || storeInfo?.email || '';
    const phone = theme?.footer?.contactInfo?.phone || storeInfo?.contactPhone || storeInfo?.phone || '';
    const address = theme?.footer?.contactInfo?.address || storeInfo?.contactAddress || storeInfo?.address || '';
    const currency = storeInfo?.currency || 'BDT';

    policyContent = getStandardPolicyContent(policyInfo.field, {
      storeName,
      email,
      phone,
      address,
      currency,
      customContent,
    });
  }

  const ThemeHeader = themeRegistry[themeId]?.Header || themeRegistry['design-01'].Header;
  const ThemeFooter = themeRegistry[themeId]?.Footer || themeRegistry['design-01'].Footer;
  
  const policyTitle = policyInfo.title;

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const contentBlock = (
    <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
      <div className={`rounded-3xl p-6 sm:p-10 md:p-14 shadow-sm border min-h-[550px] transition-all ${
        themeId === 'design-03'
          ? 'bg-[#111] text-white border-white/10'
          : 'bg-white border-gray-100 text-gray-900'
      }`}>
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span>Policies</span>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200 font-semibold">{policyTitle}</span>
        </nav>

        <div className="border-b pb-6 mb-8 border-gray-100 dark:border-white/10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            {policyTitle}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Last Updated: {formattedDate}
          </p>
        </div>

        <div
          className={`prose max-w-none leading-relaxed text-base ${
            themeId === 'design-03' ? 'prose-invert text-gray-300' : 'prose-slate text-gray-700'
          }`}
          dangerouslySetInnerHTML={{ __html: policyContent }}
        />
      </div>
    </main>
  );

  if (themeId === 'design-03') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
        <ThemeHeader storeInfo={storeInfo} />
        <div className="flex flex-col flex-1">
          <div className="flex-grow lg:ml-64 min-h-screen bg-[#050505] border-l border-white/10">
            {contentBlock}
          </div>
          <div className="lg:ml-64">
            <ThemeFooter storeInfo={storeInfo} theme={themeInfo} />
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'design-02') {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
        <ThemeHeader storeInfo={storeInfo} />
        <div className="flex-grow">
          {contentBlock}
        </div>
        <ThemeFooter storeInfo={storeInfo} theme={themeInfo} />
      </div>
    );
  }

  // Default / design-01 / design-04 / design-05
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <ThemeHeader storeInfo={storeInfo} />
      <div className="flex-grow">
        {contentBlock}
      </div>
      <ThemeFooter storeInfo={storeInfo} theme={themeInfo} />
    </div>
  );
}
