/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShoppingBag, MapPin, ShieldCheck, HeartHandshake, Eye, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { VendoraIcon } from './VendoraLogo';

export const Onboarding: React.FC = () => {
  const { showWalkthrough, dismissWalkthrough, language } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showWalkthrough) return null;

  const steps = [
    {
      icon: <VendoraIcon size={80} />,
      titleEn: 'Welcome to Vendora 🌟',
      titleAr: 'مرحباً بك في منصة Vendora 🌟',
      textEn: 'Your premier multi-vendor marketplace for livestock feed, agricultural supplies, veterinary pharmaceuticals, consumer goods, and spare parts. Enjoy an outstanding experience built for you.',
      textAr: 'منصتك المتميزة والأولى لتداول ماركات الأعلاف الحيوانية والدواجن، المستلزمات الزراعية، الأدوية البيطرية، وقطع الغيار في مصر مع خدمة الشحن الفوري والتتبع التفاعلي.',
    },
    {
      icon: <ShoppingBag className="w-12 h-12 text-teal-500" />,
      titleEn: 'Multi-Vendor Catalogs 🛍️',
      titleAr: 'دليل المنتجات وكبار التجار 🛍️',
      textEn: 'Filter livestock feeds, certified veterinary supplements, agri machinery parts, and premium items. Preview authentic merchant ratings and product reviews seamlessly.',
      textAr: 'تصفح وقارن بسهولة بين الأعلاف المصنعة، المكملات البيطرية المعتمدة، قطع الغيار، ومختلف مستلزمات المزارع بأسعار حقيقية مباشرة ومراجعات نزيهة.',
    },
    {
      icon: <MapPin className="w-12 h-12 text-rose-500" />,
      titleEn: 'Live Egypt Tracking Map 🗺️',
      titleAr: 'تتبع الشحنات بخريطة تفاعلية حية 🗺️',
      textEn: 'We designed a live interactive map of Egypt! When you place an order, lookup its status to see exactly where the courier is in real-time between Suez, Cairo, Mansoura, and Alexandria.',
      textAr: 'صممنا لك خريطة تفاعلية حية لجمهورية مصر العربية! عند إتمام أي طلب، أدخل كود التتبع لترى بوضوح مسار الشحنة وموقع المندوب الجغرافي لحظة بلحظة.',
    },
    {
      icon: <ShieldCheck className="w-12 h-12 text-emerald-500" />,
      titleEn: 'Secure Multi-Option Checkout 🔒',
      titleAr: 'بوابة دفع آمنة ومتعددة الخيارات 🔒',
      textEn: 'Pay absolutely safely using credit cards, Instapay wallets, Egyptian Meeza cards, or Cash on Delivery. Live email and WhatsApp delivery logs are triggered instantly!',
      textAr: 'تسوق بأمان تام مع باقة دفع متنوعة تضمن لك الراحة (البطاقات البنكية، محفظة إنستاباي الذكية، بطاقة ميزة الوطنية، أو الدفع نَقداً عند الاستلام) مع إشعارات فورية.',
    },
    {
      icon: <HeartHandshake className="w-12 h-12 text-indigo-500" />,
      titleEn: 'Active Support Chat & Admin Mode 🛠️',
      titleAr: 'دعم فني فوري ولوحة تحكم شاملة 🛠️',
      textEn: 'Get instant feedback using our Live Technical Support Chat, file suggestions/complaints, and toggle "Admin Mode" anytime to dispatch orders and view financial reports.',
      textAr: 'تواصل مباشرة مع فريق الخدمة عبر شات الدعم المباشر، وأرسل شكواك أو مقترحك، كما يمكنك الانتقال لـ "وضع المدير" لتحديث حالة الشحن ومتابعة الأرباح والتقارير المالية.',
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      dismissWalkthrough();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm" id="onboarding-overlay">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop dismiss helper */}
        <div className="fixed inset-0 -z-10" onClick={dismissWalkthrough} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 text-start align-middle max-h-[88vh] flex flex-col"
          id="onboarding-card"
        >
          {/* Banner with close button */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-shrink-0">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
              {language === 'ar' ? 'دليل البدء السريع لمنصة Vendora' : 'Vendora Quick Tour'}
            </span>
            <button
              onClick={dismissWalkthrough}
              className="p-1 text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              id="onboarding-close-btn"
              title={language === 'ar' ? 'إغلاق الدليل' : 'Skip Tour'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content body */}
          <div className="p-8 text-center overflow-y-auto flex-1" id="onboarding-content">
          <div className="flex justify-center mb-6">
            <motion.div
              key={currentStep}
              initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl shadow-inner inline-block"
            >
              {step.icon}
            </motion.div>
          </div>

          <h3 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white" id="onboarding-title">
            {language === 'ar' ? step.titleAr : step.titleEn}
          </h3>

          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm min-h-[85px]" id="onboarding-text">
            {language === 'ar' ? step.textAr : step.textEn}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 mt-8" id="onboarding-indicators">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-teal-600' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation actions */}
        <div className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0" id="onboarding-nav">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-zinc-400 cursor-not-allowed'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            id="onboarding-prev-btn"
          >
            {language === 'ar' ? (
              <>
                <ArrowRight className="w-4 h-4" /> السابق
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" /> Previous
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            id="onboarding-next-btn"
          >
            {currentStep === steps.length - 1 ? (
              language === 'ar' ? 'بدء التسوق 🚀' : 'Start Shopping 🚀'
            ) : language === 'ar' ? (
              <>
                التالي <ArrowLeft className="w-4 h-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};
