/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Bell, Globe, Sun, Moon, Lock, Info, Landmark, Compass, Eye, X, Plus, Minus, Trash, Menu, LogIn, LogOut, UserCheck } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { AuthModal } from './AuthModal';
import { VendoraLogo } from './VendoraLogo';

interface NavbarProps {
  activeTab: 'shop' | 'track' | 'feedback' | 'guide' | 'admin' | 'seller-db' | 'seller-reg' | 'vendor-stores' | 'profile' | 'waslha';
  setActiveTab: (tab: 'shop' | 'track' | 'feedback' | 'guide' | 'admin' | 'seller-db' | 'seller-reg' | 'vendor-stores' | 'profile' | 'waslha') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    cart,
    language,
    theme,
    toggleLanguage,
    toggleTheme,
    notifications,
    adminMode,
    setAdminMode,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    currentOrderTrackingId,
    setCurrentOrderTrackingId,
    resetWalkthrough,
    currentUser,
    logoutUser,
    sellers,
    cartOpen,
    setCartOpen,
    checkoutOpen,
    setCheckoutOpen,
    authModalOpen,
    setAuthModalOpen
  } = useStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States after successful checkout
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);

  const linkedSeller = currentUser ? sellers.find(s => s.email === currentUser.email) : null;

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSuccess = (trackingId: string) => {
    setCheckoutOpen(false);
    setSuccessOrderId(trackingId);
    setCartOpen(false);
    
    // Redirect customer to tracking screen to view map immediately
    setCurrentOrderTrackingId(trackingId);
    setActiveTab('track');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-100 dark:border-zinc-800 shadow-sm backdrop-blur-md" id="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('shop')} id="navbar-brand">
            <VendoraLogo iconSize="sm" showSubtitle={false} />
          </div>

          {/* Center Tabs Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold" id="navbar-desktop-tabs">
            <button
              onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'shop'
                  ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'المتجر الإلكتروني' : 'Main Shop'}
            </button>
            <button
              onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'track'
                  ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'تتبع الطلبات الخريطة' : 'Track Orders Map'}
            </button>
            <button
              onClick={() => { setActiveTab('feedback'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'feedback'
                  ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'اقتراحات وشكاوى مصر' : 'Suggestions & Complaints'}
            </button>
            <button
              onClick={() => { setActiveTab('guide'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeTab === 'guide'
                  ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {language === 'ar' ? 'دليل المستخدم' : 'User Handbook'}
            </button>
            <button
              onClick={() => { setActiveTab('waslha'); setMobileMenuOpen(false); }}
              className={`px-3 py-2 rounded-xl cursor-pointer font-black transition-all border shrink-0 ${
                activeTab === 'waslha'
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : 'text-zinc-700 bg-zinc-50 border-zinc-200 hover:text-emerald-600 hover:border-emerald-250 dark:text-zinc-300 dark:bg-zinc-850 dark:border-zinc-800'
              }`}
            >
              {language === 'ar' ? '🚲 خدمة وصلها بالتوصيل الذكي' : '🚲 Waslha Smart Delivery'}
            </button>

            {currentUser && (currentUser.role === 'customer' || currentUser.role === 'user' || currentUser.role === 'seller') && (
              <>
                {linkedSeller ? (
                  linkedSeller.status === 'approved' ? (
                    <button
                      onClick={() => { setActiveTab('seller-db'); setMobileMenuOpen(false); }}
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${
                        activeTab === 'seller-db'
                          ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
                          : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                      id="navbar-seller-dashboard-btn"
                    >
                      <span>{language === 'ar' ? 'لوحة التاجر 🏪' : 'Seller Dashboard 🏪'}</span>
                    </button>
                  ) : (
                    <span className="px-3 py-2 text-xs bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400 rounded-lg select-none font-bold block" id="navbar-seller-pending-badge">
                      {language === 'ar' ? 'قيد مراجعة الإدارة ⏳' : 'Store Pending ⏳'}
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => { setActiveTab('seller-reg'); setMobileMenuOpen(false); }}
                    className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-250 hover:scale-103 text-xs font-bold border border-teal-200 dark:border-teal-900/40 rounded-xl px-4 ${
                      activeTab === 'seller-reg'
                        ? 'text-teal-600 bg-teal-50/50 dark:bg-teal-950/20'
                        : 'text-teal-600 hover:bg-teal-550 bg-teal-50/10 dark:text-teal-400 dark:hover:bg-zinc-800'
                    }`}
                    id="navbar-become-seller-btn"
                  >
                    {language === 'ar' ? 'ابدأ البيع كتاجر 🚜' : 'Become a Seller 🚜'}
                  </button>
                )}
              </>
            )}

            {/* Quick Walkthrough Launch link */}
            <button
              onClick={resetWalkthrough}
              className="px-2 py-1 text-[10px] bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 rounded-md cursor-pointer flex items-center gap-0.5"
              id="relaunch-tour-desktop"
              title={language === 'ar' ? 'إطلاق الجولة التعريفية' : 'Launch Onboarding Guide'}
            >
              <Info className="w-3.5 h-3.5" />
              {language === 'ar' ? 'جولة' : 'Tour'}
            </button>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-1.5 md:gap-3" id="navbar-actions">
            
            {/* Active Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              id="language-toggle-btn"
              title={language === 'ar' ? 'Switch to English' : 'تحويل للغة العربية'}
            >
              <Globe className="w-4 h-4 text-zinc-500" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Notification bell and menu */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setCartOpen(false); }}
                className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer relative"
                id="notif-dropdown-trigger"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 rtl:right-auto rtl:left-0 top-11 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden font-sans z-50 text-xs"
                    id="notif-dropdown-menu"
                  >
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 font-bold border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-zinc-700 dark:text-zinc-300">
                      <span>{language === 'ar' ? 'إشعارات العروض وبث المبيعات' : 'Store Push Notifications'}</span>
                      <span className="text-[10px] bg-teal-100 dark:bg-teal-950 px-1.5 py-0.5 rounded text-teal-800 dark:text-teal-400 font-mono">
                        {notifications.length}
                      </span>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="p-3 space-y-1 hover:bg-zinc-50 dark:hover:bg-zinc-950">
                          <p className="font-extrabold text-zinc-900 dark:text-white">
                            {language === 'ar' ? notif.titleAr : notif.titleEn}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                            {language === 'ar' ? notif.bodyAr : notif.bodyEn}
                          </p>
                          <span className="text-[9px] text-zinc-400 font-mono block text-right mt-1">
                            {notif.date}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Shopping Cart button */}
            <button
              onClick={() => { setCartOpen(true); setNotifOpen(false); }}
              className="p-2 bg-teal-100 hover:bg-teal-200 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-xl transition-all cursor-pointer relative font-bold flex items-center gap-1"
              id="cart-trigger-btn"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs bg-teal-600 text-white rounded-full h-4.5 w-4.5 flex items-center justify-center font-mono text-[10px] shadow-xs">
                {cartItemsCount}
              </span>
            </button>

            {/* Executive Admin Panel Switcher */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
              <button
                onClick={() => {
                  const toggled = !adminMode;
                  setAdminMode(toggled);
                  setActiveTab(toggled ? 'admin' : 'shop');
                  setMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl transition-colors font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer ${
                  adminMode
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
                id="admin-mode-toggle"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {adminMode ? (language === 'ar' ? 'إغلاق لوحة المدير' : 'Close Admin') : (language === 'ar' ? 'المدير 🛠️' : 'Admin 🛠️')}
                </span>
              </button>
            )}

            {/* User Auth Panel */}
            {currentUser ? (
              <div className="flex items-center gap-2" id="navbar-auth-logged-in-container">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="hidden md:flex flex-col text-right rtl:text-left text-[10px] leading-tight font-sans cursor-pointer hover:opacity-80 transition-opacity"
                  title={language === 'ar' ? 'عرض الملف الشخصي' : 'View profile details'}
                >
                  <span className="font-extrabold text-zinc-950 dark:text-zinc-50 max-w-[100px] truncate">👤 {currentUser.name}</span>
                  <span className="text-zinc-400 font-mono text-[9px] truncate max-w-[100px]">{currentUser.email}</span>
                </div>
                
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`p-2 rounded-xl transition-all font-bold text-xs flex items-center gap-1 cursor-pointer border ${
                    activeTab === 'profile'
                      ? 'bg-teal-600 border-teal-600 text-white shadow-sm font-black'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                  id="navbar-profile-tab-btn"
                  title={language === 'ar' ? 'الصفحة الشخصية والطلبيات' : 'My Personal Profile & Orders'}
                >
                  <span>{language === 'ar' ? 'حسابي 👤' : 'Profile 👤'}</span>
                </button>

                <button
                  onClick={() => logoutUser()}
                  className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl transition-colors flex items-center gap-1 font-bold text-xs cursor-pointer"
                  title={language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                  id="navbar-logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{language === 'ar' ? 'خروج' : 'Log Out'}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-xs"
                id="navbar-login-btn"
              >
                <LogIn className="w-3.5 h-3.5 font-black text-white" />
                <span>{language === 'ar' ? 'دخول 👤' : 'Login 👤'}</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              id="mobile-menu-trigger"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer (Visible on smaller viewports) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-100 dark:border-zinc-800 text-xs font-bold font-sans"
            id="mobile-menu-drawer"
          >
            <div className="px-4 py-4 space-y-2 flex flex-col">
              {currentUser ? (
                <div className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-4 mb-2" id="mobile-user-profile-bar">
                  <div className="flex flex-col text-left rtl:text-right">
                    <span className="font-extrabold text-zinc-900 dark:text-white">{currentUser.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{currentUser.email}</span>
                  </div>
                  <button
                    onClick={() => { logoutUser(); setMobileMenuOpen(false); }}
                    className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    id="mobile-logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {language === 'ar' ? 'خروج' : 'Log Out'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-center font-bold px-4 flex items-center justify-center gap-1.5 cursor-pointer mb-2"
                  id="mobile-login-btn"
                >
                  <LogIn className="w-4 h-4" />
                  {language === 'ar' ? 'تسجيل الدخول / إنشاء حساب 👤' : 'Login / Create Account 👤'}
                </button>
              )}

              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                <button
                  onClick={() => {
                    const toggled = !adminMode;
                    setAdminMode(toggled);
                    setActiveTab(toggled ? 'admin' : 'shop');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center ${
                    activeTab === 'admin' ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold'
                  }`}
                >
                  <Lock className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-amber-600" />
                  {adminMode ? (language === 'ar' ? 'إغلاق لوحة المدير' : 'Close Admin') : (language === 'ar' ? 'المدير 🛠️' : 'Admin 🛠️')}
                </button>
              )}

              <button
                onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center ${
                  activeTab === 'shop' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : 'text-zinc-700 dark:text-zinc-300'
                }`}
                id="mobile-nav-shop"
              >
                {language === 'ar' ? '🛒 تصفح المتجر الرئيسي' : 'Shop Catalog'}
              </button>
              <button
                onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center ${
                  activeTab === 'track' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {language === 'ar' ? '🗺️ تتبع شحنتك لحظة بلحظة' : 'Track Deliveries Map'}
              </button>
              <button
                onClick={() => { setActiveTab('feedback'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center ${
                  activeTab === 'feedback' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {language === 'ar' ? '📝 شكاوى واقتراحات مصر' : 'File Support Complaint'}
              </button>
              <button
                onClick={() => { setActiveTab('guide'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center ${
                  activeTab === 'guide' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {language === 'ar' ? '📖 دليل المستخدم' : 'Guide FAQ'}
              </button>
              <button
                onClick={() => { setActiveTab('waslha'); setMobileMenuOpen(false); }}
                className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center font-black ${
                  activeTab === 'waslha' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {language === 'ar' ? '🚲 خدمة وصلها للتوصيل الذكي' : '🚲 Waslha Smart Delivery'}
              </button>

              {currentUser && (currentUser.role === 'customer' || currentUser.role === 'user' || currentUser.role === 'seller') && (
                <>
                  {linkedSeller ? (
                    linkedSeller.status === 'approved' ? (
                      <button
                        onClick={() => { setActiveTab('seller-db'); setMobileMenuOpen(false); }}
                        className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center ${
                          activeTab === 'seller-db' ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                        id="mobile-nav-seller-db"
                      >
                        {language === 'ar' ? '🏪 لوحة التحكم للتاجر' : '🏪 Partner Merchant Dashboard'}
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl text-zinc-450 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-850 font-bold select-none text-start text-[11px]" id="mobile-nav-seller-pending">
                        {language === 'ar' ? '⏳ طلب المتجر الزراعي معلق ومحمي' : '⏳ Agricultural Store Pending Approval'}
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => { setActiveTab('seller-reg'); setMobileMenuOpen(false); }}
                      className={`w-full py-2.5 rounded-xl transition-colors cursor-pointer text-start flex px-4 items-center font-extrabold ${
                        activeTab === 'seller-reg' ? 'bg-teal-50 text-teal-600' : 'text-teal-600 hover:text-teal-700'
                      }`}
                      id="mobile-nav-seller-reg"
                    >
                      {language === 'ar' ? '🚜 ابدأ البيع وعرض الأعلاف كتاجر' : '🚜 Become an Ag Partner/Seller'}
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => { resetWalkthrough(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-xl text-center bg-amber-500 text-white cursor-pointer px-4 flex items-center justify-center gap-1 leading-normal"
              >
                <Info className="w-4 h-4" />
                {language === 'ar' ? 'إعادة تشغيل الدليل التوجيهي للبرنامج' : 'Relaunch User Tour'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-over Active Shopping Cart Drawer Overlay */}
      <AnimatePresence>
        {cartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" id="shopping-cart-drawer">
            {/* Blurry Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
              onClick={() => setCartOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 max-w-full flex pl-10 rtl:pl-0 rtl:pr-10" id="cart-drawer-positioner">
              <motion.div
                initial={{ x: language === 'ar' ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: language === 'ar' ? '-100%' : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
                id="cart-drawer-box"
              >
                {/* Cart Drawer Header */}
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-teal-600" />
                    <h3 className="font-extrabold text-md text-zinc-900 dark:text-white uppercase tracking-tight">
                      {language === 'ar' ? 'سلة المشتريات الخاصة بك' : 'Active Cart items'}
                    </h3>
                  </div>

                  <button
                    onClick={() => setCartOpen(false)}
                    className="p-1 rounded-full text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Drawer Items List Body */}
                <div className="flex-grow overflow-y-auto p-5 space-y-4" id="cart-items-scroller">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <ShoppingCart className="w-16 h-16 text-zinc-300 dark:text-zinc-700 animate-pulse" />
                      <div>
                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                          {language === 'ar' ? 'سلة المشتريات فارغة تماماً' : 'Your cart is empty'}
                        </h4>
                        <p className="text-zinc-400 text-xs mt-1">
                          {language === 'ar' ? 'تصفح قائمة منتجاتنا المتميزة وأضف سلعاً لبدء المحاكاة!' : 'Explore our catalog and pile up items for secure billing.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-100 dark:border-zinc-800 font-sans"
                        id={`cart-drawer-item-${item.product.id}`}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.nameEn}
                          className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                        />

                        <div className="flex-grow overflow-hidden">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                            {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                          </h4>
                          <span className="text-teal-600 font-extrabold text-xs block mt-0.5">
                            {item.product.price} EGP
                          </span>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                            {/* Quantity buttons adjusted */}
                            <div className="flex items-center gap-1.5 h-6">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="p-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 px-1 font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="p-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-teal-500"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-zinc-400 hover:text-red-600 flex items-center"
                              title={language === 'ar' ? 'حذف من السلة' : 'Remove item'}
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Drawer Footer */}
                {cart.length > 0 && (
                  <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 space-y-4" id="cart-drawer-footer">
                    {!currentUser && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-[10px] text-amber-800 dark:text-amber-400 font-extrabold" id="cart-auth-disclaimer">
                        ⚠️ {language === 'ar' ? 'عذراً، يجب تسجيل الدخول أو إنشاء حساب لطلب المنتجات وبدء الدفع!' : 'Please log in or sign up first to proceed with orders.'}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-zinc-500">
                      <span>{language === 'ar' ? 'تكلفة السلع الكلية:' : 'Subtotal:'}</span>
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-white font-mono">
                        {cartTotal} EGP
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={clearCart}
                        className="p-3 text-xs bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all cursor-pointer font-bold uppercase"
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
                        className="flex-grow p-3 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-extrabold tracking-wider transition-all cursor-pointer shadow-md text-center"
                        id="checkout-drawer-trigger"
                      >
                        {currentUser
                          ? (language === 'ar' ? 'الانتقال للدفع الآمن 💵' : 'Proceed to Checkout 💵')
                          : (language === 'ar' ? 'سجل دخول للشراء 👤' : 'Login to Purchase 👤')}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      </nav>

      {/* Render Checkout Modal Gateway over everything */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (cart.length > 0) {
            setCheckoutOpen(true);
            setCartOpen(false);
          }
        }}
      />
    </>
  );
};
