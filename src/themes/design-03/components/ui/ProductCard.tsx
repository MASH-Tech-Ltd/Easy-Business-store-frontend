import React from 'react';
import Link from 'next/link';
import ProductCardActions03 from './ProductCardActions';

interface ProductProps {
  product: any;
  isList?: boolean;
  isBestSelling?: boolean;
  theme?: any;
}

export default function Design03ProductCard({ product, isList = false, isBestSelling = false, theme }: ProductProps) {
  const imageUrl = product.images?.[0]?.secure_url || product.image?.secure_url || product.image;
  const price = product.discountedPrice || product.originalPrice || product.price;
  const hasDiscount = product.originalPrice > (product.discountedPrice || 0);

  if (isList) {
    return (
      <Link prefetch={false} href={`/product/${product.slug || product._id || product.id}`} className="group flex bg-[#050505] border border-white/10 hover:border-cyan-400 transition-colors duration-300 w-full rounded-none">
        <div className="w-48 h-48 bg-[#111] border-r border-white/10 flex items-center justify-center shrink-0 relative p-4 group-hover:bg-black transition-colors">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title || product.name} className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-mono uppercase tracking-widest">No Signal</div>
          )}
          {(isBestSelling && product.salesCount && product.salesCount > 30) && (
            <div className="absolute top-0 right-0 bg-amber-500 text-black px-2 py-1 text-[10px] font-black uppercase tracking-widest z-10">
              🔥 {product.salesCount}+ SOLD
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-0 left-0 bg-cyan-400 text-black px-2 py-1 text-[10px] font-black uppercase tracking-widest">
              SALE
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col justify-center flex-1">
          <div className="text-[10px] text-cyan-400 font-mono mb-2 uppercase tracking-widest">ID: {product._id?.substring(0,8) || product.id?.substring(0,8) || 'UNK'}</div>
          <h4 className="text-xl font-black uppercase tracking-tighter text-white mb-2">{product.title || product.name}</h4>
          {product.shortDescription && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-mono">{product.shortDescription}</p>
          )}
          <div className="mt-auto flex items-end gap-3">
            <span className="font-black text-white text-2xl tracking-tighter">{theme?.currencySymbol || '৳'}{' '}{price}</span>
            {hasDiscount && <span className="text-sm text-gray-600 line-through font-mono mb-1">{theme?.currencySymbol || '৳'}{' '}{product.originalPrice}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group block relative h-full bg-[#050505] hover:bg-black transition-colors">
      <Link prefetch={false} href={`/product/${product.slug || product._id || product.id}`} className="block">
        <div className="aspect-square bg-[#111] relative border-b border-white/10 p-6 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title || product.name} className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 scale-95 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-600 text-xs font-mono uppercase tracking-widest">No Signal</span>
            </div>
          )}
          
          {hasDiscount && (
            <div className="absolute top-4 left-0 bg-cyan-400 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
              SALE
            </div>
          )}
          
          {(isBestSelling && product.salesCount && product.salesCount > 30) && (
            <div className="absolute top-4 right-0 bg-amber-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest z-10">
              🔥 {product.salesCount}+ SOLD
            </div>
          )}
          
          {/* Tech crosshairs */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/30" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/30" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30" />
        </div>
        
        <div className="p-6">
          <div className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest flex justify-between">
            <span>SKU</span>
            <span>{product._id?.substring(0,6) || product.id?.substring(0,6) || 'N/A'}</span>
          </div>
          <h4 className="text-lg font-black uppercase tracking-tighter text-white truncate mb-2">{product.title || product.name}</h4>
          <div className="flex items-center gap-3">
            <span className="font-black text-cyan-400 tracking-tighter text-xl">{theme?.currencySymbol || '৳'}{' '}{price}</span>
            {hasDiscount && <span className="text-xs text-gray-600 line-through font-mono">{theme?.currencySymbol || '৳'}{' '}{product.originalPrice}</span>}
          </div>
        </div>
      </Link>
      
      {/* Brutalist hover actions block */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
         <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-auto">
            <ProductCardActions03 product={product} theme={theme} />
         </div>
      </div>
    </div>
  );
}
