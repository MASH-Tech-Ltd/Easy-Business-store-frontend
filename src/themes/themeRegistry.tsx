import dynamic from 'next/dynamic';

export const themeRegistry: Record<string, any> = {
  'design-01': {
    Home: dynamic(() => import('./design-01/Home')),
    Product: dynamic(() => import('./design-01/Product')),
    Category: dynamic(() => import('./design-01/Category')),
    Categories: dynamic(() => import('./design-01/Categories')),
    Products: dynamic(() => import('./design-01/Categories')), // Fallback to Categories if no Products
    Cart: dynamic(() => import('./design-01/Cart')),
    Checkout: dynamic(() => import('./design-01/Checkout')),
    Header: dynamic(() => import('./design-01/components/layout/Header')),
    Footer: dynamic(() => import('./design-01/components/layout/Footer')),
  },
  'design-02': {
    Home: dynamic(() => import('./design-02/Home')),
    Product: dynamic(() => import('./design-02/Product')),
    Category: dynamic(() => import('./design-02/Category')),
    Categories: dynamic(() => import('./design-02/Categories')),
    Products: dynamic(() => import('./design-02/Categories')), // Fallback
    Cart: dynamic(() => import('./design-02/Cart')),
    Checkout: dynamic(() => import('./design-02/Checkout')),
    Header: dynamic(() => import('./design-02/components/layout/Header')),
    Footer: dynamic(() => import('./design-02/components/layout/Footer')),
  },
  'design-03': {
    Home: dynamic(() => import('./design-03/Home')),
    Product: dynamic(() => import('./design-03/Product')),
    Category: dynamic(() => import('./design-03/Category')),
    Categories: dynamic(() => import('./design-03/Categories')),
    Products: dynamic(() => import('./design-03/Categories')), // Fallback
    Cart: dynamic(() => import('./design-03/Cart')),
    Checkout: dynamic(() => import('./design-03/Checkout')),
    Header: dynamic(() => import('./design-03/components/layout/Header')),
    Footer: dynamic(() => import('./design-03/components/layout/Footer')),
  },
  'design-04': {
    Home: dynamic(() => import('./design-04/Home')),
    Product: dynamic(() => import('./design-04/Product')),
    Category: dynamic(() => import('./design-04/Category')),
    Categories: dynamic(() => import('./design-04/Categories')),
    Products: dynamic(() => import('./design-04/Products')),
    Cart: dynamic(() => import('./design-04/Cart')),
    Checkout: dynamic(() => import('./design-04/Checkout')),
    Header: dynamic(() => import('./design-04/components/layout/Header')),
    Footer: dynamic(() => import('./design-04/components/layout/Footer')),
  },
  'design-05': {
    Home: dynamic(() => import('./design-05/Home')),
    Product: dynamic(() => import('./design-05/Product')),
    Category: dynamic(() => import('./design-05/Category')),
    Categories: dynamic(() => import('./design-05/Categories')),
    Products: dynamic(() => import('./design-05/Products')),
    Cart: dynamic(() => import('./design-05/Cart')),
    Checkout: dynamic(() => import('./design-05/Checkout')),
    Header: dynamic(() => import('./design-05/components/layout/Header')),
    Footer: dynamic(() => import('./design-05/components/layout/Footer')),
  },
};

