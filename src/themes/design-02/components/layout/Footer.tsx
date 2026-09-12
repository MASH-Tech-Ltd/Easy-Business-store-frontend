import Link from "next/link";

export default function Footer({
  storeInfo,
  theme,
}: {
  storeInfo: any;
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
    <footer className="py-16 bg-gray-50 text-gray-900 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1">
          <h2 className="text-2xl font-semibold tracking-tight mb-4 flex items-center gap-2">
            {storeInfo?.logo ? (
              <img
                src={storeInfo.logo}
                alt={storeInfo?.name || "Minimal Store"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : null}
            {storeInfo?.name || "Minimal Store"}
          </h2>
          <p className="text-gray-500 text-sm max-w-sm mb-6">
            {storeInfo?.description ||
              "Experience the best curated collection of premium products designed for modern living. Quality and simplicity combined."}
          </p>
          {(socialLinks.facebook ||
            socialLinks.youtube ||
            socialLinks.tiktok) && (
            <div className="flex gap-4">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] transition-all"
                >
                  <svg
                    width="20"
                    height="20"
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
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#FF0000] transition-all"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#000000] transition-all"
                >
                  <svg
                    width="20"
                    height="20"
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
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
            Shop
          </h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link
                href="/categories"
                className="hover:text-gray-900 transition-colors"
              >
                All Categories
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="hover:text-gray-900 transition-colors"
              >
                Your Bag
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
            Support
          </h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li>
              <Link
                href="/track-order"
                className="hover:text-gray-900 transition-colors"
              >
                Track Order
              </Link>
            </li>
            {policies.aboutUs && (
              <li>
                <Link
                  href="/policies/about-us"
                  className="hover:text-gray-900 transition-colors"
                >
                  About Us
                </Link>
              </li>
            )}
            {policies.privacyPolicy && (
              <li>
                <Link
                  href="/policies/privacy-policy"
                  className="hover:text-gray-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            )}
            {policies.termsAndConditions && (
              <li>
                <Link
                  href="/policies/terms-and-conditions"
                  className="hover:text-gray-900 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
            )}
            {policies.returnPolicy && (
              <li>
                <Link
                  href="/policies/return-policy"
                  className="hover:text-gray-900 transition-colors"
                >
                  Return Policy
                </Link>
              </li>
            )}
            {!policies.aboutUs &&
              !policies.privacyPolicy &&
              !policies.termsAndConditions &&
              !policies.returnPolicy && (
                <>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      Shipping & Returns
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="hover:text-gray-900 transition-colors"
                    >
                      FAQ
                    </Link>
                  </li>
                </>
              )}
          </ul>
        </div>
        {/* Contact Info */}
        {(contactInfo.email || contactInfo.phone || contactInfo.address) && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-gray-500">
              {contactInfo.email && (
                <li className="flex items-start gap-2">
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
                  <span>{contactInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-gray-200 text-center text-sm text-gray-400 flex flex-col items-center gap-1">
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
