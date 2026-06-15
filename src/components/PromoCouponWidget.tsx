/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PromoCoupon } from '../types';
import { Zap, Copy, Check, Ticket, Award, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromoCouponWidgetProps {
  onApplyCoupon?: (coupon: PromoCoupon) => void;
  appliedCouponId?: string | null;
  mode?: 'cart' | 'checkout' | 'catalog';
}

export const PromoCouponWidget: React.FC<PromoCouponWidgetProps> = ({
  onApplyCoupon,
  appliedCouponId,
  mode = 'cart'
}) => {
  const { cart, promoCoupons, language } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Computations for Cart eligibility
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Helper to check if a coupon satisfies constraints
  const getCouponStatus = (coupon: PromoCoupon) => {
    // 1. Check active
    if (!coupon.isActive) return { eligible: false, lockedReason: 'Inactive' };

    // 2. Check Min Cart Total
    const totalMet = cartTotal >= coupon.minCartTotal;

    // 3. Check Category constraint
    let categoryMet = true;
    if (coupon.requiredCategory !== 'all') {
      categoryMet = cart.some(item => item.product.category === coupon.requiredCategory);
    }

    // 4. Check Items Count constraint
    let countMet = true;
    if (coupon.requiredCategory !== 'all') {
      const catCount = cart
        .filter(item => item.product.category === coupon.requiredCategory)
        .reduce((sum, item) => sum + item.quantity, 0);
      countMet = catCount >= coupon.minItemsCount;
    } else {
      countMet = cartItemCount >= coupon.minItemsCount;
    }

    const eligible = totalMet && categoryMet && countMet;

    // Compile precise progress feedback for locked coupons if they are partially unlocked
    let progressPercent = 0;
    let missingAmount = 0;
    let missingItems = 0;
    let categoryRequiredTextEn = '';
    let categoryRequiredTextAr = '';

    if (!totalMet) {
      missingAmount = coupon.minCartTotal - cartTotal;
      progressPercent = Math.min(95, Math.round((cartTotal / coupon.minCartTotal) * 100));
    }

    if (!categoryMet) {
      const catLabels: Record<string, { ar: string; en: string }> = {
        mobiles: { ar: 'الموبايلات', en: 'Mobiles' },
        electronics_accessories: { ar: 'الإكسسوارات الإلكترونية', en: 'Electronic Accessories' },
        video_games: { ar: 'ألعاب الفيديو', en: 'Video Games' },
        perfumes: { ar: 'العطور', en: 'Perfumes' },
        laptops: { ar: 'الأجهزة المحمولة', en: 'Laptops' },
        cosmetics: { ar: 'مستحضرات التجميل', en: 'Cosmetics' },
        home_kitchen: { ar: 'المنزل والمطبخ', en: 'Home & Kitchen' },
        others: { ar: 'الأخرى', en: 'Others' }
      };
      const label = catLabels[coupon.requiredCategory] || { ar: coupon.requiredCategory, en: coupon.requiredCategory };
      categoryRequiredTextAr = label.ar;
      categoryRequiredTextEn = label.en;
    }

    if (!countMet) {
      if (coupon.requiredCategory !== 'all') {
        const catCount = cart
          .filter(item => item.product.category === coupon.requiredCategory)
          .reduce((sum, item) => sum + item.quantity, 0);
        missingItems = coupon.minItemsCount - catCount;
      } else {
        missingItems = coupon.minItemsCount - cartItemCount;
      }
    }

    return {
      eligible,
      progressPercent,
      missingAmount,
      missingItems,
      categoryRequiredTextAr,
      categoryRequiredTextEn
    };
  };

  const handleCopy = (coupon: PromoCoupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!promoCoupons || promoCoupons.length === 0) return null;

  // Segment coupons into eligible and close but locked to motivate purchasing
  const eligibleCoupons: Array<{ coupon: PromoCoupon; status: ReturnType<typeof getCouponStatus> }> = [];
  const lockedCoupons: Array<{ coupon: PromoCoupon; status: ReturnType<typeof getCouponStatus> }> = [];

  promoCoupons.forEach(coupon => {
    if (!coupon.isActive) return;
    const status = getCouponStatus(coupon);
    if (status.eligible) {
      eligibleCoupons.push({ coupon, status });
    } else {
      // Only display locked coupons in the cart/checkout to push user targets, don't overwhelm with irrelevant ones
      // Show if user has some items, OR if cart total is > 10% of code minimum
      if (cartTotal > 0 || mode === 'catalog') {
        lockedCoupons.push({ coupon, status });
      }
    }
  });

  return (
    <div className="space-y-4" id="coupons-marketing-widget">
      {/* 1. ELIGIBLE ACTIVE SAVINGS (STYLING MATCHING USER ATTACHMENT IMAGE) */}
      {eligibleCoupons.length > 0 && (
        <div className="space-y-3">
          {mode !== 'checkout' && (
            <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'ar' ? 'العروض المتاحة لمشترياتك الحالية ✨' : 'Eligible Promos for Your Current Cart ✨'}
            </h5>
          )}

          {eligibleCoupons.map(({ coupon, status }) => {
            const isApplied = appliedCouponId === coupon.id;
            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 dark:bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 md:p-5 text-right relative overflow-hidden select-none hover:border-teal-700/50 transition-all shadow-xl"
                style={{ direction: 'rtl' }}
                id={`eligible-promo-card-${coupon.id}`}
              >
                {/* Micro Ambient background glow */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                {/* Top Section */}
                <div className="flex items-start justify-between gap-4 mb-3 border-b border-slate-800/60 pb-3">
                  {/* Left Side: Dynamic Discount Value Badge */}
                  <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex-shrink-0 flex items-center gap-1 font-mono">
                    {coupon.discountType === 'free_shipping' ? (
                      <>
                        <span>EGP</span>
                        <span>0</span>
                      </>
                    ) : coupon.discountType === 'percentage' ? (
                      <span>{coupon.discountValue}% OFF</span>
                    ) : (
                      <span>{coupon.discountValue} EGP</span>
                    )}
                  </div>

                  {/* Right Side: Title with Flash Icon */}
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="text-sm font-black text-slate-100 font-sans tracking-tight">
                      {language === 'ar' ? coupon.titleAr : coupon.titleEn}
                    </span>
                    <span className="text-amber-500 animate-pulse">
                      <Zap className="w-4 h-4 fill-amber-500" />
                    </span>
                  </div>
                </div>

                {/* Subtitle/Description in White/Light-Gray */}
                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4 text-right">
                  {language === 'ar' ? coupon.descriptionAr : coupon.descriptionEn}
                </p>

                {/* Code Card and Copy Panel */}
                <div className="bg-slate-900/95 border border-dashed border-slate-850 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
                  {/* Monospaced Centered Coupon code */}
                  <span className="font-mono text-sm tracking-widest text-[#5294e2] font-black uppercase text-center flex-grow py-1">
                    {coupon.code}
                  </span>

                  {/* Actions (Copy + Apply) */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    {/* Copy Code button */}
                    <button
                      onClick={() => handleCopy(coupon)}
                      className="flex-grow sm:flex-none p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 text-[10px] font-black cursor-pointer uppercase tracking-wider"
                      title={language === 'ar' ? 'نسخ الرمز' : 'Copy Code'}
                    >
                      {copiedId === coupon.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'نسخ الرمز' : 'Copy'}</span>
                        </>
                      )}
                    </button>

                    {/* Instant Apply Button */}
                    {onApplyCoupon && (
                      <button
                        onClick={() => onApplyCoupon(coupon)}
                        className={`flex-grow sm:flex-none py-2 px-3.5 rounded-lg text-[10px] font-black tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-1 ${
                          isApplied
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-950/45'
                        }`}
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>
                          {isApplied 
                            ? (language === 'ar' ? 'مطبّق الآن' : 'Applied') 
                            : (language === 'ar' ? 'تطبيق الكود' : 'Apply')}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer notes */}
                <span className="text-[10px] text-slate-400 font-sans block text-right">
                  {language === 'ar' ? coupon.termsDetailsAr : coupon.termsDetailsEn}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 2. LOCKED INCENTIVES (PROGRESS-BAR TRIGGERS TO MOTIVATE PURCHASING) */}
      {lockedCoupons.length > 0 && mode !== 'checkout' && (
        <div className="space-y-2 mt-4">
          <h5 className="text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1 uppercase">
            <Lock className="w-3 h-3 text-zinc-400" />
            {language === 'ar' ? 'عروض وقسائم تحتاج لشروط لتفعيلها 🔒' : 'Eligible Offers to Unlock 🔒'}
          </h5>

          {lockedCoupons.map(({ coupon, status }) => {
            return (
              <div
                key={coupon.id}
                className="bg-zinc-100/60 dark:bg-zinc-950/30 border border-zinc-200/50 dark:border-zinc-850 rounded-xl p-3.5 relative overflow-hidden text-right"
                style={{ direction: 'rtl' }}
                id={`locked-promo-card-${coupon.id}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-[10px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 font-bold px-1.5 py-0.5 rounded-md font-mono">
                    {coupon.code}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {language === 'ar' ? coupon.titleAr : coupon.titleEn}
                    </span>
                    <Lock className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                  </div>
                </div>

                {/* Condition guide description */}
                <div className="text-[10.5px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed text-right mb-2">
                  {status.missingAmount > 0 && (
                    <p className="font-extrabold text-amber-600 dark:text-amber-500">
                      {language === 'ar'
                        ? `أضف بقيمة ${status.missingAmount} جنيه أخرى لتفعيل الشحن المجاني/العرض لهذا اليوم!`
                        : `Add ${status.missingAmount} EGP more to activate free shipping!`}
                    </p>
                  )}
                  {status.missingItems > 0 && (
                    <p className="font-bold text-indigo-500">
                      {language === 'ar'
                        ? `يتطلب شراء عدد ${coupon.minItemsCount} قطع على الأقل ${
                            coupon.requiredCategory !== 'all' ? `من قسم (${status.categoryRequiredTextAr})` : ''
                          }`
                        : `Requires purchasing at least ${coupon.minItemsCount} items ${
                            coupon.requiredCategory !== 'all' ? `of category (${status.categoryRequiredTextEn})` : ''
                          }`}
                    </p>
                  )}
                  {(!status.missingAmount && !status.missingItems && coupon.requiredCategory !== 'all' && !cart.some(i => i.product.category === coupon.requiredCategory)) && (
                    <p className="font-bold text-zinc-500">
                      {language === 'ar'
                        ? `يتطلب إضافة منتج واحد على الأقل من فئة (${status.categoryRequiredTextAr})`
                        : `Requires at least one product from category (${status.categoryRequiredTextEn})`}
                    </p>
                  )}
                </div>

                {/* Small Progress bar */}
                {status.progressPercent > 0 && (
                  <div className="w-full bg-zinc-200 dark:bg-zinc-850 h-1.5 rounded-full overflow-hidden mt-1 text-left">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${status.progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
