"use client";

import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
import Link from "next/link";

export default function Footer05({
  storeInfo,
  theme,
}: {
  storeInfo?: any;
  theme?: any;
}) {
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
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              {storeInfo?.logo && (
                <img src={storeInfo.logo} alt={storeInfo.name} className="w-8 h-8 rounded-full object-cover" />
              )}
              <span className="font-bold text-2xl tracking-tight text-gray-900">
                {storeInfo?.name || "Minimal"}
              </span>
            </Link>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-sm mb-8">
              {storeInfo?.description ||
                "A curated collection of premium products designed to elevate your everyday life. Simple, beautiful, functional."}
            </p>
            <div className="flex items-center gap-4 text-gray-400">
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
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Instagram className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors p-2 rounded-full hover:bg-gray-50"
                >
                  <Twitter className="w-5 h-5 stroke-[1.5]" />
                </a>
              )}
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-6 text-sm tracking-wide">
                Shop
              </h3>
              <ul className="space-y-4 text-[15px] text-gray-500">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-black transition-colors"
                  >
                    All Collection
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories"
                    className="hover:text-black transition-colors"
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="hover:text-black transition-colors"
                  >
                    Your Cart
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track-order"
                    className="hover:text-black transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
                {policies.aboutUs && (
                  <li>
                    <Link
                      href="/policies/about-us"
                      className="hover:text-black transition-colors"
                    >
                      About
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Support */}
            {(policies.privacyPolicy ||
              policies.termsAndConditions ||
              policies.returnPolicy) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-6 text-sm tracking-wide">
                  Support
                </h3>
                <ul className="space-y-4 text-[15px] text-gray-500">
                  {policies.returnPolicy && (
                    <li>
                      <Link
                        href="/policies/return-policy"
                        className="hover:text-black transition-colors"
                      >
                        Returns
                      </Link>
                    </li>
                  )}
                  {policies.privacyPolicy && (
                    <li>
                      <Link
                        href="/policies/privacy-policy"
                        className="hover:text-black transition-colors"
                      >
                        Privacy
                      </Link>
                    </li>
                  )}
                  {policies.termsAndConditions && (
                    <li>
                      <Link
                        href="/policies/terms-and-conditions"
                        className="hover:text-black transition-colors"
                      >
                        Terms
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Contact */}
            {(contactInfo.email ||
              contactInfo.phone ||
              contactInfo.address) && (
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-semibold text-gray-900 mb-6 text-sm tracking-wide">
                  Contact
                </h3>
                <ul className="space-y-4 text-[15px] text-gray-500">
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
                      <span className="leading-relaxed">
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
              BDT ({theme?.currencySymbol || '৳'})
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
