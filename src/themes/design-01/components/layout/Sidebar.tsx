import React from 'react';
import { getTranslation } from '@/utils/translations';

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/get-all-category`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function Sidebar({ theme }: { theme?: any }) {
  const categories = await getCategories();
  const t = (key: any) => getTranslation(theme?.language || 'en', key);

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 hidden lg:block">
      <div className="p-3 bg-gray-100">
        <h2 className="font-semibold text-gray-800 text-sm">{t('categories')}</h2>
      </div>
      <div className="p-4 bg-gray-50 h-full min-h-[calc(100vh-200px)]">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Category List</h3>
        <ul className="space-y-1">
          <li>
            <a 
              href="#"
              className="block px-3 py-2 rounded text-xs font-bold text-gray-900 bg-gray-100 transition-colors"
            >
              {t('allProducts')}
            </a>
          </li>
          {categories.length > 0 ? (
            categories.map((category: any, index: number) => (
              <li key={category._id || index}>
                <a 
                  href={`#${category.name?.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block px-3 py-2 rounded text-xs font-semibold text-gray-800 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {category.name}
                </a>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-xs py-2 px-3">No categories found.</li>
          )}
        </ul>
      </div>
    </aside>
  );
}
