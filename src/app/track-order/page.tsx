import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import { getStoreInfo } from '@/core/api/store';
import { TrackOrderContent } from './TrackOrderClient';

export default async function TrackOrderPage() {
  const headersList = await headers();
  const tenantSlug = headersList.get('x-tenant-slug') || 'main';
  
  let storeInfo = null;
  if (tenantSlug !== 'main') {
    storeInfo = await getStoreInfo(tenantSlug);
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TrackOrderContent tenantId={storeInfo?._id} />
    </Suspense>
  );
}
