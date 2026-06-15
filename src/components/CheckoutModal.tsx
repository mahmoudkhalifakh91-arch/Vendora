/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PromoCoupon } from '../types';
import { PromoCouponWidget } from './PromoCouponWidget';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, FileText, CreditCard, Wallet, Layers, ShieldCheck, Mail, Send, AlertCircle, MapPin, Navigation } from 'lucide-react';

const EGYPT_REGIONS = [
  {
    governorateAr: 'المنوفية',
    governorateEn: 'Menofia',
    cities: [
      { ar: 'أشمون', en: 'Ashmoun' },
      { ar: 'شبين الكوم', en: 'Shibin El Kom' },
      { ar: 'منوف', en: 'Menouf' },
      { ar: 'السادات', en: 'Sadat' },
      { ar: 'الباجور', en: 'Bagour' }
    ]
  },
  {
    governorateAr: 'القاهرة',
    governorateEn: 'Cairo',
    cities: [
      { ar: 'مصر الجديدة', en: 'Heliopolis' },
      { ar: 'مدينة نصر', en: 'Nasr City' },
      { ar: 'التجمع الخامس', en: 'Fifth Settlement' },
      { ar: 'المعادي', en: 'Maadi' },
      { ar: 'شبرا', en: 'Shubra' }
    ]
  },
  {
    governorateAr: 'الجيزة',
    governorateEn: 'Giza',
    cities: [
      { ar: 'الدقي', en: 'Dokki' },
      { ar: 'المهندسين', en: 'Mohandessin' },
      { ar: 'الهرم', en: 'Haram' },
      { ar: 'أكتوبر', en: '6th of October' }
    ]
  },
  {
    governorateAr: 'الإسكندرية',
    governorateEn: 'Alexandria',
    cities: [
      { ar: 'سموحة', en: 'Smouha' },
      { ar: 'المنتزه', en: 'Al Montazah' },
      { ar: 'وسط البلد', en: 'Downtown' }
    ]
  }
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (trackingId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cart, language, placeOrder, currentUser, promoCoupons } = useStore();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('Cairo');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'instapay' | 'meeza' | 'cod'>('cod');

  // Delivery options state
  const [deliveryMethod, setDeliveryMethod] = useState<'branch' | 'delivery'>('delivery');
  const [deliveryMode, setDeliveryMode] = useState<'gps' | 'manual'>('gps');
  const [selectedGovIndex, setSelectedGovIndex] = useState(0); // Default to Menofia
  const [selectedCity, setSelectedCity] = useState('أشمون');
  const [manualDetailedAddress, setManualDetailedAddress] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize selectedCity when selectedGovIndex changes
  React.useEffect(() => {
    if (EGYPT_REGIONS[selectedGovIndex]) {
      setSelectedCity(EGYPT_REGIONS[selectedGovIndex].cities[0].ar);
    }
  }, [selectedGovIndex]);

  // Coupon application states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  
  // Auto fill logged in credentials
  React.useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [isOpen, currentUser]);
  
  // Card mock states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Instapay state
  const [instapayId, setInstapayId] = useState('');

  const cartTotal = cart.reduce((tot, item) => tot + item.product.price * item.quantity, 0);

  // Computational rules for applying a coupon
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discountType === 'percentage' 
        ? Math.round((cartTotal * appliedCoupon.discountValue) / 100) 
        : appliedCoupon.discountValue) 
    : 0;

  const finalAmountPayable = Math.max(0, cartTotal - discountAmount);

  const handleApplyCouponByCode = (codeStr: string) => {
    const code = codeStr.trim().toUpperCase();
    if (!code) return;

    const matched = promoCoupons.find(c => c.code === code && c.isActive);
    if (!matched) {
      setPromoSuccess('');
      setPromoError(language === 'ar' ? 'عذراً، هذا الكوبون غير فعال أو غير موجود ⚠️' : 'Invalid or expired coupon code ⚠️');
      return;
    }

    // Evaluate constraints
    const totalMet = cartTotal >= matched.minCartTotal;
    let categoryMet = true;
    if (matched.requiredCategory !== 'all') {
      categoryMet = cart.some(item => item.product.category === matched.requiredCategory);
    }

    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    let countMet = true;
    if (matched.requiredCategory !== 'all') {
      const catCount = cart
        .filter(item => item.product.category === matched.requiredCategory)
        .reduce((sum, item) => sum + item.quantity, 0);
      countMet = catCount >= matched.minItemsCount;
    } else {
      countMet = cartItemCount >= matched.minItemsCount;
    }

    if (!totalMet || !categoryMet || !countMet) {
      setPromoSuccess('');
      setPromoError(
        language === 'ar' 
          ? `لم يتم استيفاء شروط الكوبون. يتطلب حد أدنى للسلة ${matched.minCartTotal} EGP.`
          : `Promo terms not met. Requires cart total above ${matched.minCartTotal} EGP.`
      );
      return;
    }

    setPromoError('');
    setAppliedCoupon(matched);
    setPromoSuccess(language === 'ar' ? 'تم تطبيق خصم الكوبون بنجاح واحتساب الوفر! 🎉' : 'Coupon applied successfully! 🎉');
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'ar' ? 'متصفحك لا يدعم جلب الموقع الجغرافي GPS' : 'Your browser does not support Geolocation');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setGpsCoordinates(coords);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setError(
          language === 'ar'
            ? 'فشل تحديد موقعك التلقائي عبر الـ GPS. يرجى التأكد من تشغيل الموقع الجغرافي بالهاتف وتفويض المتصفح أو الاختيار الكتابي.'
            : 'Failing to fetch GPS location automatically. Please enable location on your device or use manual entry.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const egyptPhoneRegex = /^(\+20|0020|0)?1[0125][0-9]{8}$/;
    if (!egyptPhoneRegex.test(phone)) {
      setError(
        language === 'ar'
          ? 'رقم الهاتف المصري غير صحيح. يجب أن يبدأ بـ 01 ويتبعه 9 أرقام.'
          : 'Invalid Egyptian phone number. It must start with 01 and contain 9 digits.'
      );
      return;
    }

    if (deliveryMethod === 'delivery' && deliveryMode === 'gps' && !gpsCoordinates) {
      setError(
        language === 'ar'
          ? 'يرجى تحديد موقعك الفعلي (GPS) بالضغط على "تحديد موقعي التلقائي"، أو اختر إدخال العنوان كتابةً.'
          : 'Please select your actual location (GPS) by tapping "Automatic GPS My Location", or choose manual entry instead.'
      );
      return;
    }

    setError(null);

    // Prepare final city and address parameters recursively
    let finalCity = city;
    let finalAddress = address;

    if (deliveryMethod === 'branch') {
      finalCity = 'الفرع';
      finalAddress = language === 'ar' ? 'الاستلام ذاتياً من فرع أشمون الرئيسي' : 'Self-pickup from Ashmoun Main branch';
    } else {
      if (deliveryMode === 'gps') {
        finalCity = language === 'ar' ? 'موقعي عبر GPS' : 'GPS My Location';
        finalAddress = gpsCoordinates 
          ? `GPS: (${gpsCoordinates.lat.toFixed(6)}, ${gpsCoordinates.lng.toFixed(6)})`
          : (language === 'ar' ? 'محدد تلقائياً عبر موقعي' : 'Automatically pinned coordinates');
      } else {
        finalCity = selectedCity;
        finalAddress = manualDetailedAddress;
      }
    }

    // Call checkout system
    const newOrder = placeOrder({
      name,
      email,
      phone,
      city: finalCity,
      address: finalAddress,
      paymentMethod
    }, discountAmount, appliedCoupon?.code || '');

    // Reset local state fields
    setName('');
    setEmail('');
    setPhone('');
    setManualDetailedAddress('');
    setGpsCoordinates(null);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setInstapayId('');

    // Trigger Success callback
    onSuccess(newOrder.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs" id="checkout-gateway-overlay">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Modal Backdrop click dismiss (optional/fallback) */}
        <div className="fixed inset-0 -z-10" onClick={onClose} />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -30 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[88vh] text-start align-middle"
          id="checkout-card-box"
        >
        {/* Header title */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white flex items-center gap-2" id="checkout-header-title">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            {language === 'ar' ? 'بوابة الدفع الإلكتروني الأمن لـ Vendora' : 'Secure Electronic Checkout Gate - Vendora'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            id="checkout-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6" id="checkout-form">
          {/* Left Area: Shipping Details */}
          <div className="md:col-span-7 space-y-4" id="checkout-shipping-info">
            <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
              {language === 'ar' ? 'معلومات الشحن والتوصيل بمصر' : 'Shipping Coordinates (Egypt)'}
            </h4>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs rounded-xl font-bold flex items-center gap-2" id="checkout-error-banner">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-1 block">
                  {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: محمد أحمد علي' : 'e.g. Michael Smith'}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/40 focus:outline-none"
                  id="checkout-input-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-500 mb-1 block">
                    {language === 'ar' ? 'البريد الإلكتروني للإشعارات' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/40 focus:outline-none"
                    id="checkout-input-email"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 mb-1 block">
                    {language === 'ar' ? 'رقم الهاتف لـ واتساب' : 'Phone Number (WhatsApp)'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +201012345678"
                    className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500/40 focus:outline-none"
                    id="checkout-input-phone"
                  />
                </div>
              </div>

              {/* Delivery / Reception Mode Selection */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <label className="text-xs font-bold text-zinc-500 block">
                  {language === 'ar' ? 'طريقة الاستلام' : 'Collection Method'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('branch')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'branch'
                        ? 'border-teal-500 bg-teal-50/10 text-teal-600'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{language === 'ar' ? '🏪 استلام من الفرع' : '🏪 Shop Pickup'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'border-teal-500 bg-teal-50/10 text-teal-600'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{language === 'ar' ? '🛵 شحن وتوصيل للمنزل' : '🛵 Home Delivery'}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Delivery Mode Panels */}
              {deliveryMethod === 'branch' ? (
                <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-950/20 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                  {language === 'ar' 
                    ? '📍 يتم الاستلام ذاتياً من فرع أشمون الرئيسي بالمنوفية مجاناً عقب تأكيد الطلب وتجهيز المنتجات.' 
                    : '📍 Order gets collected directly from our main Ashmoun branch in Menofia completely free once ready.'}
                </div>
              ) : (
                <div className="space-y-4 p-4 border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-500">
                      {language === 'ar' ? 'تحديد مكان التوصيل' : 'Delivery Destination Mode'}
                    </label>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('gps')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          deliveryMode === 'gps'
                            ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-xs'
                            : 'text-zinc-400'
                        }`}
                      >
                        {language === 'ar' ? 'جي بي إس GPS' : 'GPS'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('manual')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                          deliveryMode === 'manual'
                            ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-xs'
                            : 'text-zinc-400'
                        }`}
                      >
                        {language === 'ar' ? 'كتابة عنوان' : 'Manual Entry'}
                      </button>
                    </div>
                  </div>

                  {deliveryMode === 'gps' ? (
                    <div className="space-y-3 animate-in zoom-in duration-200">
                      <p className="text-[10px] leading-tight text-zinc-400">
                        {language === 'ar' 
                          ? 'استخرج إحداثيات موقعك الجغرافي الفعلي الآن بضغطة واحدة ليتحرك الكابتن إليك مباشرة بالدقة الفائقة.' 
                          : 'Get high-precision delivery coordinates by clicking the GPS pin button below.'}
                      </p>
                      
                      <button
                        type="button"
                        onClick={handleGetGPSLocation}
                        disabled={isLocating}
                        className="w-full bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 py-4 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-teal-200/50 cursor-pointer"
                      >
                        <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-teal-500' : ''}`} />
                        {isLocating 
                          ? (language === 'ar' ? 'جاري جلب إحداثيات الـ GPS...' : 'Locating...') 
                          : gpsCoordinates 
                            ? (language === 'ar' ? '✓ تم تحديد موقعك الفعلي بنجاح' : '✓ Coordinates Acquired')
                            : (language === 'ar' ? 'اضغط لتحديد موقعي الحالي لقسم الشحن' : 'Tap to fetch my current location')}
                      </button>

                      {gpsCoordinates && (
                        <div className="p-3 bg-teal-50/40 text-teal-800 text-[10px] font-mono rounded-xl border border-teal-100 flex items-center gap-2 text-center justify-center">
                          <MapPin className="w-3.5 h-3.5 animate-bounce" />
                          <span>Lat: {gpsCoordinates.lat.toFixed(6)}, Lng: {gpsCoordinates.lng.toFixed(6)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in slide-in-from-right duration-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 mb-1 block">
                            {language === 'ar' ? 'المحافظة' : 'Governorate'}
                          </label>
                          <select
                            value={selectedGovIndex}
                            onChange={(e) => setSelectedGovIndex(Number(e.target.value))}
                            className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                          >
                            {EGYPT_REGIONS.map((item, index) => (
                              <option key={index} value={index}>
                                {language === 'ar' ? item.governorateAr : item.governorateEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 mb-1 block">
                            {language === 'ar' ? 'المركز / المدينة' : 'City / Centre'}
                          </label>
                          <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                          >
                            {EGYPT_REGIONS[selectedGovIndex] && EGYPT_REGIONS[selectedGovIndex].cities.map((cityObj, i) => (
                              <option key={i} value={cityObj.ar}>
                                {language === 'ar' ? cityObj.ar : cityObj.en}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 mb-1 block">
                          {language === 'ar' ? 'كتابة العنوان بالتفصيل' : 'Write Detailed Street/Building Address'}
                        </label>
                        <textarea
                          required={deliveryMethod === 'delivery' && deliveryMode === 'manual'}
                          value={manualDetailedAddress}
                          onChange={(e) => setManualDetailedAddress(e.target.value)}
                          placeholder={language === 'ar' ? 'اكتب الشارع، رقم البناية، الطابق، أو علامة مميزة' : 'e.g. 12 El-Galaa St, 3rd floor'}
                          rows={2}
                          className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Secure Payment Options Gateway Selector */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3" id="payment-gateways-container">
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                {language === 'ar' ? 'اختر بوابة الدفع الآمنة' : 'Select Secure Payment Gateway'}
              </h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-teal-500 bg-teal-50/10 text-teal-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                  id="pay-opt-cod"
                >
                  <ShoppingBag className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-teal-500 bg-teal-50/10 text-teal-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                  id="pay-opt-card"
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">{language === 'ar' ? 'بطاقة الائتمان / فيزا' : 'Credit / Debit Card'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'instapay'
                      ? 'border-teal-500 bg-teal-50/10 text-teal-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                  id="pay-opt-instapay"
                >
                  <Wallet className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">{language === 'ar' ? 'إنستاباي الإلكتروني' : 'Instapay Wallet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('meeza')}
                  className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'meeza'
                      ? 'border-teal-500 bg-teal-50/10 text-teal-600'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                  id="pay-opt-meeza"
                >
                  <Layers className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">{language === 'ar' ? 'بطاقة ميزة الوطنية' : 'Meeza National Card'}</span>
                </button>
              </div>

              {/* Dynamic Gateway Inputs */}
              <AnimatePresence mode="wait">
                {(paymentMethod === 'card' || paymentMethod === 'meeza') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-3 border border-zinc-100 dark:border-zinc-800 mt-2"
                    id="card-payment-fields"
                  >
                    <p className="text-[10px] font-semibold text-teal-600 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'تشفير آمن بمعيارية PCI-DSS الدولية' : 'Secure Encrypted Connection (PCI-DSS)'}
                    </p>
                    <div>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder={language === 'ar' ? 'رقم البطاقة (16 رقم)' : 'Card Number (16 digits)'}
                        className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="p-2.5 text-xs text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      />
                      <input
                        type="password"
                        required
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        className="p-2.5 text-xs text-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === 'instapay' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-2 border border-zinc-100 dark:border-zinc-800 mt-2"
                    id="instapay-fields"
                  >
                    <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'حوالة عبر شبكة إنستاباي القومية للبنوك' : 'Instapay National Bank Network Direct Pay'}
                    </p>
                    <input
                      type="text"
                      required
                      value={instapayId}
                      onChange={(e) => setInstapayId(e.target.value)}
                      placeholder={language === 'ar' ? 'معرّف إنستاباي الشخصي (username@instapay)' : 'Instapay IPN address (username@instapay)'}
                      className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Area: Order Summary */}
          <div className="md:col-span-12 lg:col-span-5 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between" id="checkout-cart-summary">
            <div>
              <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider mb-3">
                {language === 'ar' ? 'ملخص الفاتورة والسلة' : 'Bill Summary'}
              </h4>

              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2" id="checkout-cart-items-list">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="truncate pr-2">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </p>
                      <p className="text-zinc-400 font-mono">
                        {item.quantity} x {item.product.price} EGP
                      </p>
                    </div>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                      {item.product.price * item.quantity} EGP
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon applying block */}
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2" id="checkout-promo-block">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
                  {language === 'ar' ? 'قسائم التخفيض وكود الخصم ⚡' : 'Have a Promo Coupon? ⚡'}
                </span>
                
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'ادخل كود الخصم (FREE_EGYPT)' : 'Enter Code (FREE_EGYPT)'}
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-grow p-2 rounded-xl text-xs font-mono uppercase border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 tracking-widest text-[#5294e2] font-black text-center"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCouponByCode(couponCodeInput)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 rounded-xl cursor-pointer"
                  >
                    {language === 'ar' ? 'تطبيق' : 'Apply'}
                  </button>
                </div>

                {promoError && <p className="text-[10px] font-bold text-rose-500 text-right">{promoError}</p>}
                {promoSuccess && <p className="text-[10px] font-bold text-emerald-500 text-right">{promoSuccess}</p>}

                {/* One click easy apply coupon widget */}
                <div className="pt-2">
                  <PromoCouponWidget 
                    mode="checkout" 
                    appliedCouponId={appliedCoupon?.id}
                    onApplyCoupon={(coupon) => {
                      setAppliedCoupon(coupon);
                      setPromoError('');
                      setPromoSuccess(language === 'ar' ? 'تم تطبيق خصم الكوبون بنجاح واحتساب الوفر! 🎉' : 'Coupon applied successfully! 🎉');
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 space-y-1.5 text-xs text-zinc-500">
                <div className="flex justify-between items-center">
                  <span>{language === 'ar' ? 'قيمة مبيعات المنتجات' : 'Cart Net Total'}</span>
                  <span>{cartTotal} EGP</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-rose-500 font-extrabold text-[11px] bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded-md">
                    <span>{language === 'ar' ? `وفر كود الخصم (${appliedCoupon.code})` : `Promo Code Worth (${appliedCoupon.code})`}</span>
                    <span className="font-mono">-{discountAmount} EGP</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>
                    {language === 'ar' ? 'تكلفة الشحن لـ ' : 'Egypt Delivery fee for '}
                    {deliveryMethod === 'branch' 
                      ? (language === 'ar' ? 'الفرع الرئيسي' : 'Main Branch') 
                      : (deliveryMode === 'gps' 
                          ? (language === 'ar' ? 'موقعي عبر GPS' : 'GPS Location')
                          : selectedCity)}
                  </span>
                  <span className="text-emerald-500 font-bold">
                    {appliedCoupon?.discountType === 'free_shipping' || true 
                      ? (language === 'ar' ? 'مجاناً' : 'FREE') 
                      : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-zinc-900 dark:text-white border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <span>{language === 'ar' ? 'الإجمالي النهائي المطلوب' : 'Final Amount Payable'}</span>
                  <span className="text-teal-600 font-mono text-base">{finalAmountPayable} EGP</span>
                </div>
              </div>
            </div>

            {/* Shield and action */}
            <div className="mt-8 space-y-4">
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-[10px] text-zinc-400 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <p>
                  {language === 'ar' 
                    ? 'متجرك مؤمن ببروتوكول SSL لحماية السيرفر ونظم الدفع. لن يتم إفشاء بيانات بطاقتك أبداً خارج Vendora.'
                    : 'Encrypted via SSL encryption technology. Card hashes are safely proxy-routed in-system. Your data remains anonymous.'}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md cursor-pointer transition-colors uppercase tracking-wider"
                id="checkout-trigger-btn"
              >
                {language === 'ar' ? 'إرسال وتأكيد الطلب 🚀' : 'Confirm & Authenticate Order 🚀'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
      </div>
    </div>
  );
};
