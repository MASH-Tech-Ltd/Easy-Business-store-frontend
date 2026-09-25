"use client";

import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { getTranslation } from "@/utils/translations";

export default function Footer04({
  storeInfo,
  theme,
}: {
  storeInfo?: any;
  theme?: any;
}) {
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language, key);
  const year = new Date().getFullYear();
  const footer = theme?.footer || {};
  const socialLinks = footer.socialLinks || {};
  const contactInfo = footer.contactInfo || {};
  const policies = footer.policies || {};
  const copyrightText =
    footer.copyrightText ||
    `© ${year} ${storeInfo?.name || "Store"}. All rights reserved.`;

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {storeInfo?.logo && (
                <img
                  src={storeInfo.logo}
                  alt={storeInfo.name}
                  className="w-8 h-8 rounded-full object-contain"
                />
              )}
              <span className="font-black text-gray-900 text-lg uppercase">
                {storeInfo?.name || "Store"}
              </span>
            </div>
            {storeInfo?.description && (
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                {storeInfo.description}
              </p>
            )}
            {(socialLinks.facebook ||
              socialLinks.youtube ||
              socialLinks.tiktok) && (
              <div className="flex gap-2">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-900 hover:text-white transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                    </svg>
                  </a>
                )}
                {socialLinks.tiktok && (
                  <a
                    href={socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white transition-all"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <Link prefetch={false}
                  href="/"
                  className="hover:text-gray-900 transition-colors"
                >{t('home') || 'Home'}</Link>
              </li>
              <li>
                <Link prefetch={false}
                  href="/categories"
                  className="hover:text-gray-900 transition-colors"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link prefetch={false}
                  href="/cart"
                  className="hover:text-gray-900 transition-colors"
                >
                  My Cart
                </Link>
              </li>
              <li>
                <Link prefetch={false}
                  href="/track-order"
                  className="hover:text-gray-900 transition-colors"
                >
                  Track Order
                </Link>
              </li>
              {policies.aboutUs && (
                <li>
                  <Link prefetch={false}
                    href="/policies/about-us"
                    className="hover:text-gray-900 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Policies */}
          {(policies.privacyPolicy ||
            policies.termsAndConditions ||
            policies.returnPolicy) && (
            <div>
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">
                Policies
              </h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {policies.privacyPolicy && (
                  <li>
                    <Link prefetch={false}
                      href="/policies/privacy-policy"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                )}
                {policies.termsAndConditions && (
                  <li>
                    <Link prefetch={false}
                      href="/policies/terms-and-conditions"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                )}
                {policies.returnPolicy && (
                  <li>
                    <Link prefetch={false}
                      href="/policies/return-policy"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Return Policy
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Contact */}
          {(contactInfo.email || contactInfo.phone || contactInfo.address) && (
            <div className="col-span-2 lg:col-span-1">
              <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-4">{t('contact') || 'Contact'}</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                {contactInfo.email && (
                  <li className="flex items-start gap-2">
                    <Mail className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="hover:text-gray-900 transition-colors break-all"
                    >
                      {contactInfo.email}
                    </a>
                  </li>
                )}
                {contactInfo.phone && (
                  <li className="flex items-start gap-2">
                    <Phone className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="hover:text-gray-900 transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </li>
                )}
                {contactInfo.address && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    <span>{contactInfo.address}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-gray-900 py-4 px-6 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
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
    </footer>
  );
}
