import { headers } from "next/headers";
import Link from "next/link";
import {
  Laptop,
  Cpu,
  Smartphone,
  Speaker,
  Wind,
  Tv,
  Gamepad2,
  Printer,
  Camera,
  Component,
  ArrowRight,
} from "lucide-react";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import CategorySlider from "./components/ui/CategorySlider";
import ProductCard from "./components/ui/ProductCard";
import { getTranslation, TranslationKeys } from "@/utils/translations";
import { getStoreInfo, getTheme } from "@/core/api/store";
import { getProducts } from "@/core/api/product";
import { getCategories } from "@/core/api/category";

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("laptop") || n.includes("computer") || n.includes("pc"))
    return <Laptop className="w-8 h-8" />;
  if (n.includes("processor") || n.includes("cpu") || n.includes("chip"))
    return <Cpu className="w-8 h-8" />;
  if (n.includes("mobile") || n.includes("phone") || n.includes("smartphone"))
    return <Smartphone className="w-8 h-8" />;
  if (n.includes("speaker") || n.includes("audio") || n.includes("sound"))
    return <Speaker className="w-8 h-8" />;
  if (n.includes("ac") || n.includes("air") || n.includes("cooling"))
    return <Wind className="w-8 h-8" />;
  if (n.includes("tv") || n.includes("television") || n.includes("display"))
    return <Tv className="w-8 h-8" />;
  if (n.includes("game") || n.includes("gaming") || n.includes("console"))
    return <Gamepad2 className="w-8 h-8" />;
  if (n.includes("print") || n.includes("printer"))
    return <Printer className="w-8 h-8" />;
  if (n.includes("camera") || n.includes("photo") || n.includes("lens"))
    return <Camera className="w-8 h-8" />;
  return <Component className="w-8 h-8" />;
};

export default async function Design01Home({
  tenantSlug,
}: {
  tenantSlug: string;
}) {
  if (tenantSlug === "main") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Platform Landing Page
          </h1>
          <p className="text-gray-500">
            Welcome to the multi-tenant SaaS. Access your store via subdomain.
          </p>
        </div>
      </div>
    );
  }

  const [products, categories, storeInfo, theme] = await Promise.all([
    getProducts(tenantSlug),
    getCategories(tenantSlug),
    getStoreInfo(tenantSlug),
    getTheme(tenantSlug),
  ]);

  const language = theme?.language || "en";
  const t = (key: TranslationKeys) => getTranslation(language, key);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="max-w-[1400px] w-full mx-auto bg-gradient-to-r from-blue-900 to-indigo-800 text-white relative overflow-hidden flex flex-col justify-center min-h-[230px] sm:min-h-[340px] aspect-[21/9] lg:aspect-[2.5/1] xl:aspect-[3/1]">
        {theme?.banner?.image?.secure_url && (
          <div className="absolute inset-0 z-0">
            <img
              src={theme.banner.image.secure_url}
              alt={theme.banner.title || "Banner Background"}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay to ensure white text is readable over the banner */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 relative z-10 py-4 sm:py-8">
          <div className="max-w-2xl">
            {theme?.banner?.subtitle && (
              <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 text-blue-200 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 md:mb-6 border border-blue-700/50 backdrop-blur-sm">
                {theme.banner.subtitle}
              </span>
            )}
            {theme?.banner?.title && (
              <h1 className="text-[clamp(1.75rem,5vw,4rem)] font-extrabold tracking-tight mb-3 sm:mb-4 md:mb-6 leading-tight whitespace-pre-line">
                {theme.banner.title}
              </h1>
            )}
            {theme?.banner?.description && (
              <p className="text-[clamp(0.875rem,2vw,1.25rem)] text-blue-100 mb-5 sm:mb-6 md:mb-8 leading-relaxed">
                {theme.banner.description}
              </p>
            )}
            {theme?.banner?.buttonText && theme?.banner?.buttonLink && (
              <Link
                prefetch={false}
                href={theme.banner.buttonLink}
                className="inline-flex items-center gap-1 sm:gap-2 bg-white text-indigo-900 px-3 py-1.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm md:text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
              >
                {theme.banner.buttonText}{" "}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Top Categories */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm relative z-20 -mt-4 sm:-mt-6 md:-mt-8 rounded-t-2xl sm:rounded-t-3xl mx-3 sm:mx-4 md:mx-6 lg:mx-auto max-w-[1400px] w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] lg:w-full">
          <div className="px-4 py-5 sm:px-6 sm:py-6 md:py-8">
            <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-[clamp(1.125rem,3vw,1.5rem)] font-black text-gray-900 tracking-tight">
                {t("topCategories")}
              </h2>
              <Link
                prefetch={false}
                href="/categories"
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
              >
                {t("seeAllCategories")}{" "}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <CategorySlider>
              {categories.map((cat: any) => (
                <Link
                  prefetch={false}
                  href={`/category/${cat.slug || cat._id}`}
                  key={cat._id}
                  className="flex flex-col items-center justify-start gap-2 sm:gap-3 min-w-[70px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px] snap-start cursor-pointer group"
                >
                  <div className="text-gray-600 group-hover:text-indigo-600 group-hover:-translate-y-1 sm:group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center shrink-0 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100">
                    {cat.image?.secure_url ? (
                      <img
                        src={cat.image.secure_url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="scale-[0.6] sm:scale-[0.7] md:scale-90 lg:scale-100">
                        {getCategoryIcon(cat.name)}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] lg:text-sm font-bold text-gray-800 text-center uppercase tracking-wider lg:tracking-wide group-hover:text-indigo-600 transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </CategorySlider>
          </div>
        </div>
      )}

      <main
        id="home-main"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 w-full"
      >
        <section>
          <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
            <div>
              <h2 className="text-[clamp(1.25rem,4vw,2rem)] font-extrabold text-gray-900 tracking-tight">
                {t("collections")}
              </h2>
              <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base">
                Explore our latest arrivals
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 sm:py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium text-sm sm:text-lg">
                No products found in collections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {products.map((product: any) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
