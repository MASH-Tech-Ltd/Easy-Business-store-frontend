import { storefrontFetch } from "../../utils/storefrontFetch";
import { headers } from "next/headers";
import CheckoutClient03 from './CheckoutClient';

export default async function Design03CheckoutPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';

  const [storeInfoRes, themeRes] = await Promise.all([
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/info`, { next: { revalidate: 60 } }),
    storefrontFetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/theme`, { next: { revalidate: 60 } })
  ]);
  
  const storeInfo = storeInfoRes.ok ? (await storeInfoRes.json()).data : null;
  const theme = themeRes.ok ? (await themeRes.json()).data : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      <header className="py-6 px-8 flex items-center justify-center border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-tight">Secure Checkout</h1>
      </header>

      <CheckoutClient03 storeInfo={storeInfo} theme={theme} />
    </div>
  );
}
