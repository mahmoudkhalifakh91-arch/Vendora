/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ShoppingCart, MessageSquare, AlertCircle, Sparkles, Filter, ChevronRight, X, User, ThumbsUp } from 'lucide-react';

interface ProductCatalogProps {
  onViewSellerStore?: (sellerId: string) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onViewSellerStore }) => {
  const { products, addToCart, language, addReview, currentUser, sellers, setCartOpen } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'rating' | 'sales'>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Review submission local states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Autofill review name on login
  React.useEffect(() => {
    if (currentUser) {
      setReviewName(currentUser.name);
    } else {
      setReviewName('');
    }
  }, [currentUser, selectedProduct]);

  const categories = [
    { value: 'all', en: 'All Categories', ar: 'كل الأقسام' },
    { value: 'mobiles', en: 'Mobiles', ar: 'الموبايلات' },
    { value: 'electronics_accessories', en: 'Electronic Accessories', ar: 'الإكسسوارات الإلكترونية' },
    { value: 'video_games', en: 'Video Games', ar: 'ألعاب الفيديو' },
    { value: 'perfumes', en: 'Perfumes', ar: 'عطور' },
    { value: 'laptops', en: 'Laptops', ar: 'أجهزة الكمبيوتر المحمولة' },
    { value: 'cosmetics', en: 'Cosmetics', ar: 'مستحضرات تجميل' },
    { value: 'home_kitchen', en: 'Home & Kitchen', ar: 'المنزل والمطبخ' },
    { value: 'others', en: 'Others', ar: 'أخرى' }
  ];

  const getCategoryLabel = (catValue: string) => {
    const found = categories.find(c => c.value === catValue);
    if (found) {
      return language === 'ar' ? found.ar : found.en;
    }
    const mappedValue = ['mobiles', 'electronics_accessories', 'video_games', 'perfumes', 'laptops', 'cosmetics', 'home_kitchen'].includes(catValue) ? catValue : 'others';
    const foundMapped = categories.find(c => c.value === mappedValue);
    if (foundMapped) {
      return language === 'ar' ? foundMapped.ar : foundMapped.en;
    }
    return catValue;
  };

  // Secure Smart Filter & Search Matches
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Map unrecognized/agricultural categories to 'others'
      const productCategoryMapped = ['mobiles', 'electronics_accessories', 'video_games', 'perfumes', 'laptops', 'cosmetics', 'home_kitchen'].includes(product.category) 
        ? product.category 
        : 'others';

      // Category match
      const cMatch = selectedCategory === 'all' || productCategoryMapped === selectedCategory;
      
      // Search match (matches english/arabic titles, descriptions)
      const query = searchQuery.toLowerCase().trim();
      const sMatch = !query || 
         product.nameEn.toLowerCase().includes(query) ||
         product.nameAr.toLowerCase().includes(query) ||
         product.descriptionEn.toLowerCase().includes(query) ||
         product.descriptionAr.toLowerCase().includes(query);

      return cMatch && sMatch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Sort matched results
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return list.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'sales') return list.sort((a, b) => b.salesCount - a.salesCount);
    return list;
  }, [filteredProducts, sortBy]);

  // Personalized Recommendation Generator (Suggestions)
  const recommendations = useMemo(() => {
    if (!selectedProduct) return [];
    // Recommend products of the same category, or with highest popularity, excluding currently active product
    return products
      .filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.rating >= 4.7))
      .slice(0, 3);
  }, [products, selectedProduct]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!reviewComment.trim()) return;

    addReview(selectedProduct.id, reviewRating, reviewComment, reviewName);
    
    // Refresh modal product state with updated data reference
    const updated = products.find(p => p.id === selectedProduct.id);
    if (updated) {
      setSelectedProduct(updated);
    }

    // Reset fields
    setReviewName('');
    setReviewRating(5);
    setReviewComment('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8" id="catalog-section">
      {/* Search and Filters Hub */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8" id="catalog-controls">
        {/* Department Pills */}
        <div className="flex flex-wrap gap-2 justify-start w-full md:w-auto" id="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-300 cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              id={`cat-btn-${cat.value}`}
            >
              {language === 'ar' ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        {/* Smart search & sorting */}
        <div className="flex flex-wrap md:flex-nowrap gap-2 items-center w-full md:w-auto" id="search-sort-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'البحث عن منتج...' : 'Search for products...'}
            className="w-full md:w-64 pl-3.5 pr-3.5 py-2.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:outline-none"
            id="catalog-search-query"
          />

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2.5 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:ring-2 focus:ring-teal-500/30 focus:outline-none"
            id="catalog-sort"
          >
            <option value="default">{language === 'ar' ? 'الترتيب الافتراضي' : 'Default Sorting'}</option>
            <option value="price-asc">{language === 'ar' ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</option>
            <option value="price-desc">{language === 'ar' ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</option>
            <option value="rating">{language === 'ar' ? 'التقييم: الأعلى تقييماً' : 'Rating: Highest Rated'}</option>
            <option value="sales">{language === 'ar' ? 'الأكثر مبيعاً 🔥' : 'Best Sellers 🔥'}</option>
          </select>
        </div>
      </div>

      {/* Catalog Render Grid */}
      {sortedProducts.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800" id="no-search-results">
          <AlertCircle className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            {language === 'ar' ? 'عذراً، لم نجد أي تطابقات لخيارات البحث الخاصة بك.' : 'No matched items found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-catalog-grid">
          {sortedProducts.map((p) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group h-full"
              id={`product-card-${p.id}`}
            >
              {/* Product Badge */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                <img
                  src={p.image}
                  alt={p.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {p.featured && (
                  <span className="absolute top-2 left-2 z-10 text-[9px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm uppercase">
                    <Sparkles className="w-2.5 h-2.5" />
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </span>
                )}
                {p.stock === 0 ? (
                  <span className="absolute top-2 right-2 z-10 text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                    {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
                  </span>
                ) : p.stock <= 5 ? (
                  <span className="absolute top-2 right-2 z-10 text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {language === 'ar' ? `متبقي ${p.stock} فقط!` : `${p.stock} Left!`}
                  </span>
                ) : null}
              </div>

              {/* Card specs body */}
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400 mb-1.5 font-medium">
                    <span className="uppercase tracking-wider">
                      {getCategoryLabel(p.category)}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {p.rating} ({p.reviews.length})
                    </span>
                  </div>

                  {p.sellerId && (
                    <div className="mb-2 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/40 pb-1.5">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">
                        {language === 'ar' ? 'التاجر المعتمد:' : 'Supplier:'}
                      </span>
                      {(() => {
                        const sMeta = sellers.find(s => s.id === p.sellerId);
                        return sMeta ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewSellerStore) {
                                onViewSellerStore(sMeta.id);
                              }
                            }}
                            className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline cursor-pointer flex items-center gap-1 font-sans bg-teal-50/40 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded"
                            id={`seller-link-card-${p.id}`}
                          >
                            <span>{sMeta.storeName}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400 font-sans">Vendora Direct</span>
                        );
                      })()}
                    </div>
                  )}

                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                    {language === 'ar' ? p.nameAr : p.nameEn}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                    {language === 'ar' ? p.descriptionAr : p.descriptionEn}
                  </p>
                </div>

                <div className="mt-4 border-t border-zinc-50 dark:border-zinc-800 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">{language === 'ar' ? 'السعر' : 'Price'}</span>
                    <span className="text-sm font-extrabold text-teal-600">
                      {p.price} <span className="text-[10px] font-semibold">{language === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    {/* View items details trigger */}
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2 rounded-xl transition-colors font-medium border border-zinc-200/50 dark:border-zinc-800 cursor-pointer"
                      id={`view-btn-${p.id}`}
                    >
                      {language === 'ar' ? 'عرض السلعة' : 'Details'}
                    </button>

                    {/* Add directly to cart */}
                    <button
                      onClick={() => { addToCart(p, 1); setCartOpen(true); }}
                      disabled={p.stock === 0}
                      className={`text-white p-2 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer ${
                        p.stock === 0 
                          ? 'bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed' 
                          : 'bg-teal-600 hover:bg-teal-700'
                      }`}
                      id={`add-cart-btn-${p.id}`}
                      title={language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Details & Reviews & Recommendations Drawer/Overlay Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs" id="product-detail-modal">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
              {/* Click outside to close wrapper absolute backdrop */}
              <div className="fixed inset-0 -z-10" onClick={() => {
                setSelectedProduct(null);
                setReviewName('');
                setReviewComment('');
              }} />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: -35 }}
                className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col my-8 max-h-[88vh] text-start align-middle"
                id="details-modal-box"
              >
              {/* Close Button absolute */}
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setReviewName('');
                  setReviewComment('');
                }}
                className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors focus:outline-none"
                id="close-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Container */}
              <div className="overflow-y-auto p-6 md:p-8 space-y-8">
                
                {/* Product Core Intro Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-5 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 aspect-square">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {getCategoryLabel(selectedProduct.category)}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white leading-tight">
                      {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedProduct.rating}</span>
                      <span className="text-zinc-400">({selectedProduct.reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'})</span>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span className="text-zinc-500 font-medium">
                        {language === 'ar' ? `${selectedProduct.salesCount} مبيع بالمتجر` : `${selectedProduct.salesCount} Sold`}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {language === 'ar' ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-50 dark:border-zinc-800">
                      <div>
                        <span className="text-xs text-zinc-400 block">{language === 'ar' ? 'السعر النهائي المعتمد بمصر' : 'Approved Final Price (EGP)'}</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-teal-600">{selectedProduct.price}</span>
                          <span className="text-xs text-teal-600 font-bold">{language === 'ar' ? 'جنيه مصري' : 'EGP'}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {language === 'ar' ? '*الأسعار شاملة ضريبة القيمة المضافة والشحن مدعوم بمصر' : '*Price includes local sales VAT.'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { addToCart(selectedProduct, 1); setCartOpen(true); }}
                          disabled={selectedProduct.stock === 0}
                          className={`flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl shadow-md cursor-pointer transition-colors ${
                            selectedProduct.stock === 0
                              ? 'bg-zinc-400 dark:bg-zinc-800 cursor-not-allowed'
                              : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {language === 'ar' ? 'إضافة إلى عربة التسوق' : 'Add to Shopping Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intelligent / Personalized Upsells Suggestions Grid */}
                {recommendations.length > 0 && (
                  <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
                    <h4 className="text-xs font-black uppercase tracking-wider text-teal-600 flex items-center gap-1 mb-3">
                      <Sparkles className="w-4 h-4 animate-bounce" />
                      {language === 'ar' ? 'مقترحات مخصصة لزيادة مبيعاتك (قد تعجبك أيضاً)' : 'Personalized AI Recommendations (You May Also Like)'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:border-teal-500/50 transition-colors"
                        >
                          <img
                            src={rec.image}
                            alt={rec.nameEn}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h5 className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
                              {language === 'ar' ? rec.nameAr : rec.nameEn}
                            </h5>
                            <span className="text-xs text-teal-600 font-black">{rec.price} EGP</span>
                            
                            {/* Fast direct add */}
                            <button
                              onClick={() => {
                                addToCart(rec, 1);
                                setCartOpen(true);
                              }}
                              className="text-[9px] text-teal-600 dark:text-teal-400 block hover:underline"
                            >
                              {language === 'ar' ? '+ أضف خاطفاً للسلة' : '+ Fast Add'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ratings & Reviews Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {/* Reviews List */}
                  <div className="md:col-span-7 space-y-4">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-teal-600" />
                      {language === 'ar' ? 'مراجعات ومصداقية المتسوقين' : 'Shopper Ratings & Feedback'}
                    </h4>

                    {selectedProduct.reviews.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic py-4">
                        {language === 'ar' 
                          ? 'لا توجد مراجعات لهذا المنتج بعد. كن أول من يضيف مراجعة إيجابية!' 
                          : 'No reviews yet for this product. Be the first to add one below!'}
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2" id="reviews-viewport">
                        {selectedProduct.reviews.map((rev) => (
                          <div key={rev.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                {rev.userName}
                              </span>
                              <span className="text-[10px] text-zinc-400">{rev.date}</span>
                            </div>
                            <div className="flex text-amber-500 mb-1.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submission Form */}
                  <div className="md:col-span-5 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 block">
                      {language === 'ar' ? 'قيِّم هذا المنتج واكتب مراجعتك' : 'Review this Product'}
                    </h4>
                    
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder={language === 'ar' ? 'اسمك الكريم' : 'Your Name'}
                          className="w-full p-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-400">{language === 'ar' ? 'النجوم:' : 'Stars:'}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <button
                              type="button"
                              key={stars}
                              onClick={() => setReviewRating(stars)}
                              className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${reviewRating >= stars ? 'fill-current' : 'text-zinc-300 dark:text-zinc-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <textarea
                          required
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={language === 'ar' ? 'اكتب انطباعك بخصوص جودة السلعة وسرعة التوصيل...' : 'Write your honest thoughts about shipping speed and quality...'}
                          className="w-full p-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'ar' ? 'تقديم المراجعة والتقييم' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
