/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive User Profile screen supporting both Customer and Seller states.
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Wallet, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  ShoppingBag, 
  LogIn, 
  Edit3, 
  Check, 
  Award,
  Truck,
  DollarSign
} from 'lucide-react';
import { AuthModal } from './AuthModal';

export const UserProfile: React.FC = () => {
  const { 
    currentUser, 
    language, 
    sellers, 
    orders, 
    wallets, 
    updateUserProfile, 
    setCurrentOrderTrackingId, 
    setLanguage 
  } = useStore();

  const [authOpen, setAuthOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [editedPhone, setEditedPhone] = useState(currentUser?.phone || '');
  const [errMessage, setErrMessage] = useState<string | null>(null);
  const [sucMessage, setSucMessage] = useState<string | null>(null);

  // Load existing seller if any
  const matchedSeller = currentUser 
    ? sellers.find(s => s.email.toLowerCase() === currentUser.email.toLowerCase()) 
    : null;

  // Load wallet if seller
  const matchedWallet = (currentUser && matchedSeller) 
    ? wallets[matchedSeller.id] 
    : null;

  // Load customer orders
  const userOrders = currentUser 
    ? orders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) 
    : [];

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage(null);
    setSucMessage(null);

    if (!editedName.trim()) {
      setErrMessage(language === 'ar' ? 'الاسم لا يمكن أن يكون فارغاً.' : 'Name field cannot be blank.');
      return;
    }

    const egyptPhoneRegex = /^(\+20|0020|0)?1[0125][0-9]{8}$/;
    if (!egyptPhoneRegex.test(editedPhone)) {
      setErrMessage(
        language === 'ar'
          ? 'رقم الهاتف المصري غير صحيح (يجب أن يبدأ بـ 01 ويحتوي على 11 رقماً بالكامل).'
          : 'Invalid Egyptian mobile number. It must start with 01 and have 11 digits.'
      );
      return;
    }

    const res = updateUserProfile(editedName, editedPhone);
    if (res.success) {
      setSucMessage(language === 'ar' ? 'تم تحديث البيانات الشخصية بنجاح!' : 'Your profile details were updated.');
      setIsEditing(false);
    } else {
      setErrMessage(language === 'ar' ? 'حدث خطأ أثناء حفظ التحديثات.' : 'Error saving profile edits.');
    }
  };

  // Switch views handler
  const triggerTabChange = (tabName: 'seller-db' | 'seller-reg' | 'track') => {
    // We dispath a click event or utilize state window location or class bindings
    const tabBtn = document.querySelector(`[id="navbar-desktop-tabs"] button, [id="navbar-actions"] button`) as HTMLButtonElement;
    if (tabBtn) {
      // Find the tab button by contents or use an index.html navigation click behavior.
      // Simply dispatch an event or window location change:
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8" id="unified-profile-section">
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Guest View State */}
      {!currentUser ? (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-150 dark:border-zinc-900 p-8 text-center max-w-xl mx-auto shadow-2xl relative overflow-hidden" id="profile-guest-card">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 to-indigo-600" />
          <UserIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-5" />
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mb-2">
            {language === 'ar' ? 'ملفك الشخصي الموحد في Vendora 👤' : 'Your Unified Profile Directory'}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            {language === 'ar'
              ? 'سجل دخولك الآن لمتابعة طلبيات الكترونياتك وأعلافك، مراجعة فواتير الشراء، إدارة مستودعك، أو تفعيل لوحة التاجر وبدء المكاسب.'
              : 'Log in to track existing Egypt delivery packages, modify shipping addresses, preview custom invoices, or command your seller mill.'}
          </p>

          <button
            onClick={() => setAuthOpen(true)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-103 cursor-pointer flex items-center gap-2 mx-auto"
            id="profile-guest-login-btn"
          >
            <LogIn className="w-4 h-4 text-white" />
            <span>{language === 'ar' ? 'تسجيل الدخول / إنشاء حساب جديد' : 'Log In / Register Account'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Dashboard Banner */}
          <div className="bg-gradient-to-r from-teal-800 to-zinc-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl" id="profile-welcome-banner">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left rtl:md:text-right">
                
                {/* Avatar Ring */}
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center border-4 border-white/10 shadow-lg text-teal-700">
                    {matchedSeller ? (
                      <Store className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    ) : (
                      <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    )}
                  </div>
                  {matchedSeller?.status === 'approved' && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center border-2 border-zinc-900 shadow">
                      <Award className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
                    <h2 className="text-lg md:text-2xl font-black tracking-tight" id="profile-display-name">
                      {currentUser.name}
                    </h2>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {language === 'ar' 
                        ? (currentUser.role === 'seller' ? 'شريك تاجر' : 'عميل معتمد') 
                        : currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 justify-center md:justify-start">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    <span>{currentUser.email}</span>
                  </p>
                  <p className="text-xs text-zinc-300 font-mono flex items-center gap-1.5 justify-center md:justify-start">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>{currentUser.phone || (language === 'ar' ? 'سجل رقم تليفونك' : 'No Phone')}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons to direct pages */}
              <div className="flex flex-wrap gap-2 justify-center">
                {matchedSeller?.status === 'approved' ? (
                  <div className="text-xs text-right space-y-1 bg-black/30 p-2.5 rounded-xl border border-white/10" id="profile-seller-tag-shortcut">
                    <p className="text-zinc-400 text-[10px]">{language === 'ar' ? 'مستودعك النشط:' : 'Your Business Hub:'}</p>
                    <p className="font-extrabold text-teal-300 font-sans">{matchedSeller.storeName}</p>
                  </div>
                ) : (
                  <div className="text-xs text-center md:text-right" id="profile-customer-tag-shortcut">
                    <p className="text-teal-400 text-[10px] font-bold">{language === 'ar' ? 'رتبة الحساب المالي بمصر:' : 'Egyptian Trust Rating:'}</p>
                    <p className="font-black text-white">{language === 'ar' ? 'حساب زراعي معتمد 🌾' : 'Certified Safe Client 🌾'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side column: General Settings & Profile Edits (4 Grid span) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile details form card */}
              <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-900 p-5 shadow-sm" id="profile-info-editor-card">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <h3 className="font-black text-xs text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-teal-600" />
                    {language === 'ar' ? 'تعديل البيانات الشخصية' : 'Personal Coordinates'}
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditedName(currentUser.name);
                        setEditedPhone(currentUser.phone);
                        setIsEditing(true);
                      }}
                      className="text-teal-600 hover:text-teal-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      id="edit-profile-trigger-btn"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                    </button>
                  )}
                </div>

                {errMessage && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/30 text-rose-600 dark:text-red-400 rounded-xl text-xs font-bold mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errMessage}</span>
                  </div>
                )}

                {sucMessage && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-250 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black mb-3">
                    {sucMessage}
                  </div>
                )}

                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-zinc-500 block">{language === 'ar' ? 'اسم العميل المعتمد' : 'Full Registered Name'}</label>
                      <input
                        type="text"
                        required
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1 select-text">
                      <label className="text-zinc-500 block">{language === 'ar' ? 'رقم المحمول المصري' : 'Egyptian Phone No.'}</label>
                      <input
                        type="tel"
                        required
                        value={editedPhone}
                        onChange={(e) => setEditedPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setErrMessage(null); }}
                        className="w-1/2 p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                        id="save-profile-btn"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span>{language === 'ar' ? 'حفظ' : 'Save'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <p className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl">
                      <span className="font-medium text-zinc-400">{language === 'ar' ? 'الاسم:' : 'Full Name:'}</span>
                      <span className="font-extrabold text-zinc-850 dark:text-zinc-200">{currentUser.name}</span>
                    </p>
                    <p className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl">
                      <span className="font-medium text-zinc-400">{language === 'ar' ? 'الحساب:' : 'Email Address:'}</span>
                      <span className="font-mono text-zinc-850 dark:text-zinc-200 font-bold">{currentUser.email}</span>
                    </p>
                    <p className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl">
                      <span className="font-medium text-zinc-400">{language === 'ar' ? 'التليفون:' : 'Mobile Telephone:'}</span>
                      <span className="font-mono text-zinc-850 dark:text-zinc-200 font-bold">{currentUser.phone || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/40 p-2.5 rounded-xl">
                      <span className="font-medium text-zinc-400">{language === 'ar' ? 'الصلاحيات:' : 'System Permission:'}</span>
                      <span className="font-mono font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider text-[10px]">{currentUser.role}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Render dynamic Supplier status banner or quick action card */}
              {!matchedSeller ? (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-2xl border border-indigo-950 p-5 shadow-md relative overflow-hidden" id="profile-become-seller-invite">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl" />
                  <Store className="w-8 h-8 text-indigo-400 mb-3" />
                  <h4 className="font-black text-xs uppercase tracking-wide text-indigo-300">
                    {language === 'ar' ? 'هل تمتلك مستودع أو وكالة بيع؟ 🏪' : 'Have high grade agri stocks? 🏪'}
                  </h4>
                  <p className="text-[11px] text-zinc-350 leading-relaxed mt-1 mb-4">
                    {language === 'ar'
                      ? 'يمكنك الآن فتح متجر تجاري لبيع الحبوب والأعلاف المصنعة ومستلزمات العناية في مصر بعمولة ثابتة 10%. اضغط للبدء في دقيقة.'
                      : 'Leverage our delivery networks and real-time mapping to showcase products. Pay flat 10% commission on orders.'}
                  </p>
                  <p className="text-[10px] text-emerald-450 italic font-bold mb-3 block">
                    {language === 'ar' ? '✨ خطة التاجر نشطة بالكامل بمصر لمستخدمي الدلتا والصعيد.' : '✨ Fully supported across Egypt mills and feedlots.'}
                  </p>
                  {/* Note: In App.tsx or inside Navbar, we can trigger the screen when seller-reg is activated */}
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-300 hover:text-indigo-200 transition-colors cursor-help">
                    {language === 'ar' ? 'يرجى النقر على زر "ابدأ البيع كتاجر 🚜" في القائمة العلوية للتسجيل فورا.' : 'Select "Become a Seller" in the menu above to start.'}
                  </span>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-900 p-5 shadow-sm space-y-4" id="profile-seller-permit-status">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                    <h4 className="font-black text-xs text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      {language === 'ar' ? 'حالة التراخيص والتوثيق' : 'Store Vetting status'}
                    </h4>
                  </div>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 font-bold">
                      <span className="text-zinc-500">{language === 'ar' ? 'حالة المتجر:' : 'Vetting State:'}</span>
                      {matchedSeller.status === 'approved' ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/45 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">
                          {language === 'ar' ? 'شريك نشط وموثق 🛡️' : 'Approved Partner 🛡️'}
                        </span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                          {language === 'ar' ? 'قيد المراجعة الفنية ⏳' : 'In Verification ⏳'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      {language === 'ar' 
                        ? 'تخضع كافة مستندات بائعي الحبوب والأدوية البيطرية للتحقق الفني لحماية الثروة الحيوانية والداجنة بمصر.' 
                        : 'Verified seller profiles are subject to review on custom billing. Feed batches must strictly conform with official veterinary guidance.'}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Right side column: Main Workspace contents (8 Grid span) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Special panel if they are an Approved Store Merchant */}
              {currentUser && matchedSeller && matchedSeller.status === 'approved' && (
                <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-900 p-6 shadow-sm space-y-6" id="profile-merchant-wallets-overview-panel">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div>
                      <h3 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase">
                        <Store className="w-5 h-5 text-teal-600" />
                        {language === 'ar' ? 'حساب التاجر والبيانات البيئية للمتجر' : 'Active Store Front & Wallet'}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {language === 'ar' 
                          ? `الاسم التجاري بالمنصة: ${matchedSeller.storeName}` 
                          : `Registered Brand: ${matchedSeller.storeName}`}
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/45 text-teal-800 dark:text-teal-400 text-[10px] font-black uppercase font-mono rounded-lg">
                      {language === 'ar' ? `العمولة العادية: ${matchedSeller.customCommissionRate || 10}%` : `Rate: ${matchedSeller.customCommissionRate || 10}%`}
                    </span>
                  </div>

                  {/* Financial Ledger Balance Widget */}
                  {matchedWallet && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="seller-profile-wallet-ledger">
                      <div className="p-4 bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/30 rounded-2xl">
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block mb-1">
                          {language === 'ar' ? 'الرصيد المشترك الكلي' : 'Total Revenue'}
                        </span>
                        <span className="font-mono text-xl font-black text-zinc-900 dark:text-white block">
                          {matchedWallet.balance} EGP
                        </span>
                      </div>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 rounded-2xl">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                          {language === 'ar' ? 'الرصيد المعلق (أثناء الشحن)' : 'Pending clearance'}
                        </span>
                        <span className="font-mono text-xl font-bold text-zinc-500 block">
                          {matchedWallet.pendingBalance} EGP
                        </span>
                      </div>

                      <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                        <span className="text-[10px] font-bold text-emerald-600 block mb-1 font-sans uppercase tracking-wider">
                          {language === 'ar' ? 'الرصيد القابل للسحب (إنستاباي)' : 'Withdrawable Balance'}
                        </span>
                        <span className="font-mono text-xl font-black text-emerald-600 block">
                          {matchedWallet.withdrawableBalance} EGP
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bios details and addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide block">{language === 'ar' ? 'الوصف العربي للمتجر:' : 'Store Bio (Ar):'}</span>
                      <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium">{matchedSeller.bioAr}</p>
                    </div>

                    <div className="space-y-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide block">{language === 'ar' ? 'الوصف الإنجليزي للمتجر:' : 'Store Bio (En):'}</span>
                      <p className="text-zinc-800 dark:text-zinc-300 leading-relaxed font-medium">{matchedSeller.bioEn}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-850 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-400 font-bold block">{language === 'ar' ? 'العنوان المعتمد للمخازن بمصر' : ' Egyptian Warehouse Registry'}</span>
                      <span className="text-zinc-900 dark:text-zinc-200">{matchedSeller.contactAddress}</span>
                    </div>
                    
                    <span className="text-[10px] text-zinc-400 font-mono italic">
                      {language === 'ar' ? `تاريخ الانضمام لشريحة الموردين: ${matchedSeller.joinedDate}` : `Joined: ${matchedSeller.joinedDate}`}
                    </span>
                  </div>

                </div>
              )}

              {/* Order history section */}
              <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-900 p-6 shadow-sm space-y-4" id="profile-recent-orders-ledger">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="font-black text-xs text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-teal-600" />
                    {language === 'ar' ? 'سجل الطلبات والمشتريات الخاصة بك بمصر' : 'Your Order Purchase History'}
                  </h3>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
                    <ShoppingBag className="w-10 h-10 text-zinc-350 dark:text-zinc-750 mx-auto" />
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      {language === 'ar' 
                        ? 'لم تسجيل أي طلبيات بالبريد الإلكتروني هذا حالياً. تصفح المتجر وأضف منتجات للدفع وتجربة التتبع!' 
                        : 'No orders submitted with this email yet. Complete a standard checkout to preview the dynamic multi-route map!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3" id="profile-orders-list">
                    {userOrders.map((ord) => (
                      <div 
                        key={ord.id} 
                        className="p-4 border border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-semibold"
                        id={`historic-item-${ord.id}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 px-2.5 py-1 rounded-lg border border-teal-100 dark:border-teal-900/40">
                              {ord.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              ord.status === 'delivered' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400' 
                                : ord.status === 'shipping'
                                ? 'bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400'
                                : 'bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400'
                            }`}>
                              {language === 'ar'
                                ? (ord.status === 'pending' ? 'بانتظار التأكيد' : ord.status === 'preparing' ? 'جاري التحضير بالمستودع' : ord.status === 'shipping' ? 'خارج للتسليم بالمحافظة' : 'تم التسليم بنجاح')
                                : ord.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5" />
                              {ord.date}
                            </span>
                            <span>•</span>
                            <span>
                              {ord.items.reduce((sum, i) => sum + i.quantity, 0)} {language === 'ar' ? 'عناصر' : 'Items'}
                            </span>
                          </div>
                        </div>

                        {/* Order price details and button */}
                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-0 border-zinc-100 dark:border-zinc-800 pt-3 md:pt-0">
                          <div className="text-left rtl:text-right">
                            <span className="text-[10px] text-zinc-400 block">{language === 'ar' ? 'المدفوع الإجمالي:' : 'Paid Total:'}</span>
                            <span className="font-mono text-sm font-black text-zinc-850 dark:text-zinc-200">
                              {ord.total} EGP
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setCurrentOrderTrackingId(ord.id);
                              // Smooth window scroll or visual redirection can be simulated.
                              // Click the actual desktop map tab:
                              const trackTab = document.querySelector('[id="navbar-desktop-tabs"] button:nth-child(2)') as HTMLButtonElement;
                              if (trackTab) {
                                trackTab.click();
                              }
                            }}
                            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 text-[11px] font-black"
                          >
                            <Truck className="w-3.5 h-3.5 text-white" />
                            <span>{language === 'ar' ? 'تتبع فوري' : 'Track Package'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
