"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, FormEvent } from "react";
import { Filter, X } from "lucide-react";
import { getTranslation } from "@/utils/translations";

export default function FilterSidebar05({
  categoryId,
  availableBrands = [],
  theme,
}: {
  categoryId?: string;
  availableBrands?: string[];
  theme?: any;
}) {
  const language = "en";
  const t = (key: any) => getTranslation(language || "en", key);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [inStock, setInStock] = useState(
    searchParams.get("inStock") === "true",
  );

  const applyFilters = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    if (brand) params.set("brand", brand);
    else params.delete("brand");
    if (inStock) params.set("inStock", "true");
    else params.delete("inStock");

    const basePath = categoryId ? `/category/${categoryId}` : pathname;
    router.push(`${basePath}?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setBrand("");
    setInStock(false);
    const basePath = categoryId ? `/category/${categoryId}` : pathname;
    router.push(basePath);
  };

  return (
    <div className="bg-white sticky top-28">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
        >
          Reset
        </button>
      </div>

      <form onSubmit={applyFilters} className="space-y-10">
        {/* Price */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            {t("priceRange") || "Price Range"}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-gray-300 text-sm font-medium">–</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Brands */}
        {availableBrands.length > 0 && (
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              Brands
            </label>
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-3 custom-scrollbar">
              {availableBrands.map((b) => (
                <label
                  key={b}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${brand === b ? "border-black" : "border-gray-300 group-hover:border-black"}`}
                  >
                    {brand === b && (
                      <div className="w-2 h-2 rounded-full bg-black" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="brand"
                    className="hidden"
                    checked={brand === b}
                    onChange={() => setBrand(b)}
                    onClick={() => {
                      if (brand === b) setBrand("");
                    }}
                  />
                  <span
                    className={`text-sm transition-colors ${brand === b ? "font-medium text-black" : "text-gray-500 group-hover:text-black"}`}
                  >
                    {b}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            {t("availability") || "Availability"}
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${inStock ? "bg-black border-black" : "border border-gray-300 group-hover:border-black"}`}
            >
              {inStock && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            <span
              className={`text-sm transition-colors ${inStock ? "font-medium text-black" : "text-gray-500 group-hover:text-black"}`}
            >
              In Stock Only
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white font-semibold py-3.5 rounded-full text-sm hover:bg-gray-800 transition-colors mt-4"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}
