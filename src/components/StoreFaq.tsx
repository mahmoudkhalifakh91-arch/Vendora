/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../context/StoreContext';
import { BookOpen, MapPin, Zap, CreditCard, PenTool, ShieldCheck } from 'lucide-react';

export const StoreFaq: React.FC = () => {
  const { language } = useStore();

  const sections = [
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      titleEn: 'Quick Start & Guided Tour 🚶‍♂️',
      titleAr: 'البدء السريع والجولة الإرشادية 🚶‍♂️',
      descEn: 'When you visit Vendora for the first time, a walkthrough is activated introducing the interface components. You can reset and re-launch this tour anytime from the Help section.',
      descAr: 'عند زيارة منصة Vendora لأول مرة، يظهر لك معالج تعريفي تلقائي متكامل يشرح خصائص الأقسام. يمكنك إعادة تفعيل هذه الجولة الإرشادية في أي وقت من قسم مساعدة المتجر.',
    },
    {
      icon: <MapPin className="w-5 h-5 text-teal-600" />,
      titleEn: 'Interactive Live GPS Road Map Egypt 🗺️',
      titleAr: 'تتبع الشحنات بخارطة الطريق التفاعلية بمصر 🗺️',
      descEn: 'We engineered a vector simulation of the Egyptian roads network. Once an order is placed, lookup its tracking code in the navigation bar to see a delivery truck move in real-time from our Cairo Logistics Center to your selected Governorate.',
      descAr: 'قمنا بتطوير نموذج محاكاة ذكي لشبكة الطرق السريعة بمصر. بمجرد إتمام الطلب، ابحث بكود تتبعك بالشريط العلوي لترى بوضوح حركة سيارة الشحن الحية تنتقل من مركز توزيع القاهرة الرئيسي حتى بوابات محافظتك.',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-blue-500" />,
      titleEn: 'Secure Local Payment Gateways 💳',
      titleAr: 'تأمين المشتريات وبوابات الدفع المحلية 💳',
      descEn: 'Shop seamlessly using secure and varied gateways: standard Credit Card/VISA, Instapay mobile banks network, Meeza national cards, or Cash on Delivery. Card hashes are fully protected in-app.',
      descAr: 'ادفع بأمان وراحة بنسبة 100٪ من خلال باقة متميزة: فيزا/ماستر كارد مشفر، حسابات إنستاباي القومية للبنوك، بطاقات ميزة للأفراد، أو الدفع كاش عند استلام البضائع.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
      titleEn: 'Suggestions & Complaints Escalation (Egypt Support) 📝',
      titleAr: 'منظومة حماية المستهلك والشكاوى المباشرة 📝',
      descEn: 'File active suggestions or complaints regarding products or delivery. The support desk processes complaints within 12 hours. Automated ticket assistance is triggered inside your live support chat box.',
      descAr: 'أرسل شكواك أو مقترحك بكل شفافية عبر تذكرة حماية المستهلك. تلتزم الإدارة بفرز الطلبات وحل النزاعات خلال ليلة واحدة. تابع تذكرتك ورقم الاستجابة الفوري بمربع شات الدعم المباشر بأسفل يمين المتجر.',
    },
    {
      icon: <PenTool className="w-5 h-5 text-purple-500" />,
      titleEn: 'Interactive Admin Control Tips 🛠️',
      titleAr: 'تلميحات هامة لتجربة لوحة تحكم المدير 🛠️',
      descEn: 'Toggle "Admin Mode" in the navbar to test administrative operations. You can create brand new products, inventory stocks, update order status and inspect delivery SMS & logs issued.',
      descAr: 'انتقل لـ "تبويب لوحة المدير" أعلى شريط التنقل لتجربة دور الإدارة. يمكنك بنقرة واحدة إدراج سلع جديدة بالمتجر، فرز التذاكر، وتحديث وضع شحنات العملاء المسجلة لمراقبة حركة المندوب الحيوية على الخريطة.',
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-6" id="faq-handbook-container">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-8 h-8 text-teal-600" />
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
            {language === 'ar' ? 'دليل مستخدم وعميل منصة Vendora' : 'Comprehensive User Guidebook & FAQ'}
          </h2>
          <p className="text-xs text-zinc-400">
            {language === 'ar'
              ? 'نهتم بتجربة تصفحك وتسهيل خيارات الشراء وتتبع الطلب والدعم الفني المباشر.'
              : 'Detailed operational manuals helping you navigate deliveries, secure checkout gateways, support channels, and admin telemetry.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="faq-cards-grid">
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800">
                {sec.icon}
              </span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                {language === 'ar' ? sec.titleAr : sec.titleEn}
              </h4>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {language === 'ar' ? sec.descAr : sec.descEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
