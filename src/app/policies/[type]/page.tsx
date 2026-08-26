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
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  const storeInfo = await getStoreInfo(tenantSlug);
  
  const title = `${resolvedParams.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} | ${storeInfo?.name || tenantSlug.toUpperCase()}`;

  return {
    title,
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const resolvedParams = await params;
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  let themeId = 'design-01';
  let policyContent = '';

  if (tenantSlug !== 'main') {
    const theme = await getTheme(tenantSlug);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ThemeHeader />
      <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">
            {policyTitle}
          </h1>
          {policyContent ? (
            <div 
              className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: policyContent }}
            />
          ) : (
            <div className="text-gray-500 italic text-center py-12">
              No content available for {policyTitle}.
            </div>
          )}
        </div>
      </main>
      <ThemeFooter />
    </div>
  );
}
