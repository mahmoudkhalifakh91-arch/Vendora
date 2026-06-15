/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Phone, MapPin, Building2, Store, Link, FileText, CheckCircle2, Lock, ArrowRight, UserPlus } from 'lucide-react';

interface SellerRegistrationProps {
  onSuccess: () => void;
}

export const SellerRegistration: React.FC<SellerRegistrationProps> = ({ onSuccess }) => {
  const { registerSeller, language, currentUser } = useStore();

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    password: '',
    storeName: '',
    contactAddress: '',
    bioAr: '',
    bioEn: '',
    logo: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=60'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [agreedCommissions, setAgreedCommissions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!agreedCommissions) {
      setErrorMsg(language === 'ar' 
        ? 'يجب الموافقة أولاً على نسبة العمولة ووثيقة سياسات تداول البذور والأعلاف بمصر.' 
        : 'You must agree to the platform commission and regulatory compliance standards.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.storeName || !formData.contactAddress) {
      setErrorMsg(language === 'ar' ? 'يرجى مراجعة وتعبئة كل الخانات المطلوبة.' : 'Please enter all required business metadata.');
      return;
    }

    // Since registerSeller expects a password hash, we can use the plain password if they enter one, or pass a placeholder if already logged in
    const passwordToSend = formData.password || 'Seller_Secure_2026';

    const res = registerSeller({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      passwordHash: passwordToSend,
      storeName: formData.storeName,
      bioAr: formData.bioAr || formData.storeName,
      bioEn: formData.bioEn || formData.storeName,
      contactAddress: formData.contactAddress,
      logo: formData.logo,
      banner: formData.banner
    });

    if (res.success) {
      setSuccessMsg(language === 'ar'
        ? 'تم تقديم طلب الشراكة لمؤسسة Vendora بنجاح! سيتم التحقق من مستودعك والموافقة على لوحة التحكم للتجارة بمجرد تدقيق الأوراق.'
        : 'Merchant application sent successfully! Our administrative auditors will review your feed/veterinary permits.');
      
      // Delay to fire callback and refresh tabs
      setTimeout(() => {
        onSuccess();
      }, 4000);
    } else {
      setErrorMsg(language === 'ar' ? res.errorAr : res.errorEn);
    }
  };

  return (
    <div id="seller-registration-canvas" className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-150 dark:border-zinc-900 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Decorative compliance vertical banner */}
        <div className="lg:col-span-4 bg-gradient-to-br from-teal-700 to-indigo-900 p-8 text-white flex flex-col justify-between relative">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500')` }} />
          <div className="space-y-6 relative z-10">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/10">
              {language === 'ar' ? 'شريك توريد معتمد' : 'VENDORA VENDOR UNION'}
            </span>
            <h3 className="text-2xl font-black tracking-tight leading-snug">
              {language === 'ar' ? 'ابدأ بيع خامات الأعلاف ومستلزمات الري اليوم 🌾' : 'Expand your Feed & Veterinary Business Online'}
            </h3>
            <p className="text-xs text-zinc-150 leading-relaxed font-medium">
              {language === 'ar'
                ? 'انضم إلى أكبر منصة متكاملة لربط مستودعات الأعلاف، مستوردي الحبوب والمكملات، والعيادات البيطرية بكافة المزارع والمربين بمصر.'
                : 'Instantly connect with Egypt’s biggest farming feedlots, poultry growers, and localized mills searching for certified batches.'}
            </p>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/10 mt-8 text-[11px] relative z-10 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
              <span>{language === 'ar' ? 'توزيع مجزأ وتنشيط فوري' : 'Automated Invoice Distribution'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
              <span>{language === 'ar' ? 'لوحة تحكم وتصنيفات مخصصة' : 'Low Stock Warning Analytics'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
              <span>{language === 'ar' ? 'استلام تسويات فوري إنستاباي' : 'Direct Instapay Cashouts'}</span>
            </div>
          </div>
        </div>

        {/* Form elements */}
        <div className="lg:col-span-8 p-6 md:p-10 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white" id="registration-form-title">
              {language === 'ar' ? 'بيانات طلب تسجيل التاجر الزراعي' : 'Apply for Supplier Merchant Portal'}
            </h2>
            <p className="text-xs text-zinc-500">
              {language === 'ar' 
                ? 'يرجى تقديم بيانات معتمدة لتفادي رفض الطلب وضمان التوافق مع دليل التجارة بوزارة التموين.' 
                : 'Registration data undergoes vetting under Ministry guidelines. Standard global fee structure is 10% commission.'}
            </p>
          </div>

          {errorMsg && (
            <div id="reg-error-box" className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div id="reg-success-box" className="p-4 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 dark:text-emerald-400 font-black rounded-xl text-xs space-y-1">
              <p>🎉 {successMsg}</p>
              <p className="text-[10px] font-medium text-zinc-500">{language === 'ar' ? 'جاري توجيهك الآن...' : 'Redirecting processing...'}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {/* Split row - Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'اسم التاجر أو المسئول بالكامل' : 'Full Merchant Name'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <UserPlus className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: المهندس محمد الشاذلي' : 'e.g., Eng. Mohamed El-Shazly'}
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'البريد الإلكتروني التجاري للتسجيل' : 'Business Email for login'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@agri-hub.eg"
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Split row - Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'رقم التليفون / تواصل واتس آب' : 'WhatsApp Contact / Mobile'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {!currentUser && (
                <div className="space-y-1">
                  <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'كلمة المرور المشفرة للوحة' : 'Secure Admin Secret Password'}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Business info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'اسم المتجر أو المؤسسة الموزعة' : 'Your Professional Store Name'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <Store className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: الأهرام لتسمين الدواجن وعلف الحبوب' : 'e.g., Al-Ahram Broiler Feeds & Grain Mill'}
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'عنوان المخزن أو المنفذ الرئيسي بالتفصيل' : 'Warehouse / Mill Contact Address'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    required
                    type="text"
                    value={formData.contactAddress}
                    onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                    placeholder={language === 'ar' ? 'مثال: المنطقة الصناعية ب، السادات، المنوفية' : 'e.g., Industrial Zone B, Sadat City, Menofia'}
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Profile configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'رابط شعار المتجر (رابط صورة)' : 'Store Custom Logo URL'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <Link className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-650 dark:text-zinc-300">{language === 'ar' ? 'رابط البانر الترويجي (رابط صورة)' : 'Store Custom Banner URL'}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center text-zinc-400">
                    <Link className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={formData.banner}
                    onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                    className="w-full pl-9 pr-3 rtl:pr-9 rtl:pl-3 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-mono text-[10px]"
                  />
                </div>
              </div>
            </div>

            {/* Description Arabic and English */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-zinc-655 dark:text-zinc-300">{language === 'ar' ? 'نبذة عن منتجاتك بالعربية' : 'Store Bio (Arabic)'}</label>
                <textarea
                  value={formData.bioAr}
                  onChange={(e) => setFormData({ ...formData, bioAr: e.target.value })}
                  placeholder="مستودع رائد لتوزيع علف الماشية معتمد بالكامل من الهيئة..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-655 dark:text-zinc-300">{language === 'ar' ? 'نبذة بالإنجليزية للأجانب' : 'Store Bio (English)'}</label>
                <textarea
                  value={formData.bioEn}
                  onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                  placeholder="A premium supplier specialized in animal proteins, poultry mixes..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Direct Compliance checkboxes */}
            <div className="p-4 bg-zinc-55 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-3">
              <h4 className="font-extrabold text-[10px] text-teal-600 uppercase tracking-widest">{language === 'ar' ? 'سياسات التوريد والعمولات لمصر' : 'Farming compliance & Terms'}</h4>
              <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={agreedCommissions}
                  onChange={(e) => setAgreedCommissions(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="leading-snug">
                  {language === 'ar'
                    ? 'أوافق على قيام شركة Vendora بخصم عمولة قدرها 10% تلقائيا للخدمة الفنية وتأمين الشحن لعملاء مصر عند نجاح تسليم الفاتورة للعميل في محفظتي الإلكترونية.'
                    : 'I permit Vendora marketplace to deduct the baseline 10% platform commission from final checkout invoices when orders achieve state "Delivered".'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              id="submit-merchant-app-btn"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white p-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-xs font-black"
            >
              <ShieldCheck className="w-4 h-4 text-white" />
              {language === 'ar' ? 'تقديم طلب التسجيل الفوري للتاجر' : 'Deliver and Send Business Registration'}
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
