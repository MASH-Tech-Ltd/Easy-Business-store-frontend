import { getTranslation } from '@/utils/translations';
import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer03({
  storeInfo,
  theme,
}: {
  storeInfo?: any;
  theme?: any;
}) {
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language, key);
  const year = new Date().getFullYear();
  const footer = theme?.footer;

  return (
    <footer className="bg-black border-t border-white/10 mt-auto text-white font-mono">
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
        {/* Brand */}
        <div className="p-8 md:p-12 md:col-span-1">
          <div className="text-[10px] text-cyan-400 mb-4 uppercase tracking-widest">
            System Identifier
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
            {storeInfo?.logo && (
              <img src={storeInfo.logo} alt={storeInfo.name} className="w-10 h-10 rounded-full object-cover" />
            )}
            {storeInfo?.name || "Premium Store"}
          </h3>
            {storeInfo?.description && (
              <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
                {storeInfo.description}
              </p>
            )}
          {(footer?.socialLinks?.facebook || footer?.socialLinks?.youtube) && (
            <div className="flex gap-2">
              {footer.socialLinks.facebook && (
                <a
                  href={footer.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {footer.socialLinks.youtube && (
                <a
                  href={footer.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* SHOP */}
        <div className="p-8 md:p-12">
          <div className="text-[10px] text-cyan-400 mb-6 uppercase tracking-widest">{t('shop')}</div>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-500">
            <li>
              <Link prefetch={false} href="/categories" className="hover:text-white transition-colors">{t('categories') || 'All Categories'}</Link>
            </li>
            <li>
              <Link prefetch={false} href="/cart" className="hover:text-white transition-colors">{t('yourBag')}</Link>
            </li>
            <li>
              <Link prefetch={false} href="/products?sort=newest" className="hover:text-white transition-colors">{t('newCollection') || 'New Arrivals'}</Link>
            </li>
          </ul>
        </div>

        {/* HELP & INFO */}
        <div className="p-8 md:p-12">
          <div className="text-[10px] text-cyan-400 mb-6 uppercase tracking-widest">{t('helpAndInfo')}</div>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-gray-500">
            <li>
              <Link prefetch={false} href="/track-order" className="hover:text-white transition-colors">{t('trackOrder')}</Link>
            </li>
            <li>
              <Link prefetch={false}
                href="/policies/about-us"
                className="hover:text-white transition-colors"
              >{t('aboutUs') || 'About Us'}</Link>
            </li>
            <li>
              <Link prefetch={false}
                href="/policies/privacy-policy"
                className="hover:text-white transition-colors"
              >{t('privacyPolicy') || 'Privacy Policy'}</Link>
            </li>
            <li>
              <Link prefetch={false}
                href="/policies/terms-and-conditions"
                className="hover:text-white transition-colors"
              >{t('termsAndConditions') || 'Terms & Conditions'}</Link>
            </li>
            <li>
              <Link prefetch={false}
                href="/policies/return-policy"
                className="hover:text-white transition-colors"
              >{t('returnPolicy') || 'Return Policy'}</Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="p-8 md:p-12">
          <div className="text-[10px] text-cyan-400 mb-6 uppercase tracking-widest">{t('contactUs') || 'CONTACT'}</div>
          <ul className="space-y-6 text-xs uppercase tracking-widest text-gray-500">
            {footer?.contactInfo?.email && (
              <li className="flex items-start gap-4">
                <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
                <span className="break-all">{footer.contactInfo.email}</span>
              </li>
            )}
            {footer?.contactInfo?.phone && (
              <li className="flex items-start gap-4">
                <Phone className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>{footer.contactInfo.phone}</span>
              </li>
            )}
            {footer?.contactInfo?.address && (
              <li className="flex items-start gap-4">
                <MapPin className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>{footer.contactInfo.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="p-6 text-center text-[10px] uppercase tracking-widest text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-start gap-1">
          <span>
            {footer?.copyrightText ||
              `© ${year} ${storeInfo?.name || "Premium Store"}`}
          </span>
          <a
            href="https://mash-tech-ltd.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold text-gray-400 hover:text-blue-500 tracking-widest uppercase transition-colors"
          >
            A Product Of MASH TECH
          </a>
        </div>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 border border-green-300" />{" "}
          SYSTEM ONLINE
        </span>
      </div>
    </footer>
  );
}
