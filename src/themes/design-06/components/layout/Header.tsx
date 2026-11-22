import { getStoreLogoUrl } from '@/utils/imageOptimizer';
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import HeaderCartIcon06 from '../ui/HeaderCartIcon';
import GlobalSearch06 from '../ui/GlobalSearch';
import { getTranslation } from '@/utils/translations';
import { getTheme, getStoreInfo } from '@/core/api/store';
import { getCategories } from '@/core/api/category';
import HeaderNavClient06 from './HeaderNavClient';

export default async function Header06({ storeInfo }: { storeInfo?: any }) {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [theme, categoriesData] = await Promise.all([
    getTheme(tenantSlug),
    getCategories(tenantSlug),
  ]);

  const language = theme?.language || 'bn';
  const isBn = language === 'bn';

  const info = storeInfo || (await getStoreInfo(tenantSlug));
  const categories = categoriesData || [];

  // Top bar announcement text matching theme settings or bilingual fallback
  const announcementText =
    theme?.banner?.announcementText ||
    (isBn
      ? 'আমাদের স্টোরে স্বাগতম ✦ দ্রুততম হোম ডেলিভারি ও আকর্ষণীয় অফার উপভোগ করুন'
      : 'Welcome to our store  ✦  Enjoy fast nationwide delivery & exclusive offers');

  const showAnnouncement =
    theme?.banner?.showAnnouncement !== undefined
      ? theme.banner.showAnnouncement
      : true;

  return (
    <header className="sticky top-0 z-50 bg-white transition-all duration-300">
      {/* Main Navbar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Client Interactive Navigation (Hamburger, Mobile Drawer, Desktop Links, Search Toggle) */}
          <HeaderNavClient06
            info={info}
            tenantSlug={tenantSlug}
            categories={categories}
            theme={theme}
          />

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Desktop Quick Search Container */}
            <div className="hidden lg:block w-52 xl:w-64">
              <GlobalSearch06 tenantSlug={tenantSlug} theme={theme} />
            </div>

            {/* Track Order / Account */}
            <Link
              href="/track-order"
              prefetch={false}
              aria-label={isBn ? 'অর্ডার ট্র্যাক করুন' : 'Account and orders'}
              className="text-gray-800 hover:text-black p-2 rounded-full hover:bg-gray-100/80 transition-colors hidden sm:flex items-center justify-center"
              title={isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track Order / Account'}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart Icon with badge */}
            <HeaderCartIcon06 />
          </div>
        </div>
      </div>
    </header>
  );
}
