/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';

interface HeroProps {
  setActiveTab: (tab: 'shop' | 'track' | 'feedback' | 'guide' | 'admin') => void;
}

export const Hero: React.FC<HeroProps> = ({ setActiveTab }) => {
  const { language } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 via-slate-900 to-zinc-900 text-white rounded-3xl mx-4 md:mx-8 mt-6 p-8 md:p-12 shadow-xl border border-teal-500/15" id="hero-banner">
      {/* Background aesthetic circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="hero-layout">
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-350 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest border border-teal-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'ar' ? 'منصة Vendora للبيع المتعدد 🇪🇬' : 'VENDORA MULTI-VENDOR MARKETPLACE 🇪🇬'}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight md:leading-none text-white font-sans" id="hero-heading">
            {language === 'ar' ? (
              <>
                كل ما تحتاجه في <span className="text-teal-400">سوق Vendora</span> واحد
              </>
            ) : (
              <>
                Everything You Need, One <span className="text-teal-400">Vendora</span> Marketplace
              </>
            )}
          </h1>

          <p className="text-zinc-300 text-sm md:text-base max-w-2xl leading-relaxed">
            {language === 'ar'
              ? 'السوق المشترك الرائد بمصر لتداول أعلاف الثروة الحيوانية والدواجن، المستلزمات الطبية والبيطرية، أجهزة الري، قطع الغيار، ومختلف المنتجات الاستهلاكية المباشرة من كبار الموردين.'
              : 'Egypt’s verified multi-vendor terminal for premium animal feeds, agricultural supplies, veterinary pharmaceuticals, consumer commodities, and industrial spare parts. Enjoy 24/7 technical assistance and intelligent tracking.'}
          </p>

          <div className="flex flex-wrap gap-2 pt-2" id="hero-quick-features">
            <span className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-medium text-emerald-300">
              <Truck className="w-3.5 h-3.5" />
              {language === 'ar' ? 'شحن فائق السرعة لكافة المحافظات' : '24h Governorate Delivery'}
            </span>
            <span className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl font-medium text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'ar' ? 'بوابة دفع آمنة (إنستاباي وميزة)' : 'Instapay & Meeza Secure'}
            </span>
          </div>

          <div className="pt-4 flex flex-wrap gap-3" id="hero-actions">
            <button
              onClick={() => setActiveTab('shop')}
              className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1 rounded-bl-none hover:shadow-lg uppercase tracking-wider"
            >
              {language === 'ar' ? 'تصفح الكتالوج الآن' : 'Explore Catalog'}
              {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 rounded-br-none"
            >
              {language === 'ar' ? 'تتبع شحنة سابقة 🗺️' : 'Track Active Order 🗺️'}
            </button>
          </div>
        </div>

        {/* Promo Coupons Card visually outstanding */}
        <div className="lg:col-span-4" id="hero-coupon-card">
          <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                {language === 'ar' ? 'قسيمة الشحن المجاني بمصر' : 'Active Shipping Coupon'}
              </span>
              <span className="text-xs font-mono font-bold bg-emerald-500/25 text-emerald-300 px-2 py-0.5 rounded">
                EGP 0
              </span>
            </div>

            <div>
              <p className="text-xs text-zinc-300 leading-normal">
                {language === 'ar'
                  ? 'استخدم كود الخصم الفوري لمضاعفة المبيعات والحصول على شحن مجاني بالكامل لكافة مشترياتك هذا اليوم.'
                  : 'Apply this auto coupon during checkout to erase governorate delivery courier fees entirely on any cart size.'}
              </p>
            </div>

            <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl border border-white/10 text-center font-mono font-black text-sm tracking-widest text-teal-300 select-all" title="Click to copy coupon">
              FREE_EGYPT
            </div>
            <span className="text-[9px] text-zinc-500 block text-center font-semibold">
              {language === 'ar' ? '*صالح لكل المحافظات والطلب الفردي' : '*Valid for all Governorates.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
