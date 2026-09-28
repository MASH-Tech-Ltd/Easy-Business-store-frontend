'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/utils/tracking';

export default function TrackViewItem({ product }: { product: any }) {
  useEffect(() => {
    if (product) {
      trackEvent('view_item', {
        id: product._id || product.id,
        title: product.title,
        price: product.discountedPrice || product.salePrice || product.price || 0,
        category: product.category || product.categoryId?.name || '',
      });
    }
  }, [product]);

  return null;
}
