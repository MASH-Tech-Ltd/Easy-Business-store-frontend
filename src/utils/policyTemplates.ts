export type PolicyKey = 'aboutUs' | 'privacyPolicy' | 'termsAndConditions' | 'returnPolicy';

export interface PolicyTemplateParams {
  storeName: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  customContent?: string;
}

/**
 * Extracts custom return period from merchant input (e.g., "14 days", "10 days", "30 days").
 * Defaults to 7 days if not explicitly specified.
 */
function extractReturnPeriod(text?: string): string {
  if (!text) return '7 days';
  const match = text.match(/(\d+)\s*(days?|business days?|working days?)/i);
  if (match) {
    return `${match[1]} days`;
  }
  return '7 days';
}

export function getStandardPolicyContent(
  key: PolicyKey,
  params: PolicyTemplateParams
): string {
  const {
    storeName,
    email = '',
    phone = '',
    address = '',
    currency = 'BDT',
    customContent = '',
  } = params;

  const trimmedCustom = customContent?.trim() || '';

  switch (key) {
    case 'aboutUs': {
      return `
<div class="space-y-8 text-gray-700 leading-relaxed text-base">
  <!-- Executive Overview -->
  <section class="space-y-4">
    <p class="text-xl font-medium text-gray-900 leading-relaxed">
      Welcome to <strong class="text-primary font-bold">${storeName}</strong>, your premier destination for genuine, trendsetting, and dependable retail shopping in Bangladesh.
    </p>
    <p class="leading-relaxed">
      <strong>${storeName}</strong> delivers an uncompromising standard of retail excellence, secure end-to-end purchasing, and rapid doorstep delivery across all 64 districts of Bangladesh.
    </p>
  </section>

  ${trimmedCustom ? `
  <!-- Merchant Custom Story / Special Note -->
  <div class="bg-blue-50/70 border border-blue-200/80 p-5 rounded-2xl text-blue-950 not-prose space-y-2">
    <div class="flex items-center gap-2 font-bold text-blue-900 text-sm uppercase tracking-wider">
      <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      A Message From ${storeName}
    </div>
    <div class="text-sm leading-relaxed whitespace-pre-wrap">${trimmedCustom}</div>
  </div>` : ''}

  <!-- Mission & Vision -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      Our Mission &amp; Retail Philosophy
    </h3>
    <p>
      At <strong>${storeName}</strong>, our vision is built on three core pillars: <strong>Authenticity</strong>, <strong>Accessibility</strong>, and <strong>Absolute Customer Satisfaction</strong>. We understand that online shopping requires confidence. Therefore, every single product in our inventory undergoes strict multi-point quality inspections prior to packing, guaranteeing that what you see online matches the premium quality delivered to your hands.
    </p>
    <p>
      Whether you are shopping for everyday essentials, premium electronics, curated fashion, or lifestyle collections, we eliminate traditional market hassles by bringing authentic products directly to your doorstep with guaranteed customer protection.
    </p>
  </section>

  <!-- Key Pillars / Value Propostions -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      Why Choose ${storeName}?
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mt-4">
      <div class="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all">
        <div class="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">01</span>
          100% Genuine Quality Guarantee
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Zero counterfeits or compromised replicas. We source directly from authorized distributors and verified manufacturing partners with rigorous pre-dispatch testing.
        </p>
      </div>

      <div class="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all">
        <div class="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">02</span>
          Cash on Delivery (COD) Nationwide
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Enjoy total purchasing peace of mind. Inspect your parcel upon arrival and pay cash directly to the courier agent at your doorstep.
        </p>
      </div>

      <div class="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all">
        <div class="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">03</span>
          Seamless Digital Payments (MFS)
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Full support for instant mobile payments via <strong>bKash, Nagad, Rocket, Upay</strong>, alongside Visa and MasterCard through secure encrypted channels.
        </p>
      </div>

      <div class="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all">
        <div class="font-bold text-gray-900 mb-1.5 flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">04</span>
          Hassle-Free Returns &amp; Exchanges
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Customer-centric return policy protecting you against defective, damaged, or incorrect products with swift refund disbursal directly to your mobile wallet.
        </p>
      </div>
    </div>
  </section>

  <!-- Platform Ecosystem Context -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      The MASH ECO Cloud Platform Advantage
    </h3>
    <p>
      <strong>${storeName}</strong> proudly operates as an independent enterprise merchant hosted on <strong>MASH ECO</strong>. This cloud ecosystem guarantees:
    </p>
    <ul class="list-disc pl-6 space-y-2">
      <li><strong>Sub-second Page Speeds:</strong> Lightning-fast product browsing optimized for mobile and desktop shoppers alike.</li>
      <li><strong>Bank-Grade Infrastructure Security:</strong> SSL/TLS encryption securing customer accounts, order history, and sensitive checkout credentials.</li>
      <li><strong>Real-Time Parcel Tracking:</strong> Automated courier tracking synchronization keeping you updated from warehouse dispatch to delivery handover.</li>
    </ul>
  </section>

  <!-- Verified Contact Info Card -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      Verified Store Credentials &amp; Contact Desk
    </h3>
    <p>Our dedicated customer support team is available Saturday through Thursday to assist with inquiries, product questions, or order assistance:</p>
    
    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-200/80 space-y-3 text-sm not-prose">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Store / Legal Entity</span>
          <span class="text-gray-900 font-bold text-base">${storeName}</span>
          <span class="text-xs text-emerald-600 font-semibold block mt-0.5">&bull; Verified MASH ECO Merchant</span>
        </div>
        <div>
          <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Customer Care Helpline</span>
          ${phone ? `<a href="tel:${phone}" class="text-primary hover:underline font-bold text-base">${phone}</a>` : '<span class="text-gray-500">Available on Order Dispatch</span>'}
        </div>
        <div>
          <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Official Support Email</span>
          ${email ? `<a href="mailto:${email}" class="text-primary hover:underline font-medium text-sm">${email}</a>` : '<span class="text-gray-500">support@masheco.com</span>'}
        </div>
        <div>
          <span class="text-gray-500 block text-xs uppercase font-bold tracking-wider mb-1">Operating Location</span>
          <span class="text-gray-800 text-sm">${address || 'Dhaka, Bangladesh'}</span>
        </div>
      </div>
    </div>
  </section>
</div>
`;
    }

    case 'privacyPolicy': {
      return `
<div class="space-y-8 text-gray-700 leading-relaxed text-base">
  <!-- Preamble -->
  <section class="space-y-4">
    <p class="text-xl font-medium text-gray-900 leading-relaxed">
      At <strong class="text-primary font-bold">${storeName}</strong>, your digital privacy and the security of your personal data are paramount.
    </p>
    <p class="leading-relaxed">
      This comprehensive Privacy Policy details our data governance practices, describing what customer information is collected, how it is safeguarded, the exact purposes for which it is processed, and our strict non-disclosure commitments. By accessing <strong>${storeName}</strong> or placing an order on our platform, you acknowledge and consent to the data protocols described herein.
    </p>
  </section>

  <!-- 1. Data Collection -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      1. Categories of Information We Collect
    </h3>
    <p>
      In order to deliver your purchased goods safely and maintain efficient customer care, we collect the following limited categories of personal information:
    </p>
    <ul class="list-disc pl-6 space-y-2.5">
      <li><strong>Identity &amp; Contact Credentials:</strong> Full name, active mobile phone number, delivery address (including district, area, and landmark), and email address.</li>
      <li><strong>Order &amp; Fulfillment Metadata:</strong> Products purchased, quantities, timestamps, transaction identification numbers, and courier consignment details.</li>
      <li><strong>Payment Method References:</strong> Chosen payment mode (e.g., Cash on Delivery or digital payment reference ID for <strong>bKash, Nagad, Rocket</strong>). <em>Important: We NEVER collect or store sensitive financial passwords, card PINs, or CVV security codes.</em></li>
      <li><strong>Technical &amp; Session Diagnostics:</strong> IP address, device operating system, browser specifications, and referral sources collected anonymously for fraud mitigation and site speed optimization.</li>
    </ul>
  </section>

  <!-- 2. Purpose of Processing -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      2. How Your Information Is Utilized
    </h3>
    <p>Your data is processed strictly for legitimate commercial and fulfillment objectives:</p>
    <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100 not-prose space-y-3 text-sm">
      <div class="flex items-start gap-3">
        <span class="text-emerald-600 font-bold text-base">&bull;</span>
        <p><strong>Order Dispatch &amp; Handover:</strong> Handing over accurate shipping details to licensed logistics courier partners for accurate home delivery.</p>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-emerald-600 font-bold text-base">&bull;</span>
        <p><strong>SMS &amp; Telephonic Updates:</strong> Transmitting automated order verification OTPs, tracking link updates, and courier arrival alerts.</p>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-emerald-600 font-bold text-base">&bull;</span>
        <p><strong>Returns &amp; Refund Processing:</strong> Confirming customer identity and processing refunds via bKash, Nagad, Rocket, or direct bank transfer.</p>
      </div>
      <div class="flex items-start gap-3">
        <span class="text-emerald-600 font-bold text-base">&bull;</span>
        <p><strong>Security &amp; Fraud Prevention:</strong> Protecting merchants and genuine buyers from fake orders, system abuse, and suspicious automated activity on the MASH ECO network.</p>
      </div>
    </div>
  </section>

  <!-- 3. Absolute Anti-Selling Guarantee -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      3. Strict Non-Disclosure &amp; Zero-Selling Guarantee
    </h3>
    <div class="bg-emerald-50 border border-emerald-200/80 p-5 rounded-2xl text-emerald-950 not-prose space-y-2">
      <div class="font-bold text-emerald-900 text-sm uppercase tracking-wider flex items-center gap-2">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        Commercial Data Protection Guarantee
      </div>
      <p class="text-sm leading-relaxed">
        <strong>${storeName}</strong> enforces an absolute commitment: <strong>We never sell, rent, lease, trade, or monetize your personal details to third-party marketing brokers or advertising networks.</strong> Your information is accessed exclusively by authorized personnel directly involved in packing, transporting, and fulfilling your orders.
      </p>
    </div>
  </section>

  <!-- 4. Payment Security -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      4. Payment Gateway Security (MFS &amp; COD)
    </h3>
    <p>
      Whether you select <strong>Cash on Delivery (COD)</strong> or electronic settlement via <strong>bKash, Nagad, Rocket, Upay</strong>, or Visa/MasterCard:
    </p>
    <ul class="list-disc pl-6 space-y-2">
      <li>All electronic transactions are routed through Bangladesh Bank-licensed, PCI-DSS certified payment gateways utilizing 256-bit SSL encryption.</li>
      <li>At no point in the transaction lifecycle are your PIN numbers, account passwords, or card security codes exposed to or retained by <strong>${storeName}</strong>.</li>
      <li>For Cash on Delivery orders, payments are transacted strictly in cash upon physical receipt and verification of the parcel.</li>
    </ul>
  </section>

  <!-- 5. User Rights & Contact -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      5. Your Rights &amp; Privacy Contact Desk
    </h3>
    <p>
      You retain the full right to inquire about, update, or request the permanent deletion of your customer profile and historical contact records. To exercise any privacy rights, reach out to our team:
    </p>
    <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 text-sm not-prose space-y-1">
      <p><strong>Store Data Officer:</strong> ${storeName} Privacy Desk</p>
      ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}" class="text-primary hover:underline font-semibold">${email}</a></p>` : ''}
      ${phone ? `<p><strong>Helpline:</strong> <a href="tel:${phone}" class="text-primary hover:underline font-semibold">${phone}</a></p>` : ''}
      <p class="text-xs text-gray-500 pt-1">Platform Architecture: Secured by MASH ECO Cloud Infrastructure.</p>
    </div>
  </section>
</div>
`;
    }

    case 'termsAndConditions': {
      return `
<div class="space-y-8 text-gray-700 leading-relaxed text-base">
  <!-- Preamble -->
  <section class="space-y-4">
    <p class="text-xl font-medium text-gray-900 leading-relaxed">
      Welcome to <strong class="text-primary font-bold">${storeName}</strong>. Please review these official Terms &amp; Conditions carefully before engaging with our platform or completing any order.
    </p>
    <p class="leading-relaxed">
      These terms establish a legally binding retail agreement between the customer (hereinafter referred to as &ldquo;Buyer&rdquo; or &ldquo;You&rdquo;) and <strong>${storeName}</strong> (hosted on the MASH ECO Multi-Tenant Platform). By placing an order, browsing our digital catalog, or submitting payment, you agree to comply with and be bound by the terms detailed below.
    </p>
  </section>

  <!-- 1. Order Verification -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      1. Order Placement &amp; Telephonic Verification
    </h3>
    <ul class="list-disc pl-6 space-y-2.5">
      <li><strong>Order Submission:</strong> Placing an order via our online checkout constitutes an offer to purchase the specified merchandise.</li>
      <li><strong>Mandatory Verification Call:</strong> To eliminate automated spam orders and ensure accurate address routing, our customer fulfillment team may place a brief confirmation phone call or send an automated SMS verification before warehouse dispatch.</li>
      <li><strong>Order Cancellation by Store:</strong> <strong>${storeName}</strong> reserves the right to cancel or place on hold any order in the event of unexpected stock exhaustion, system pricing discrepancies, or unverified contact information.</li>
    </ul>
  </section>

  <!-- 2. Transparent Pricing -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      2. Pricing, Taxes &amp; Currency Transparency
    </h3>
    <p>
      All merchandise prices listed on <strong>${storeName}</strong> are quoted in <strong>${currency} (Bangladeshi Taka)</strong>. The price confirmed during final checkout is final and inclusive of applicable item value.
    </p>
    <ul class="list-disc pl-6 space-y-2">
      <li><strong>Zero Hidden Fees:</strong> We do not charge unexpected surcharges at checkout.</li>
      <li><strong>Delivery Charges:</strong> Applicable courier transit charges (Inside Dhaka metropolitan vs. Outside Dhaka regional districts) are transparently declared on the checkout page prior to order confirmation.</li>
    </ul>
  </section>

  <!-- 3. Payment Methods (COD, bKash, Nagad, Rocket) -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      3. Payment Methods (Cash on Delivery &amp; MFS)
    </h3>
    <p>We provide flexible, convenient, and secure payment options to suit your preferences:</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mt-3">
      <div class="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-1.5">
        <div class="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          Cash on Delivery (COD)
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Available in every district across Bangladesh. You pay cash to the courier representative only after the parcel arrives physically at your address.
        </p>
      </div>

      <div class="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-1.5">
        <div class="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
          bKash Online / App Payment
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Instant, seamless mobile payment via the official bKash gateway or merchant payment number with immediate order status confirmation.
        </p>
      </div>

      <div class="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-1.5">
        <div class="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
          Nagad &amp; Rocket MFS
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Full integration with Postal Nagad and Dutch-Bangla Rocket wallets, ensuring rapid checkout with zero payment processing delay.
        </p>
      </div>

      <div class="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-1.5">
        <div class="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
          Visa, Mastercard &amp; Cards
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Encrypted online card settlement protected by 3D-Secure two-factor bank authentication for cardholders nationwide.
        </p>
      </div>
    </div>
  </section>

  <!-- 4. Shipping & Delivery Timelines -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      4. Shipping &amp; Doorstep Delivery Timelines
    </h3>
    <p>
      Orders are dispatched through professional tier-1 logistics couriers (including Steadfast, Pathao, RedX, Paperfly, and Sundarban):
    </p>
    <ul class="list-disc pl-6 space-y-2.5">
      <li><strong>Dhaka City Deliveries:</strong> Dispatched and delivered within <strong>24 to 48 hours</strong> of verification.</li>
      <li><strong>Suburbs &amp; Surrounding Zones:</strong> Typically delivered within <strong>48 to 72 hours</strong>.</li>
      <li><strong>Nationwide Regional Districts:</strong> Dispatched and delivered within <strong>2 to 4 business days</strong>.</li>
      <li><strong>Unforeseen Courier Disruptions:</strong> Events beyond commercial control (severe flooding, political blockades, courier hub technical failures) will be communicated proactively with updated delivery ETAs.</li>
    </ul>
  </section>

  <!-- 5. Buyer Responsibilities -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      5. Buyer Responsibilities &amp; Delivery Acceptance
    </h3>
    <p>
      Shoppers are expected to keep their contact telephone active during delivery hours and inspect the exterior parcel condition before payment. False orders or arbitrary refusal of packages without justifiable cause causes severe financial loss to small businesses and couriers, and may result in the suspension of Cash on Delivery privileges across the MASH ECO network.
    </p>
  </section>
</div>
`;
    }

    case 'returnPolicy': {
      // Determine return window: extract from merchant custom text or default to 7 days
      const returnWindow = extractReturnPeriod(trimmedCustom);

      return `
<div class="space-y-8 text-gray-700 leading-relaxed text-base">
  <!-- Preamble -->
  <section class="space-y-4">
    <p class="text-xl font-medium text-gray-900 leading-relaxed">
      At <strong class="text-primary font-bold">${storeName}</strong>, our highest priority is your complete happiness and confidence with every purchase.
    </p>
    <p class="leading-relaxed">
      We stand behind the quality, durability, and authenticity of our catalog. If an item arrives broken, defective, or inconsistent with your order specifications, our straightforward, transparent Return and Refund Policy is designed to protect your investment.
    </p>
  </section>

  ${trimmedCustom ? `
  <!-- Merchant Custom Input Highlight Box -->
  <div class="bg-amber-50/80 border border-amber-200/90 p-5 rounded-2xl text-amber-950 not-prose space-y-2">
    <div class="font-bold text-amber-900 text-sm uppercase tracking-wider flex items-center gap-2">
      <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      Specific Store Return Guidelines
    </div>
    <div class="text-sm leading-relaxed whitespace-pre-wrap">${trimmedCustom}</div>
  </div>` : ''}

  <!-- 1. Return Window & Eligibility -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      1. Return Window &amp; Eligibility Criteria
    </h3>
    <p>
      Customers are entitled to initiate a return, exchange, or refund request within <strong class="text-gray-900 font-bold">${returnWindow}</strong> from the official courier delivery timestamp under the following conditions:
    </p>

    <div class="space-y-3 not-prose mt-3">
      <div class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
        <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">&check;</span>
        <div>
          <strong class="text-gray-900 text-sm block">Transit Damage or Physical Defect:</strong>
          <span class="text-xs text-gray-600">The product was received in damaged, cracked, broken, or inoperable condition.</span>
        </div>
      </div>

      <div class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
        <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">&check;</span>
        <div>
          <strong class="text-gray-900 text-sm block">Specification Mismatch / Incorrect Item:</strong>
          <span class="text-xs text-gray-600">Delivered merchandise differs from your invoice in size, color, design, or technical specification.</span>
        </div>
      </div>

      <div class="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
        <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">&check;</span>
        <div>
          <strong class="text-gray-900 text-sm block">Original Condition &amp; Packaging:</strong>
          <span class="text-xs text-gray-600">The item must remain unworn, unwashed, unaltered, and enclosed in its original manufacturer packaging with all barcodes, tags, manuals, and accessories intact.</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 2. Step-by-Step Return Process -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      2. Step-by-Step Return Workflow
    </h3>
    <div class="relative border-l-2 border-primary/20 pl-6 space-y-6 not-prose ml-2 mt-4">
      <div class="relative">
        <span class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></span>
        <h4 class="font-bold text-gray-900 text-sm">Step 1: Contact Customer Support within ${returnWindow}</h4>
        <p class="text-xs text-gray-600 mt-1">
          Reach out to our helpline (${phone || 'our support number'}) or email (${email || 'support@masheco.com'}) with your <strong>Order ID</strong> and a clear photo or short video demonstrating the defect or mismatch.
        </p>
      </div>

      <div class="relative">
        <span class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></span>
        <h4 class="font-bold text-gray-900 text-sm">Step 2: Reverse Courier Pickup or Return Drop-Off</h4>
        <p class="text-xs text-gray-600 mt-1">
          Our team will coordinate with our logistics partner (Pathao/Steadfast/RedX) to arrange a reverse doorstep collection or provide a return consignment code.
        </p>
      </div>

      <div class="relative">
        <span class="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-sm"></span>
        <h4 class="font-bold text-gray-900 text-sm">Step 3: Quality Control Inspection &amp; Resolution</h4>
        <p class="text-xs text-gray-600 mt-1">
          Upon arrival at our fulfillment center, our Quality Assurance unit inspects the parcel within 24 to 48 hours and initiates an immediate replacement dispatch or refund disbursement.
        </p>
      </div>
    </div>
  </section>

  <!-- 3. Refund Methods & Timelines (bKash, Nagad, Rocket, Bank) -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      3. Refund Disbursement Options &amp; Speed
    </h3>
    <p>
      Approved refunds are disbursed swiftly through the customer&rsquo;s preferred electronic channel:
    </p>

    <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 not-prose space-y-3 text-sm">
      <div class="flex items-start gap-3">
        <span class="text-primary font-bold text-base">&bull;</span>
        <div>
          <strong class="text-gray-900">Mobile Financial Services (bKash, Nagad, Rocket, Upay):</strong>
          <p class="text-xs text-gray-600 mt-0.5">Disbursed directly to your personal bKash/Nagad/Rocket account within <strong>3 to 5 business days</strong> following inspection.</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <span class="text-primary font-bold text-base">&bull;</span>
        <div>
          <strong class="text-gray-900">Cash on Delivery (COD) Orders:</strong>
          <p class="text-xs text-gray-600 mt-0.5">Refunded via your choice of personal bKash, Nagad, Rocket wallet or direct bank transfer upon confirmation.</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <span class="text-primary font-bold text-base">&bull;</span>
        <div>
          <strong class="text-gray-900">Credit / Debit Card Reversals:</strong>
          <p class="text-xs text-gray-600 mt-0.5">Submitted immediately to the issuing payment gateway; banks reflect the reversal on your card statement within 5 to 7 business days.</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <span class="text-primary font-bold text-base">&bull;</span>
        <div>
          <strong class="text-gray-900">Express Free Replacement:</strong>
          <p class="text-xs text-gray-600 mt-0.5">If you prefer an exchange instead of a cash refund, a brand-new replacement unit is expedited to you with <strong>zero additional shipping charge</strong>.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. Support Contact -->
  <section class="space-y-4">
    <h3 class="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2.5">
      <span class="w-2.5 h-6 bg-primary rounded-full inline-block"></span>
      4. Return Support Desk &amp; Inquiries
    </h3>
    <p>Need immediate help with an active order or return? Reach out directly to our team:</p>
    <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200/80 text-sm not-prose space-y-1">
      <p><strong>Store:</strong> ${storeName}</p>
      ${phone ? `<p><strong>Helpline:</strong> <a href="tel:${phone}" class="text-primary hover:underline font-bold">${phone}</a></p>` : ''}
      ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}" class="text-primary hover:underline font-semibold">${email}</a></p>` : ''}
      <p class="text-xs text-gray-500 pt-1">Platform Ecosystem: Powered by MASH ECO.</p>
    </div>
  </section>
</div>
`;
    }
  }
}
