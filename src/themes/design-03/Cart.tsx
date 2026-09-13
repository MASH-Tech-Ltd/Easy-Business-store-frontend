import { headers } from 'next/headers';
import { getStoreInfo, getTheme } from '@/core/api/store';
import Header03 from './components/layout/Header';
import Footer03 from './components/layout/Footer';
import CartClient03 from './CartClient';

export default async function Design03CartPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  const [storeInfo, theme] = await Promise.all([getStoreInfo(tenantSlug), getTheme(tenantSlug)]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500/30">
      <Header03 storeInfo={storeInfo} />
      <div className="flex flex-col flex-1">
        <CartClient03 theme={theme} />
        <div className="lg:ml-64">
           <Footer03 storeInfo={storeInfo} theme={theme} />
        </div>
      </div>
    </div>
  );
}
