import { headers } from 'next/headers';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { themeRegistry } from '@/themes/themeRegistry';
import type { Metadata, ResolvingMetadata } from 'next';

interface PageProps {
  params: Promise<{
    type: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const storeInfo = await getStoreInfo(tenantSlug);
  const storeName = storeInfo?.name || tenantSlug.toUpperCase();
  const policyTitle = resolvedParams.type
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const title = `${policyTitle} | ${storeName}`;
  const description = `Read the ${policyTitle} of ${storeName}.`;
  const ogImage = storeInfo?.logo || null;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/policies/${resolvedParams.type}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/policies/${resolvedParams.type}`,
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
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  let themeId = 'design-01';
  let policyContent = '';
  let storeInfo = null;
  let themeInfo = null;

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
    
    // Get the policy content from the theme
    if (theme?.footer?.policies) {
      const type = resolvedParams.type;
      if (type === 'about-us') policyContent = theme.footer.policies.aboutUs;
      else if (type === 'privacy-policy') policyContent = theme.footer.policies.privacyPolicy;
      else if (type === 'terms-and-conditions') policyContent = theme.footer.policies.termsAndConditions;
      else if (type === 'return-policy') policyContent = theme.footer.policies.returnPolicy;
    }
  }

  const ThemeHeader = themeRegistry[themeId]?.Header || themeRegistry['design-01'].Header;
  const ThemeFooter = themeRegistry[themeId]?.Footer || themeRegistry['design-01'].Footer;
  
  const policyTitle = resolvedParams.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const contentBlock = (
    <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-16">
      <div className={`rounded-2xl p-8 md:p-12 ${themeId === 'design-03' ? 'bg-[#111] text-white border border-white/10' : 'bg-white shadow-sm border border-gray-100'}`}>
        <h1 className={`text-3xl md:text-4xl font-bold mb-8 border-b pb-6 ${themeId === 'design-03' ? 'text-white border-white/10' : 'text-gray-900 border-gray-100'}`}>
          {policyTitle}
        </h1>
        {policyContent ? (
          <div 
            className={`prose max-w-none whitespace-pre-wrap leading-relaxed ${themeId === 'design-03' ? 'prose-invert text-gray-300' : 'prose-blue text-gray-700'}`}
            dangerouslySetInnerHTML={{ __html: policyContent }}
          />
        ) : (
          <div className="text-gray-500 italic text-center py-12">
            No content available for {policyTitle}.
          </div>
        )}
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

  // Default / design-01 / design-04
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
