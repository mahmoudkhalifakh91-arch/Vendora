/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Seller } from '../types';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Calendar, 
  CalendarDays, 
  ShieldCheck, 
  Sparkles, 
  Boxes, 
  ShoppingBag, 
  TrendingUp, 
  ChevronRight,
  Clock
} from 'lucide-react';

interface VendorStorePageProps {
  sellerId: string;
  onBack: () => void;
}

export const VendorStorePage: React.FC<VendorStorePageProps> = ({ sellerId, onBack }) => {
  const { sellers, products, language, addToCart, setCartOpen } = useStore();

  const seller = useMemo(() => {
    return sellers.find(s => s.id === sellerId) || null;
  }, [sellers, sellerId]);

  const sellerProducts = useMemo(() => {
    return products.filter(p => p.sellerId === sellerId);
  }, [products, sellerId]);

  // Extract average reviews and statistics
  const metrics = useMemo(() => {
    if (!seller) return { rating: 5.0, reviewsCount: 0, lowStock: false };
    const reviews = sellerProducts.flatMap(p => p.reviews);
    const avgRating = reviews.length > 0 
      ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
      : seller.rating || 5.0;
    
    return {
      rating: avgRating,
      reviewsCount: reviews.length || seller.reviewsCount || 0
    };
  }, [seller, sellerProducts]);

  if (!seller) {
    return (
      <div id="vendor-not-found" className="p-12 text-center text-zinc-400 space-y-4 max-w-lg mx-auto">
        <p className="text-sm font-bold">{language === 'ar' ? 'عفواً، لم نتمكن من العثور على هذا المتجر الشريك.' : 'Ops, this registered vendor cannot be loaded.'}</p>
        <button 
          onClick={onBack} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer text-xs"
        >
          {language === 'ar' ? 'الرجوع للمتجر الأساسي' : 'Back to marketplace catalog'}
        </button>
      </div>
    );
  }

  return (
    <div id={`vendor-store-page-${sellerId}`} className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* Back CTA Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 p-2 px-4 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-black rounded-xl shadow-xs border border-zinc-150 dark:border-zinc-850 transition-all cursor-pointer"
        id="back-to-catalog-cta-btn"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {language === 'ar' ? 'الرجوع ومتابعة تسوق الأعلاف المنتجة لمصر' : 'Purchase Feed, Spares & Back to Board'}
      </button>

      {/* Brand Profile Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900 shadow-xl" id="vendor-store-header-panel">
        <div className="h-44 md:h-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10" />
          <img 
            src={seller.banner} 
            alt={`${seller.storeName} banner`} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-6 md:p-8 relative -mt-16 md:-mt-20 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-950 bg-zinc-100 shadow-lg shrink-0">
              <img 
                src={seller.logo} 
                alt={`${seller.storeName} brand logo`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1.5 md:mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-3.5xl font-black text-zinc-950 dark:text-white leading-tight">
                  {seller.storeName}
                </h1>
                <span className="bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-wider border border-teal-200/50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'فحص زراعي معتمد' : 'Compliance Audited'}
                </span>
              </div>

              <p className="text-zinc-650 dark:text-zinc-400 text-xs font-bold flex items-center gap-1 flex-wrap">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>{seller.contactAddress}</span>
              </p>

              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-350 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {metrics.rating} ({metrics.reviewsCount} {language === 'ar' ? 'تقييم من مربين معتمدين' : 'feed reviews'})
                </span>
                <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                  {language === 'ar' ? 'عضو منذ ٢٠٢٦' : `Partner Since ${seller.joinedDate}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <a 
              href={`tel:${seller.phone}`}
              className="py-2.5 px-4 bg-white hover:bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold rounded-xl flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
              {language === 'ar' ? 'تواصل معنا' : 'Contact Vendor'}
            </a>
          </div>
        </div>
      </div>

      {/* Biography and Catalog split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Biography Block */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-4">
          <h3 className="text-sm font-black text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-2.5 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            {language === 'ar' ? 'رسالة المهندس المعملي للشركة' : 'Our Professional Bio'}
          </h3>
          <p className="text-xs text-zinc-650 dark:text-zinc-405 leading-relaxed font-semibold">
            {language === 'ar' ? seller.bioAr : seller.bioEn}
          </p>

          <div className="pt-2 space-y-3 text-[11px] font-bold text-zinc-500">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>{seller.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-600" />
              <span>{seller.phone}</span>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl text-[10px] leading-relaxed text-zinc-400 font-medium">
            🧬 {language === 'ar' 
              ? 'إن كافة الأعلاف المعالجة والأدوية المسلحة والشبكات المعروضة بمتجرنا مفحوصة ومعالجة حرارياً ضد الأفلاتوكسين لضمان كلى لمعاملات التحويل والأمن الحيوي بمصر.' 
              : 'All poultry and aquaculture elements in our directory are double-checked to contain certified safe organic contents.'}
          </div>
        </div>

        {/* Filtered Store Catalog Block */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-3" id="catalog-header-bar">
            <div>
              <h3 className="text-lg font-black text-zinc-950 dark:text-white">
                {language === 'ar' ? 'تشكيلات وخامات متوفرة جاهزة للشحن' : 'All Feeds & Engineering Materials Available'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'ar' ? 'اطلب احتياجك ليتم توجيه مندوب تسليم المستودع إليك مباشرة.' : 'Invoiced and delivered to your farm from Saddat and Delta warehouses.'}
              </p>
            </div>
            <span className="text-xs font-mono bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-350 px-3 py-1.5 rounded-xl font-bold">
              {sellerProducts.length} {language === 'ar' ? 'منتج معروض' : 'items'}
            </span>
          </div>

          {/* Catalog grid */}
          {sellerProducts.length === 0 ? (
            <div className="p-16 text-center text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
              <Boxes className="w-12 h-12 mx-auto mb-3 text-zinc-250" />
              <p className="text-xs">{language === 'ar' ? 'لا توجد خامات معروضة حالياً.' : 'Catalog is temporarily offline.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="vendor-store-catalog-grid">
              {sellerProducts.map(prod => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = !isOutOfStock && prod.stock <= (prod.minStockLevel || 10);
                
                return (
                  <div key={prod.id} className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900/70 p-4 rounded-3xl hover:shadow-md transition-all flex flex-col justify-between gap-4" id={`product-retail-${prod.id}`}>
                    <div className="space-y-3">
                      <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-zinc-100 border border-zinc-100/40 dark:border-zinc-900">
                        <img 
                          src={prod.image} 
                          alt={prod.nameEn} 
                          className="w-full h-full object-cover select-none"
                          referrerPolicy="no-referrer"
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-3xs flex items-center justify-center text-xs font-black text-white px-2 mt-0 uppercase tracking-widest">
                            {language === 'ar' ? 'نفد من الصومعة' : 'Silo Empty'}
                          </div>
                        )}
                        {isLowStock && (
                          <span className="absolute top-2 left-2 bg-amber-500 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wide">
                            {language === 'ar' ? 'كمية محدودة' : 'Limited Stock'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-400 font-mono font-bold uppercase">
                          <span>{prod.category.replace('_', ' ')}</span>
                          {prod.batchNumber && <span>BCH: {prod.batchNumber}</span>}
                        </div>
                        <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm line-clamp-1">
                          {language === 'ar' ? prod.nameAr : prod.nameEn}
                        </h4>
                        <p className="text-zinc-500 text-[11px] line-clamp-2 leading-relaxed font-semibold">
                          {language === 'ar' ? prod.descriptionAr : prod.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex items-center justify-between text-xs font-bold gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{language === 'ar' ? 'سعر الوحدة' : 'Retail Price'}</p>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400 font-sans">{prod.price.toLocaleString()} <span className="text-[10px] font-bold">EGP</span></p>
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => { addToCart(prod, 1); setCartOpen(true); }}
                        className={`py-2 px-4 rounded-xl cursor-pointer text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
                          isOutOfStock
                            ? 'bg-zinc-100 text-zinc-405 dark:bg-zinc-900 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                        }`}
                        id={`btn-cart-${prod.id}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-white" />
                        {language === 'ar' ? 'إضافة للعربة' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
