/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Onboarding } from './components/Onboarding';
import { ProductCatalog } from './components/ProductCatalog';
import { OrderTracking } from './components/OrderTracking';
import { SupportFeedback } from './components/SupportFeedback';
import { StoreFaq } from './components/StoreFaq';
import { LiveChat } from './components/LiveChat';
import { AdminDashboard } from './components/AdminDashboard';
import { SellerDashboard } from './components/SellerDashboard';
import { SellerRegistration } from './components/SellerRegistration';
import { VendorStorePage } from './components/VendorStorePage';
import { UserProfile } from './components/UserProfile';
import { WaslhaAppWrapper } from './components/WaslhaAppWrapper';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Mail, HeartHandshake, Compass, RotateCcw, ShoppingCart, X, Minus, Plus, Trash } from 'lucide-react';

function VendoraAppContent() {
  const [activeTab, setActiveTab] = useState<'shop' | 'track' | 'feedback' | 'guide' | 'admin' | 'seller-db' | 'seller-reg' | 'vendor-stores' | 'profile' | 'waslha'>('shop');
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const { 
    language, 
    theme, 
    resetWalkthrough, 
    currentUser, 
    setAdminMode,
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCheckoutOpen,
    setAuthModalOpen
  } = useStore();

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Navigation Guard: only logged-in superadmin/admin can access the 'admin' tab
  React.useEffect(() => {
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin');
    if (activeTab === 'admin' && !isAdmin) {
      setActiveTab('shop');
      setAdminMode(false);
    }
  }, [activeTab, currentUser, setAdminMode]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 transition-colors duration-300">
      
      {/* Onboarding walkthrough for first visit */}
      <Onboarding />

      {/* Main Top Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Viewports */}
      <main className="flex-grow pb-16 font-sans">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start relative">
            
            {/* Left Main View Column */}
            <div className={`flex-grow w-full transition-all duration-350 ${cartOpen ? 'lg:max-w-[calc(100%-410px)]' : 'max-w-full'}`}>
              {/* Render hero promo banner exclusively on the Shop catalog landing page */}
              {activeTab === 'shop' && (
                <Hero setActiveTab={setActiveTab} />
              )}

              {/* Dynamic viewport switching */}
              {activeTab === 'shop' && (
                <ProductCatalog onViewSellerStore={(id) => {
                  setSelectedSellerId(id);
                  setActiveTab('vendor-stores');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} />
              )}

              {activeTab === 'track' && (
                <OrderTracking />
              )}

              {activeTab === 'feedback' && (
                <SupportFeedback />
              )}

              {activeTab === 'guide' && (
                <StoreFaq />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard />
              )}

              {activeTab === 'seller-db' && (
                <SellerDashboard />
              )}

              {activeTab === 'seller-reg' && (
                <SellerRegistration onSuccess={() => setActiveTab('shop')} />
              )}

              {activeTab === 'vendor-stores' && selectedSellerId && (
                <VendorStorePage sellerId={selectedSellerId} onBack={() => setActiveTab('shop')} />
              )}

              {activeTab === 'profile' && (
                <UserProfile />
              )}

              {activeTab === 'waslha' && (
                <div className="mt-6">
                  <WaslhaAppWrapper />
                </div>
              )}
            </div>

            {/* Right Cart Sidebar (Splits layout side-by-side on desktop) */}
            <AnimatePresence>
              {cartOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="hidden lg:flex w-[380px] shrink-0 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl shadow-xl flex-col overflow-hidden max-h-[82vh] sticky top-24 z-20"
                >
                  {/* Cart Header */}
                  <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-teal-600" />
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-tight">
                        {language === 'ar' ? 'سلة المشتريات الخاصة بك' : 'Active Cart items'}
                      </h3>
                    </div>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="p-1 rounded-full text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart Body */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-3" id="sidebar-cart-list">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-56 text-center space-y-2">
                        <ShoppingCart className="w-12 h-12 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                        <div>
                          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 text-xs">
                            {language === 'ar' ? 'سلة المشتريات فارغة تماماً' : 'Your cart is empty'}
                          </h4>
                          <p className="text-zinc-450 text-[10px] mt-1 max-w-xs mx-auto">
                            {language === 'ar' ? 'تصفح قائمة منتجاتنا المتميزة وأضف سلعاً لبدء المحاكاة!' : 'Explore our catalog and pile up items for secure billing.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-start gap-2.5 p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-150 dark:border-zinc-850 font-sans"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.nameEn}
                            className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                          />
                          <div className="flex-grow overflow-hidden">
                            <h4 className="font-black text-[11px] text-zinc-900 dark:text-white truncate">
                              {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                            </h4>
                            <span className="text-teal-600 font-extrabold text-[11px] block mt-0.5 font-mono">
                              {item.product.price} EGP
                            </span>

                            <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                              <div className="flex items-center gap-1.5 h-5">
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                  className="p-0.5 rounded bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="font-mono text-[11px] text-zinc-850 dark:text-zinc-205 px-0.5 font-bold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                  className="p-0.5 rounded bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-teal-500"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-zinc-400 hover:text-red-650 flex items-center p-0.5"
                                title={language === 'ar' ? 'حذف من السلة' : 'Remove item'}
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="p-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-3">
                      {!currentUser && (
                        <div className="p-2 bg-amber-50 dark:bg-amber-955/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-[10px] text-amber-850 dark:text-amber-400 font-extrabold leading-tight">
                          ⚠️ {language === 'ar' ? 'يجب تسجيل الدخول لطلب المنتجات وبدء الدفع!' : 'Please log in first to proceed with orders.'}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-xs text-zinc-500">
                        <span>{language === 'ar' ? 'تكلفة السلع الكلية:' : 'Subtotal:'}</span>
                        <span className="font-black text-xs text-zinc-900 dark:text-white font-mono">
                          {cartTotal} EGP
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={clearCart}
                          className="px-3.5 py-2.5 text-[10px] bg-zinc-250 hover:bg-zinc-300 dark:bg-zinc-850 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-305 rounded-xl transition-all cursor-pointer font-bold uppercase"
                        >
                          {language === 'ar' ? 'إفراغ' : 'Clear'}
                        </button>

                        <button
                          onClick={() => {
                            if (currentUser) {
                              setCheckoutOpen(true);
                              setCartOpen(false);
                            } else {
                              setAuthModalOpen(true);
                            }
                          }}
                          className="flex-grow py-2.5 text-[10px] bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-extrabold tracking-wider transition-all cursor-pointer shadow-md text-center"
                        >
                          {currentUser
                            ? (language === 'ar' ? 'الانتقال للدفع الآمن 💵' : 'Proceed to Checkout 💵')
                            : (language === 'ar' ? 'سجل دخول للشراء 👤' : 'Login to Purchase 👤')}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>

      {/* Floating Active Technical Chatbot Support in bottom corner */}
      <LiveChat />

      {/* Footnote Core Footer (Egypt Specialized bilingual) */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800 py-10 px-4 sm:px-6 lg:px-8 text-xs font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 items-start border-b border-zinc-100 dark:border-zinc-800 pb-8">
          
          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-zinc-950 dark:text-white uppercase tracking-tight">
              Vendora Egypt 🇪🇬
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              {language === 'ar'
                ? 'منصة السوق المتعددة الحديثة لعرض وتداول كبرى ماركات الأعلاف والمنتجات الزراعية والأدوية البيطرية وقطع الغيار بمصر مع خدمة التتبع الذكي اللحظي.'
                : 'The modern multi-vendor marketplace carrying certified feeds, agri inputs, veterinary supplies, and spare parts with high-precision tracking across Egypt.'}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-zinc-950 dark:text-white uppercase tracking-tight">
              {language === 'ar' ? 'بوابات معتمدة آمنة' : 'Certified Secure Options'}
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 leading-normal">
              {language === 'ar'
                ? 'مؤمن بتشفير تكنولوجي مشدد. يدعم إنستاباي، كريديت كارد، وميزة الوطنية.'
                : '100% Secure PCI-DSS compliant server-proxies. Support Cash on Delivery, Instapay, and Meeza.'}
            </p>
            <span className="inline-flex items-center gap-1 font-bold text-teal-600">
              <ShieldCheck className="w-4 h-4" />
              {language === 'ar' ? 'حماية المستهلك المباشرة' : 'Vendora Buyer Protection active'}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-sm text-zinc-950 dark:text-white uppercase tracking-tight">
              {language === 'ar' ? 'دعم المستندات وتهيئة الجولة' : 'Interactive Help & Tour'}
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400">
              {language === 'ar'
                ? 'إذا تجاوزت منبثق التوجيه للعملاء الجدد بالخطأ، يمكنك إعادة تشغيله فورا لمعاينة دليل المتجر.'
                : 'If you accidentally dismissed our newcomer guide, click here is to reset and re-launch the overlay walkthrough.'}
            </p>
            
            <button
              onClick={resetWalkthrough}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg transition-colors cursor-pointer"
              id="relaunch-tour-footer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
              {language === 'ar' ? 'إعادة جولة البدء للتعريف بالمتجر' : 'Relaunch User Walkthrough Tour'}
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-400 font-mono text-[10px]">
          <div>
            <span>© 2026 Vendora Marketplace. All rights reserved. Registered under No. 84930, Egyptian General Chamber of Commerce.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-teal-600 transition-colors cursor-help">VAT No: 485-928-109</span>
            <span className="hover:text-teal-600 transition-colors cursor-help">Terms & Regulations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <VendoraAppContent />
    </StoreProvider>
  );
}
