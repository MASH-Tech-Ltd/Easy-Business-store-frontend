export type Language = 'en' | 'bn';

export type TranslationKeys = 
  | 'addToCart'
  | 'buyNow'
  | 'productDescription'
  | 'shortDescription'
  | 'specifications'
  | 'reviews'
  | 'quickOverview'
  | 'productVideos'
  | 'sold'
  | 'inStock'
  | 'outOfStock'
  | 'save'
  | 'authenticProduct'
  | 'home'
  | 'categories'
  | 'productId'
  | 'bdt'
  | 'topCategories'
  | 'seeAllCategories'
  | 'collections'
  | 'discover'
  | 'discover'
  | 'quantity'
  | 'discover'
  | 'quantity'
  | 'noImage'
  | 'filters'
  | 'reset'
  | 'min'
  | 'max'
  | 'brands'
  | 'inStockOnly'
  | 'applyFilters'
  | 'showing'
  | 'of'
  | 'sort'
  | 'newestCollection'
  | 'noResultsFound'
  | 'tryAdjustingFilters'
  | 'cartItems'
  | 'yourCartIsEmpty'
  | 'browseProducts'
  | 'startShopping'
  | 'orderSummary'
  | 'subtotal'
  | 'shipping'
  | 'calculatedAtCheckout'
  | 'total'
  | 'proceedToCheckout'
  | 'placeOrder'
  | 'contact'
  | 'phoneNumber'
  | 'personalInfo'
  | 'fullName'
  | 'address'
  | 'selectDivision'
  | 'paymentOptions'
  | 'cashOnDelivery'
  | 'addMoreItems'
  | 'subTotal'
  | 'vatTax'
  | 'deliveryCharge'
  | 'addNote'
  | 'deliveryInstructions'
  | 'confirmOrder'
  | 'policies'
  | 'aboutUs'
  | 'privacyPolicy'
  | 'termsAndConditions'
  | 'returnPolicy'
  | 'contactUs'
  | 'items'
  | 'continueShopping'
  | 'orderConfirmed'
  | 'thankYouPurchase'
  | 'allProducts'
  | 'freeShippingOver'
  | 'availability'
  | 'sku'
  | 'keyHighlights'
  | 'technicalSpecifications'
  | 'productDetails'
  | 'checkout'
  | 'selectDistrict'
  | 'selectSubdistrict'
  | 'processing'
  | 'returnHome'
  | 'productNotFound'
  | 'newCollection'
  | 'priceRange'
  | 'clearFilters'
  | 'searchForProducts'
  | 'searchProducts'
  | 'shop'
  | 'helpAndInfo'
  | 'trackOrder'
  | 'welcomeText'
  | 'yourBag';

export const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    productDescription: 'Product Description',
    shortDescription: 'Short description',
    specifications: 'Specifications',
    reviews: 'Reviews',
    quickOverview: 'Quick Overview',
    productVideos: 'Product Videos',
    sold: 'Sold',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    save: 'Save',
    authenticProduct: '100% Authentic Product Guarantee',
    home: 'Home',
    categories: 'Categories',
    productId: 'Product Id',
    bdt: 'BDT',
    topCategories: 'Top Categories',
    seeAllCategories: 'See all categories',
    collections: 'Collections',
    discover: 'Discover',
    quantity: 'Quantity',
    noImage: 'No Image',
    cartItems: 'Cart Items',
    yourCartIsEmpty: 'Your cart is empty',
    browseProducts: "Looks like you haven't added anything to your cart yet. Browse our products and find something you love!",
    startShopping: 'Start Shopping',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    calculatedAtCheckout: 'Calculated at checkout',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    placeOrder: 'Place order',
    contact: 'Contact',
    phoneNumber: 'Phone number *',
    personalInfo: 'Personal Info',
    fullName: 'Full Name *',
    address: 'Address *',
    selectDivision: 'Select division',
    paymentOptions: 'Payment options',
    cashOnDelivery: 'Cash On Delivery',
    addMoreItems: 'Add more items',
    subTotal: 'Sub Total',
    vatTax: 'VAT/TAX (0%)',
    deliveryCharge: 'Delivery charge',
    addNote: 'ADD NOTE',
    deliveryInstructions: 'Add your delivery instructions',
    confirmOrder: 'Confirm order',
    policies: 'Policies',
    aboutUs: 'About Us',
    privacyPolicy: 'Privacy Policy',
    termsAndConditions: 'Terms And Conditions',
    returnPolicy: 'Return And Cancellation Policy',
    contactUs: 'Contact Us',
    items: 'items',
    continueShopping: 'Continue Shopping',
    orderConfirmed: 'Order Confirmed!',
    thankYouPurchase: "Thank you for your purchase. We've received your order and will process it shortly.",
    allProducts: 'All Products',
    freeShippingOver: 'Free shipping on orders over',
    availability: 'Availability',
    sku: 'SKU',
    keyHighlights: 'Key Highlights',
    technicalSpecifications: 'Technical Specifications',
    productDetails: 'Product Details',
    checkout: 'Checkout',
    selectDistrict: 'Select District',
    selectSubdistrict: 'Select Subdistrict / Thana',
    processing: 'Processing...',
    returnHome: 'Return Home',
    productNotFound: 'Product not found',
    newCollection: 'New Collection',
    priceRange: 'Price Range',
    clearFilters: 'Clear Filters',
    searchForProducts: 'Search for products...',
    searchProducts: 'Search products...',
    shop: 'SHOP',
    helpAndInfo: 'HELP & INFO',
    trackOrder: 'Track Order',
    welcomeText: 'Welcome to our store, your trusted destination for quality daily essentials, lifestyle products, and authentic goods.',
    yourBag: 'Your Bag',
    filters: 'Filters',
    reset: 'Reset',
    min: 'Min',
    max: 'Max',
    brands: 'Brands',
    inStockOnly: 'In Stock Only',
    applyFilters: 'Apply Filters',
    showing: 'Showing',
    of: 'of',
    sort: 'SORT',
    newestCollection: 'Newest Collection',
    noResultsFound: 'No results found',
    tryAdjustingFilters: 'Try adjusting your filters or search query.'
  },
  bn: {
    addToCart: 'কার্টে যোগ করুন',
    buyNow: 'এখনই কিনুন',
    productDescription: 'পণ্যের বিবরণ',
    shortDescription: 'সংক্ষিপ্ত বিবরণ',
    specifications: 'বৈশিষ্ট্যসমূহ',
    reviews: 'রিভিউ',
    quickOverview: 'সংক্ষিপ্ত পরিচিতি',
    productVideos: 'পণ্যের ভিডিও',
    sold: 'বিক্রি হয়েছে',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টকে নেই',
    save: 'সাশ্রয়',
    authenticProduct: '১০০% আসল পণ্যের গ্যারান্টি',
    home: 'হোম',
    categories: 'ক্যাটাগরি',
    productId: 'প্রোডাক্ট আইডি',
    bdt: '৳',
    topCategories: 'শীর্ষ ক্যাটাগরি',
    seeAllCategories: 'সব ক্যাটাগরি দেখুন',
    collections: 'কালেকশন',
    discover: 'আবিষ্কার',
    quantity: 'পরিমাণ',
    noImage: 'কোন ছবি নেই',
    cartItems: 'কার্ট আইটেম',
    yourCartIsEmpty: 'আপনার কার্ট খালি',
    browseProducts: "মনে হচ্ছে আপনি এখনও আপনার কার্টে কিছু যোগ করেননি। আমাদের পণ্য ব্রাউজ করুন এবং আপনার পছন্দের কিছু খুঁজে নিন!",
    startShopping: 'কেনাকাটা শুরু করুন',
    orderSummary: 'অর্ডার সামারি',
    subtotal: 'সাবটোটাল',
    shipping: 'শিপিং',
    calculatedAtCheckout: 'চেকআউটে হিসাব করা হবে',
    total: 'মোট',
    proceedToCheckout: 'চেকআউটে যান',
    placeOrder: 'অর্ডার করুন',
    contact: 'যোগাযোগ',
    phoneNumber: 'ফোন নম্বর *',
    personalInfo: 'ব্যক্তিগত তথ্য',
    fullName: 'পুরো নাম *',
    address: 'ঠিকানা *',
    selectDivision: 'বিভাগ নির্বাচন করুন',
    paymentOptions: 'পেমেন্ট অপশন',
    cashOnDelivery: 'ক্যাশ অন ডেলিভারি',
    addMoreItems: 'আরও আইটেম যোগ করুন',
    subTotal: 'সাব টোটাল',
    vatTax: 'ভ্যাট/ট্যাক্স (০%)',
    deliveryCharge: 'ডেলিভারি চার্জ',
    addNote: 'নোট যোগ করুন',
    deliveryInstructions: 'ডেলিভারি নির্দেশনা যোগ করুন',
    confirmOrder: 'অর্ডার কনফার্ম করুন',
    policies: 'পলিসি',
    aboutUs: 'আমাদের সম্পর্কে',
    privacyPolicy: 'প্রাইভেসি পলিসি',
    termsAndConditions: 'শর্তাবলী',
    returnPolicy: 'রিটার্ন ও বাতিল পলিসি',
    contactUs: 'যোগাযোগ করুন',
    items: 'আইটেম',
    continueShopping: 'কেনাকাটা চালিয়ে যান',
    orderConfirmed: 'অর্ডার কনফার্ম হয়েছে!',
    thankYouPurchase: "আপনার ক্রয়ের জন্য ধন্যবাদ। আমরা আপনার অর্ডার পেয়েছি এবং শীঘ্রই এটি প্রক্রিয়া করব।",
    allProducts: 'সব পণ্য',
    freeShippingOver: 'এর বেশি অর্ডারে ফ্রি শিপিং',
    availability: 'উপলব্ধতা',
    sku: 'এসকিউ',
    keyHighlights: 'মূল বৈশিষ্ট্য',
    technicalSpecifications: 'প্রযুক্তিগত বৈশিষ্ট্য',
    productDetails: 'পণ্যের বিবরণ',
    checkout: 'চেকআউট',
    selectDistrict: 'জেলা নির্বাচন করুন',
    selectSubdistrict: 'উপজেলা/থানা নির্বাচন করুন',
    processing: 'প্রক্রিয়াকরণ চলছে...',
    returnHome: 'হোমে ফিরে যান',
    productNotFound: 'পণ্য পাওয়া যায়নি',
    newCollection: 'নতুন সংগ্রহ',
    priceRange: 'দামের পরিসর',
    clearFilters: 'ফিল্টার মুছুন',
    searchForProducts: 'পণ্য খুঁজুন...',
    searchProducts: 'পণ্য খুঁজুন...',
    shop: 'শপ',
    helpAndInfo: 'সাহায্য এবং তথ্য',
    trackOrder: 'অর্ডার ট্র্যাক করুন',
    welcomeText: 'আমাদের স্টোরে স্বাগতম, আপনার বিশ্বস্ত গন্তব্য মানসম্মত নিত্যপ্রয়োজনীয়, লাইফস্টাইল পণ্য এবং আসল সামগ্রীর জন্য।',
    yourBag: 'আপনার ব্যাগ',
    filters: 'ফিল্টার',
    reset: 'রিসেট',
    min: 'সর্বনিম্ন',
    max: 'সর্বোচ্চ',
    brands: 'ব্র্যান্ড',
    inStockOnly: 'শুধুমাত্র স্টকে থাকা',
    applyFilters: 'ফিল্টার প্রয়োগ করুন',
    showing: 'দেখাচ্ছে',
    of: 'এর মধ্যে',
    sort: 'সাজান',
    newestCollection: 'নতুন সংগ্রহ',
    noResultsFound: 'কোনো ফলাফল পাওয়া যায়নি',
    tryAdjustingFilters: 'আপনার ফিল্টার বা সার্চ পরিবর্তন করে চেষ্টা করুন।'
  }
};

export function getTranslation(language: string | undefined | null, key: TranslationKeys): string {
  const lang = (language === 'bn' ? 'bn' : 'en') as Language;
  return translations[lang][key] || translations['en'][key] || key;
}
