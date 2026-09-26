"use client";

import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Tiktok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-8-8H7v12a2 2 0 1 1-2-2 2 2 0 0 1 2 .5v-3.2a5 5 0 1 0 5 8.7V12z" />
  </svg>
);

import Link from "next/link";
import { getTranslation } from '@/utils/translations';

export default function Footer05({
  storeInfo,
  theme,
}: {
  storeInfo?: any;
  theme?: any;
}) {
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const year = new Date().getFullYear();
  const footer = theme?.footer || {};
  const socialLinks = footer.socialLinks || {};
  const contactInfo = footer.contactInfo || {};
  const policies = footer.policies || {};
  const copyrightText =
    footer.copyrightText ||
    `© ${year} ${storeInfo?.name || "Minimal Store"}. All rights reserved.`;
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand & Intro */}
          <div className="md:col-span-4 lg:col-span-5 pr-4">
            <Link prefetch={false} href="/" className="inline-flex items-center gap-2 mb-6">
              {storeInfo?.logo && (
                <img src={storeInfo.logo} alt={storeInfo.name} className="w-8 h-8 rounded-full object-cover" />
              )}
              <span className="font-bold text-xl tracking-tight text-gray-900">
                {storeInfo?.name || "Minimal"}
              </span>
            </Link>
            {storeInfo?.description && (
              <p className="text-gray-500 text-xs sm:text-sm font-medium leading-normal max-w-sm mb-4">
                {storeInfo.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-gray-400">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 -ml-2 rounded-full hover:bg-gray-50"
                >
                  <Facebook className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Instagram className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Twitter className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Youtube className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Tiktok className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* SHOP */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-xs tracking-wide uppercase">{t('shop')}</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-500">
                <li>
                  <Link prefetch={false}
                    href="/categories"
                    className="hover:text-black transition-colors"
                  >{t('categories') || 'All Categories'}</Link>
                </li>
                <li>
                  <Link prefetch={false}
                    href="/cart"
                    className="hover:text-black transition-colors"
                  >{t('yourBag')}</Link>
                </li>
                <li>
                  <Link prefetch={false}
                    href="/products?sort=newest"
                    className="hover:text-black transition-colors"
                  >{t('newCollection') || 'New Arrivals'}</Link>
                </li>
              </ul>
            </div>

            {/* HELP & INFO */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-xs tracking-wide uppercase">{t('helpAndInfo')}</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-500">
                <li>
                  <Link prefetch={false}
                    href="/track-order"
                    className="hover:text-black transition-colors"
                  >{t('trackOrder')}</Link>
                </li>
                <li>
                  <Link prefetch={false}
                    href="/policies/about-us"
                    className="hover:text-black transition-colors"
                  >{t('aboutUs') || 'About Us'}</Link>
                </li>
                <li>
                  <Link prefetch={false}
                    href="/policies/privacy-policy"
                    className="hover:text-black transition-colors"
                  >{t('privacyPolicy') || 'Privacy Policy'}</Link>
                </li>
                <li>
                  <Link prefetch={false}
                    href="/policies/terms-and-conditions"
                    className="hover:text-black transition-colors"
                  >{t('termsAndConditions') || 'Terms & Conditions'}</Link>
                </li>
                <li>
                  <Link prefetch={false}
                    href="/policies/return-policy"
                    className="hover:text-black transition-colors"
                  >{t('returnPolicy') || 'Return Policy'}</Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            {(contactInfo.email ||
              contactInfo.phone ||
              contactInfo.address) && (
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-semibold text-gray-900 mb-4 text-xs tracking-wide uppercase">{t('contact') || 'Contact'}</h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                  {contactInfo.email && (
                    <li className="flex items-start gap-3 group">
                      <Mail
                        className="w-4 h-4 shrink-0 mt-0.5 text-gray-400 group-hover:text-black transition-colors"
                        strokeWidth={1.5}
                      />
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="hover:text-black transition-colors break-all"
                      >
                        {contactInfo.email}
                      </a>
                    </li>
                  )}
                  {contactInfo.phone && (
                    <li className="flex items-start gap-3 group">
                      <Phone
                        className="w-4 h-4 shrink-0 mt-0.5 text-gray-400 group-hover:text-black transition-colors"
                        strokeWidth={1.5}
                      />
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="hover:text-black transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </li>
                  )}
                  {contactInfo.address && (
                    <li className="flex items-start gap-3">
                      <MapPin
                        className="w-4 h-4 shrink-0 mt-0.5 text-gray-400"
                        strokeWidth={1.5}
                      />
                      <span className="leading-tight">
                        {contactInfo.address}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-gray-400">
          <div className="flex flex-col items-start gap-1">
            <p>{copyrightText}</p>
            <a
              href="https://mash-tech-ltd.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-gray-400 hover:text-blue-500 tracking-widest uppercase transition-colors"
            >
              A Product Of MASH TECH
            </a>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gray-600 transition-colors cursor-pointer">
              English (US)
            </span>
            <span className="hover:text-gray-600 transition-colors cursor-pointer">
              BDT ({theme?.currencySymbol || '৳'}{' '})
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
