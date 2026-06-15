/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Transaction, PayoutRequest } from '../types';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit, 
  Tag, 
  RefreshCw, 
  User, 
  Download, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Boxes, 
  FileSpreadsheet, 
  Calendar, 
  Warehouse, 
  CheckCircle, 
  Wallet, 
  Briefcase, 
  Compass, 
  Globe, 
  Phone, 
  MapPin, 
  Percent, 
  Star 
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const {
    products,
    orders,
    transactions,
    payoutRequests,
    wallets,
    currentUser,
    sellers,
    language,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    createPayoutRequest
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'orders' | 'inventory' | 'finance' | 'settings'>('stats');

  // Find the seller object representing the logged-in user
  const currentSeller = useMemo(() => {
    if (!currentUser || currentUser.role !== 'seller') return null;
    // Map user.email to seller.email
    return sellers.find(s => s.email.toLowerCase() === currentUser.email.toLowerCase()) || null;
  }, [currentUser, sellers]);

  // States for adding a new product
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdDescEn, setNewProdDescEn] = useState('');
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('100');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60');
  const [newProdCategory, setNewProdCategory] = useState('mobiles');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Feed/Agricultural specialized attributes
  const [prodBatchNumber, setProdBatchNumber] = useState('BCH-2026-X1');
  const [prodProductionDate, setProdProductionDate] = useState('2026-06-01');
  const [prodExpiryDate, setProdExpiryDate] = useState('2027-06-01');
  const [prodSupplierInfo, setProdSupplierInfo] = useState('');
  const [prodWarehouseLocation, setProdWarehouseLocation] = useState('Aisle 4 - Shelf B');
  const [prodMinStockLevel, setProdMinStockLevel] = useState('10');

  // Financial inputs
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer' | 'instapay' | 'vodafone_cash'>('instapay');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState('');
  const [payoutErrorMsg, setPayoutErrorMsg] = useState('');

  // Seller profile edit states
  const [profileLogo, setProfileLogo] = useState(currentSeller?.logo || '');
  const [profileBanner, setProfileBanner] = useState(currentSeller?.banner || '');
  const [profileBioAr, setProfileBioAr] = useState(currentSeller?.bioAr || '');
  const [profileBioEn, setProfileBioEn] = useState(currentSeller?.bioEn || '');

  // 1. Filter products belonging strictly to this seller
  const sellerProducts = useMemo(() => {
    if (!currentSeller) return [];
    return products.filter(p => p.sellerId === currentSeller.id);
  }, [products, currentSeller]);

  // 2. Filter orders containing items from this seller
  const sellerOrders = useMemo(() => {
    if (!currentSeller) return [];
    return orders.filter(o => o.sellerId === currentSeller.id);
  }, [orders, currentSeller]);

  // 3. Filter transactions belonging to this seller
  const sellerTransactions = useMemo(() => {
    if (!currentSeller) return [];
    return transactions.filter(t => t.sellerId === currentSeller.id);
  }, [transactions, currentSeller]);

  // 4. Wallet metrics
  const sellerWallet = useMemo(() => {
    if (!currentSeller) return { sellerId: '', balance: 0, pendingBalance: 0, withdrawableBalance: 0 };
    return wallets[currentSeller.id] || { sellerId: currentSeller.id, balance: 0, pendingBalance: 0, withdrawableBalance: 0 };
  }, [wallets, currentSeller]);

  // 5. Payout Requests of this seller
  const sellerPayoutRequests = useMemo(() => {
    if (!currentSeller) return [];
    return payoutRequests.filter(p => p.sellerId === currentSeller.id);
  }, [payoutRequests, currentSeller]);

  // Core metrics analytics
  const analytics = useMemo(() => {
    const totalSales = sellerOrders.reduce((sum, o) => sum + o.total, 0);
    const deliveredCount = sellerOrders.filter(o => o.status === 'delivered').length;
    const lowStockCount = sellerProducts.filter(p => p.stock <= (p.minStockLevel || 10)).length;
    
    // Average rating
    const totalReviews = sellerProducts.flatMap(p => p.reviews);
    const avgRating = totalReviews.length > 0 
      ? parseFloat((totalReviews.reduce((s, r) => s + r.rating, 0) / totalReviews.length).toFixed(1))
      : 5.0;

    return {
      totalSales,
      completedOrders: deliveredCount,
      activeProducts: sellerProducts.length,
      lowStockProducts: lowStockCount,
      averageRating: avgRating,
      reviewsCount: totalReviews.length
    };
  }, [sellerProducts, sellerOrders]);

  if (!currentUser || currentUser.role !== 'seller') {
    return (
      <div id="unauthorized-seller-fallback" className="p-8 text-center bg-red-50 dark:bg-zinc-950/40 rounded-2xl border border-red-200/50 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-black text-zinc-900 dark:text-red-400 capitalize">
          {language === 'ar' ? 'غير مصرح بالدخول' : 'Access Denied'}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
          {language === 'ar'
            ? 'بوابة الأعمال الزراعية مغلقة. يرجى تسجيل الدخول بحساب تاجر معتمد للتحكم بمتجرك.'
            : 'This advanced dashboard requires a registered, fully approved Seller partner account. Use your merchant login.'}
        </p>
      </div>
    );
  }

  if (currentSeller && currentSeller.status === 'pending') {
    return (
      <div id="pending-seller-notice" className="p-12 text-center bg-amber-50 dark:bg-zinc-950 rounded-2xl border border-amber-200 max-w-2xl mx-auto my-12">
        <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-spin-slow" />
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
          {language === 'ar' ? 'طلبك قيد المراجعة الفنية' : 'Store Application Under Technical Review'}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-3 max-w-md mx-auto leading-relaxed">
          {language === 'ar'
            ? `أهلاً بك م. ${currentSeller.name} في منصة Vendora. يقوم فريق المراجعة للمؤسسة بالتحقق من الأوراق والمستندات بخصوص تجارة الأعلاف ومستلزمات الري وتصاريح البيع بالتجزئة وسيتصل بك خلال 24 ساعة للبدء!`
            : `Welcome Engineer ${currentSeller.name} to the Vendora platform. Our administrative compliance team is verifying your veterinary fertilizer/feed dealer permits. Complete notification will be activated shortly.`}
        </p>
        <div className="mt-6 p-4 bg-white dark:bg-zinc-900 rounded-xl text-xs inline-block text-zinc-500 border border-zinc-100 dark:border-zinc-800">
          <strong>{language === 'ar' ? 'اسم المتجر المعلق:' : 'Pending store:'}</strong> {currentSeller.storeName}
        </div>
      </div>
    );
  }

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    if (!newProdNameEn || !newProdNameAr || !newProdPrice || !newProdImg) return;

    const baseProduct = {
      nameEn: newProdNameEn,
      nameAr: newProdNameAr,
      descriptionEn: newProdDescEn,
      descriptionAr: newProdDescAr,
      price: parseFloat(newProdPrice) || 0,
      stock: parseInt(newProdStock) || 0,
      image: newProdImg,
      category: newProdCategory,
      sellerId: currentSeller.id,
      sellerName: currentSeller.name,
      sellerStore: currentSeller.storeName,
      batchNumber: prodBatchNumber || undefined,
      productionDate: prodProductionDate || undefined,
      expiryDate: prodExpiryDate || undefined,
      supplierInfo: prodSupplierInfo || undefined,
      warehouseLocation: prodWarehouseLocation || undefined,
      minStockLevel: parseInt(prodMinStockLevel) || 5,
      stockAlert: (parseInt(newProdStock) || 0) <= (parseInt(prodMinStockLevel) || 5)
    };

    if (isEditing) {
      // update structure
      const targetProd = products.find(p => p.id === isEditing);
      if (targetProd) {
        updateProduct({
          ...targetProd,
          ...baseProduct
        });
      }
      setIsEditing(null);
    } else {
      // add standard product
      addProduct(baseProduct);
    }

    // Reset properties safely
    setNewProdNameEn('');
    setNewProdNameAr('');
    setNewProdDescEn('');
    setNewProdDescAr('');
    setNewProdPrice('100');
    setNewProdStock('50');
    setProdBatchNumber('BCH-2026-X1');
    setProdProductionDate('2026-06-01');
    setProdExpiryDate('2027-06-01');
    setProdSupplierInfo('');
    setProdWarehouseLocation('Aisle 4 - Shelf B');
    setProdMinStockLevel('10');
  };

  const handleEditInit = (p: Product) => {
    setIsEditing(p.id);
    setNewProdNameEn(p.nameEn);
    setNewProdNameAr(p.nameAr);
    setNewProdDescEn(p.descriptionEn);
    setNewProdDescAr(p.descriptionAr);
    setNewProdPrice(p.price.toString());
    setNewProdStock(p.stock.toString());
    setNewProdCategory(p.category);
    setNewProdImg(p.image);
    setProdBatchNumber(p.batchNumber || '');
    setProdProductionDate(p.productionDate || '');
    setProdExpiryDate(p.expiryDate || '');
    setProdSupplierInfo(p.supplierInfo || '');
    setProdWarehouseLocation(p.warehouseLocation || '');
    setProdMinStockLevel((p.minStockLevel || 10).toString());
    setActiveSubTab('inventory');
    
    // Smooth scroll to form
    const elem = document.getElementById('manage-product-form');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSeller) return;
    const reqAmount = parseFloat(withdrawAmount);
    if (isNaN(reqAmount) || reqAmount <= 0) return;

    const res = createPayoutRequest({
      sellerId: currentSeller.id,
      amount: reqAmount,
      paymentMethod: withdrawMethod,
      paymentDetails: withdrawDetails
    });

    if (res.success) {
      setPayoutSuccessMsg(language === 'ar' ? 'تم تقديم طلب الشيك وصرف الأرباح بنجاح!' : 'Payout request submitted successfully for audit!');
      setPayoutErrorMsg('');
      setWithdrawAmount('');
      setWithdrawDetails('');
    } else {
      setPayoutErrorMsg(language === 'ar' ? res.errorAr : res.errorEn);
      setPayoutSuccessMsg('');
    }
  };

  return (
    <div id="seller-dashboard-wrapper" className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      {/* Banner and Store Header */}
      {currentSeller && (
        <div id="seller-banner-block" className="relative rounded-3xl overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="h-40 md:h-56 w-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10" />
            <img 
              src={currentSeller.banner} 
              alt="store banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="p-6 relative -mt-12 md:-mt-16 z-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-zinc-950 shadow-lg bg-zinc-100">
                <img 
                  src={currentSeller.logo} 
                  alt="store logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-3xl font-black text-zinc-900 dark:text-white" id="supplier-store-title">
                    {currentSeller.storeName}
                  </h1>
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-200/50 uppercase">
                    {language === 'ar' ? 'شريك موثق' : 'Certified'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {currentSeller.contactAddress}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-650 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {analytics.averageRating} ({analytics.reviewsCount} {language === 'ar' ? 'تقييم' : 'reviews'})
                  </span>
                  <span className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-md">
                    {language === 'ar' ? `نسبة العمولات الخاصة: ${currentSeller.customCommissionRate || 10}%` : `Direct Commission Rate: ${currentSeller.customCommissionRate || 10}%`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Balance indicator */}
            <div className="bg-zinc-100/50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/40 dark:border-zinc-800 flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'الرصيد المتاح للسحب' : 'Withdrawable Balance'}</p>
                <p className="text-xl md:text-2xl font-black text-emerald-600 dark:text-emerald-400">{sellerWallet.withdrawableBalance.toLocaleString()} <span className="text-xs font-bold font-sans">EGP</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div id="seller-sub-navigation" className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900">
        <button
          onClick={() => setActiveSubTab('stats')}
          className={`px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'stats'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-zinc-655 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {language === 'ar' ? 'المؤشرات والتحليل' : 'Daily Analytics'}
        </button>
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 relative ${
            activeSubTab === 'orders'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-zinc-655 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {language === 'ar' ? 'طلبات البيع المجزأة' : 'Distributed Split Orders'}
          {sellerOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length > 0 && (
            <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
              {sellerOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('inventory')}
          className={`px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'inventory'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-zinc-655 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          {language === 'ar' ? 'إدارة الخامات والمنتجات' : 'Agri-Farming Goods Catalog'}
          {analytics.lowStockProducts > 0 && (
            <span className="bg-amber-500 text-white rounded-full h-4 px-1 text-[8px] flex items-center justify-center font-bold">
              {analytics.lowStockProducts}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('finance')}
          className={`px-5 py-3 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5 ${
            activeSubTab === 'finance'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-zinc-655 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          {language === 'ar' ? 'الحسابات والمحفظة' : 'Financial Ledger & Payouts'}
        </button>
      </div>

      {/* RENDER CONTENT PANELS */}
      <div id="seller-content-canvas" className="w-full">
        {/* PANEL 1: STATS & ANALYTICS */}
        {activeSubTab === 'stats' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="seller-bento-grid">
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}</p>
                  <p className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-1">{analytics.totalSales.toLocaleString()} <span className="text-xs font-medium font-sans">EGP</span></p>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase">{language === 'ar' ? 'طلبات مكتملة' : 'Completed Deliveries'}</p>
                  <p className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-1">{analytics.completedOrders}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase">{language === 'ar' ? 'المنتجات النشطة بالكتالوج' : 'Listed Catalog Items'}</p>
                  <p className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-1">{analytics.activeProducts}</p>
                </div>
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 rounded-xl">
                  <Boxes className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-900 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs font-bold uppercase">{language === 'ar' ? 'منتجات أوشكت على النفاد' : 'Low Stock Items'}</p>
                  <p className={`text-xl md:text-2xl font-black mt-1 ${analytics.lowStockProducts > 0 ? 'text-rose-500 animate-pulse' : 'text-zinc-900 dark:text-white'}`}>{analytics.lowStockProducts}</p>
                </div>
                <div className={`p-3 rounded-xl ${analytics.lowStockProducts > 0 ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Sales Reports & Low Stock Index */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Sales report log */}
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 lg:col-span-2 space-y-4">
                <h3 className="text-base font-black text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                  {language === 'ar' ? 'سجل العمليات وحركة بيع العلف اليومية' : 'Warehouse Output Sales Record Log'}
                </h3>
                
                {sellerTransactions.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-8">{language === 'ar' ? 'لم يتم رصد أي عمليات مبيعات اليوم.' : 'No transactions logged yet.'}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left rtl:text-right" id="seller-tx-table">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-850 text-zinc-400 uppercase font-bold text-[10px]/[1.5]">
                          <th className="py-2.5">{language === 'ar' ? 'كود الشحنة' : 'Order ID'}</th>
                          <th className="py-2.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                          <th className="py-2.5">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                          <th className="py-2.5">{language === 'ar' ? 'العمولة المقتطعة' : 'Commission (10%)'}</th>
                          <th className="py-2.5">{language === 'ar' ? 'صافي مستحقك' : 'Your Net'}</th>
                          <th className="py-2.5">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-medium">
                        {sellerTransactions.map(tx => (
                          <tr key={tx.id} className="text-zinc-700 dark:text-zinc-350 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                            <td className="py-3 font-mono font-bold text-indigo-500">{tx.orderId}</td>
                            <td className="py-3">{tx.date}</td>
                            <td className="py-3 font-bold">{tx.amount.toLocaleString()} EGP</td>
                            <td className="py-3 text-rose-500">-{tx.commissionAmount.toLocaleString()} EGP</td>
                            <td className="py-3 text-emerald-500 font-bold">+{tx.netAmount.toLocaleString()} EGP</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                tx.status === 'cleared'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 animate-pulse'
                              }`}>
                                {language === 'ar' 
                                  ? (tx.status === 'cleared' ? 'جاهز للسحب' : 'قيد ترحيل التسليم') 
                                  : (tx.status === 'cleared' ? 'Cleared' : 'Pending Clearance')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Low stock indicators & Batch control */}
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-4">
                <h3 className="text-base font-black text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  {language === 'ar' ? 'إنذارات نفاد المخزون المستودعي' : 'Emergency Stock Warning Alerts'}
                </h3>

                <div className="space-y-3">
                  {sellerProducts.filter(p => p.stock <= (p.minStockLevel || 10)).length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-xs">
                      <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      {language === 'ar' ? 'مستويات المخازن آمنة تماماً.' : 'All silo inventories are at safe compliance levels.'}
                    </div>
                  ) : (
                    sellerProducts.filter(p => p.stock <= (p.minStockLevel || 10)).map(p => (
                      <div key={p.id} className="p-3 rounded-xl border border-rose-100 dark:border-rose-950/20 bg-rose-500/5 dark:bg-rose-950/10 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white">{language === 'ar' ? p.nameAr : p.nameEn}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {language === 'ar' ? 'موقع الرص:' : 'Location:'} <strong>{p.warehouseLocation || 'N/A'}</strong> | {language === 'ar' ? 'كود التشغيلة:' : 'Batch:'} {p.batchNumber || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-rose-600 font-bold text-sm block">{p.stock} {language === 'ar' ? 'وحدة' : 'units'}</p>
                          <span className="text-[9px] bg-rose-100 dark:bg-rose-950 text-rose-500 font-bold px-1.5 py-0.5 rounded">
                            {language === 'ar' ? `الحد الأدنى: ${p.minStockLevel || 10}` : `Limit: ${p.minStockLevel || 10}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-[10px] font-medium leading-relaxed text-zinc-500">
                  ⚠️ {language === 'ar' 
                    ? 'المنصة تقوم تلقائياً بإنذار الإدارة الإقليمية ومسؤول مستودعات الدقهلية عندما يقل مستوى أي تشغيلة علف دواجن عن حد التنبيه لضمان استمرارية التشغيل وتفادي الإجهاد.' 
                    : 'System flags automated low-stock dispatch instructions to transport teams if broiler additives drop below minimum compliance thresholds.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: VENDOR DISTRIBUTED SPLIT ORDERS */}
        {activeSubTab === 'orders' && (
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-6">
            <div>
              <h3 className="text-lg font-black text-zinc-950 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-500" />
                {language === 'ar' ? 'طلبات التجهيز وحركة الشحن المخصصة لمتجرك' : 'Your Distributed Handled Orders & Tracking'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'ar'
                  ? 'بصفتك بائعاً موثقاً، لا يمكنك رؤية أو التحكم إلا بالمنتجات المطلوبة من مستودعاتك مباشرة في الفاتورة الموزعة.'
                  : 'Platform isolates distributed invoices. You only see items ordered from your stock and update their respective logistics states.'}
              </p>
            </div>

            {sellerOrders.length === 0 ? (
              <div className="p-16 text-center text-zinc-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <p className="text-xs">{language === 'ar' ? 'لا توجد أي طلبيات مسجلة للمتجر حتى الآن.' : 'No active orders registered yet.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sellerOrders.map(ord => (
                  <div key={ord.id} className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-900 hover:border-zinc-200 hover:shadow-sm transition-all" id={`split-order-card-${ord.id}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded">
                            {ord.id}
                          </span>
                          <span className="text-zinc-400 text-xs font-mono">{ord.date}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                              : ord.status === 'shipping'
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
                              : 'bg-amber-50 dark:bg-amber-950/25 text-amber-500'
                          }`}>
                            {language === 'ar' 
                              ? (ord.status === 'pending' ? 'بانتظار التحضير' : ord.status === 'preparing' ? 'تحت التعبئة' : ord.status === 'shipping' ? 'قيد الشحن' : 'تم التسليم')
                              : ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-2 font-bold mb-1">
                          {language === 'ar' ? 'العميل:' : 'Customer:'} {ord.customerName} ({ord.customerPhone}) - {ord.city}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {language === 'ar' ? 'عنوان التسليم:' : 'Address:'} {ord.address}
                        </p>
                      </div>

                      {/* Dropdown status update for the seller */}
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{language === 'ar' ? 'تعديل مرحلة الشحن للتاجر' : 'Supplier Logistics Control'}</label>
                        <select
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                          className="text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 font-bold text-zinc-700 dark:text-white"
                        >
                          <option value="pending">{language === 'ar' ? 'بانتظار التحضير' : 'Pending Review'}</option>
                          <option value="preparing">{language === 'ar' ? 'تحت التعبئة وفحص الصلاحية' : 'Preparing & Packing'}</option>
                          <option value="shipping">{language === 'ar' ? 'تسليم لسيارات الشحن' : 'Shipping / Out for Delivery'}</option>
                          <option value="delivered">{language === 'ar' ? 'تم التسليم وتأكيد الوصل' : 'Delivered & Settled'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Ordered Items belonging strictly to this seller */}
                    <div className="mt-4 space-y-2">
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-wider mb-2">{language === 'ar' ? 'قائمة الفحص والمواصفات للحبوب والتشكيلة' : 'Requested Goods & Batch Details'}</p>
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100/40 dark:border-zinc-900/50 text-xs">
                          <div className="flex items-center gap-3">
                            <img src={item.product.image} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-white">{language === 'ar' ? item.product.nameAr : item.product.nameEn}</p>
                              <div className="flex items-center flex-wrap gap-2 text-[10px] mt-0.5 text-zinc-450 dark:text-zinc-400">
                                <span>{language === 'ar' ? 'الكمية:' : 'Qty:'} <strong className="text-zinc-900 dark:text-white font-mono">{item.quantity}</strong></span>
                                {item.product.batchNumber && (
                                  <>
                                    <span>•</span>
                                    <span>{language === 'ar' ? 'رقم التشغيلة:' : 'Batch:'} <strong className="text-indigo-500 font-mono">{item.product.batchNumber}</strong></span>
                                  </>
                                )}
                                {item.product.expiryDate && (
                                  <>
                                    <span>•</span>
                                    <span>{language === 'ar' ? 'تاريخ الانتهاء:' : 'Expiry:'} <strong className="text-rose-500 font-mono">{item.product.expiryDate}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-zinc-900 dark:text-white">{(item.product.price * item.quantity).toLocaleString()} EGP</p>
                            <p className="text-[9px] text-zinc-405">{item.product.price.toLocaleString()} EGP / {language === 'ar' ? 'وحدة' : 'unit'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-dashed border-zinc-100 dark:border-zinc-900 flex flex-wrap md:items-center justify-between gap-4 text-[11px] font-bold">
                      <div className="flex gap-4">
                        <span className="text-zinc-400">{language === 'ar' ? 'إجمالي الدفع:' : 'Sales Volume:'} <strong className="text-zinc-800 dark:text-white">{ord.total.toLocaleString()} EGP</strong></span>
                        <span className="text-rose-500">{language === 'ar' ? 'العمولة المستقطعة للمنصة:' : 'Platform commission:'} <strong>{ord.sellerCommissionAmount?.toLocaleString()} EGP ({ord.sellerCommissionRate}%)</strong></span>
                      </div>
                      <div className="text-emerald-500">
                        {language === 'ar' ? 'صافي أرباحك في المحفظة:' : 'Your Net Earnings:'} <strong className="text-emerald-500 text-xs font-mono font-black">+{ord.sellerNetEarnings?.toLocaleString()} EGP</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL 3: AGRI-FARMING PRODUCT CATALOG & INVENTORY */}
        {activeSubTab === 'inventory' && (
          <div className="space-y-6">
            {/* Dynamic Product Form */}
            <div id="manage-product-form" className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-6">
              <div>
                <h3 className="text-lg font-black text-zinc-950 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-500" />
                  {isEditing ? (language === 'ar' ? 'تعديل تشغيلة الخامات الزراعية' : 'Edit Listed Agricultural Batch') : (language === 'ar' ? 'إضافة صنف علف / إضافات / دواء بيطري جديد' : 'Publish New Agricultural / Feed Supply Batch')}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {language === 'ar'
                    ? 'املأ بيانات المنتج بعناية بما يتطابق مع تشغيلات فحص وزارة الزراعة والإنتاج الحيواني بمصر لتوفير الأرقام والتواريخ الدقيقة.'
                    : 'Fill details carefully. Standard operating batches must show certified manufacturing details and expiry intervals.'}
                </p>
              </div>

              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* Core texts */}
                <div className="space-y-4">
                  <h4 className="font-black text-[10px] tracking-wider text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-900 pb-1">{language === 'ar' ? 'العناوين والوصف البياني' : 'Linguistic Labels'}</h4>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'الاسم بالإنجليزية' : 'Product Name (English)'}</label>
                    <input
                      required
                      type="text"
                      value={newProdNameEn}
                      onChange={(e) => setNewProdNameEn(e.target.value)}
                      placeholder="e.g., Premium Laying Poultry Feed 18%"
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'الاسم بالعربية' : 'الاسم بالكامل (عربي)'}</label>
                    <input
                      required
                      type="text"
                      value={newProdNameAr}
                      onChange={(e) => setNewProdNameAr(e.target.value)}
                      placeholder="مثال: علف إنتاجي دواجن بياض سوبر 18%"
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'الوصف الإنجليزي' : 'Description (English)'}</label>
                    <textarea
                      value={newProdDescEn}
                      onChange={(e) => setNewProdDescEn(e.target.value)}
                      placeholder="Formulate details, nutrient ratios, instructions..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'الوصف العربي' : 'التحليل والوصف (عربي)'}</label>
                    <textarea
                      value={newProdDescAr}
                      onChange={(e) => setNewProdDescAr(e.target.value)}
                      placeholder="المكونات، التحليل الكيميائي لنسب البروتين، مواصفات الري..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                    />
                  </div>
                </div>

                {/* Financial details & category */}
                <div className="space-y-4">
                  <h4 className="font-black text-[10px] tracking-wider text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-900 pb-1">{language === 'ar' ? 'التسعير والتعبئة' : 'Pricing & Logistics'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'السعر (جنيه مصري)' : 'Price (EGP)'}</label>
                      <input
                        required
                        type="number"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="Price"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'مخزون الرصيد الحالي' : 'Stock Quantity'}</label>
                      <input
                        required
                        type="number"
                        value={newProdStock}
                        onChange={(e) => setNewProdStock(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'قسم الشحنة' : 'Category'}</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-bold"
                    >
                      <option value="mobiles">{language === 'ar' ? 'الموبايلات' : 'Mobiles'}</option>
                      <option value="electronics_accessories">{language === 'ar' ? 'الإكسسوارات الإلكترونية' : 'Electronic Accessories'}</option>
                      <option value="video_games">{language === 'ar' ? 'ألعاب الفيديو' : 'Video Games'}</option>
                      <option value="perfumes">{language === 'ar' ? 'عطور' : 'Perfumes'}</option>
                      <option value="laptops">{language === 'ar' ? 'أجهزة الكمبيوتر المحمولة' : 'Laptops'}</option>
                      <option value="cosmetics">{language === 'ar' ? 'مستحضرات تجميل' : 'Cosmetics'}</option>
                      <option value="home_kitchen">{language === 'ar' ? 'المنزل والمطبخ' : 'Home & Kitchen'}</option>
                      <option value="others">{language === 'ar' ? 'أخرى' : 'Others'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'رابط صورة توضيحية' : 'Cover Image URL'}</label>
                    <input
                      required
                      type="text"
                      value={newProdImg}
                      onChange={(e) => setNewProdImg(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'حد الإنذار الأدنى' : 'Min Stock Alert Level'}</label>
                      <input
                        type="number"
                        value={prodMinStockLevel}
                        onChange={(e) => setProdMinStockLevel(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'موضع الصف والمستودع' : 'Warehouse Shelf Loc'}</label>
                      <input
                        type="text"
                        value={prodWarehouseLocation}
                        onChange={(e) => setProdWarehouseLocation(e.target.value)}
                        placeholder="e.g. Silo 4 / Row B"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Feed / Veterinary / Agricultural Specific Parameters */}
                <div className="space-y-4">
                  <h4 className="font-black text-[10px] tracking-wider text-rose-500 dark:text-indigo-400 uppercase border-b border-zinc-100 dark:border-zinc-900 pb-1">{language === 'ar' ? 'التحليلات ومواصفات الأعلاف البيطرية' : 'Feed Veterinary & Batch Specs'}</h4>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-rose-500 dark:text-indigo-400 flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'رقم تشغيلة الإنتاج (الدفعة)' : 'Batch Control Number'}
                    </label>
                    <input
                      type="text"
                      value={prodBatchNumber}
                      onChange={(e) => setProdBatchNumber(e.target.value)}
                      placeholder="e.g., PLT-2026-F91"
                      className="w-full p-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'تاريخ الإنتاج الكيميائي' : 'Production Date'}</label>
                      <input
                        type="date"
                        value={prodProductionDate}
                        onChange={(e) => setProdProductionDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300 text-rose-500">{language === 'ar' ? 'تاريخ انتهاء الصلاحية' : 'Expiry Date'}</label>
                      <input
                        type="date"
                        value={prodExpiryDate}
                        onChange={(e) => setProdExpiryDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-rose-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'المستورد أو المصنع الأساسي للأعلاف' : 'Supplier / Manufacturer Origin'}</label>
                    <input
                      type="text"
                      value={prodSupplierInfo}
                      onChange={(e) => setProdSupplierInfo(e.target.value)}
                      placeholder="e.g., Cargill Inc, Nebraska USA"
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white font-medium"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      id="save-product-btn"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl cursor-pointer shadow-lg active:scale-95 transition-all text-xs"
                    >
                      {isEditing ? (language === 'ar' ? 'تحديث وحفظ التعديلات للدفعة' : 'Confirm Save Changes') : (language === 'ar' ? 'اعتماد ونشر الصنف بالماركت' : 'Publish to Agriculture Directory')}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(null);
                          setNewProdNameEn('');
                          setNewProdNameAr('');
                        }}
                        className="w-full mt-2 bg-zinc-100 hover:bg-zinc-205 dark:bg-zinc-900 text-zinc-500 font-bold p-2.5 rounded-xl cursor-pointer text-center block text-[10px]"
                      >
                        {language === 'ar' ? 'إلغاء التعديل' : 'Cancel Edit'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Current Vendor Stock List */}
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-4">
              <h3 className="text-base font-black text-zinc-950 dark:text-white flex items-center justify-between">
                <span>{language === 'ar' ? 'المخزون الداخلي لمتجرك الزراعي حالياً' : 'Your Managed Farmhouse Stock Inventory'}</span>
                <span className="text-xs text-zinc-400 font-mono font-bold">({sellerProducts.length} {language === 'ar' ? 'منتج معروض بقنوات التوزيع' : 'listed items'})</span>
              </h3>

              {sellerProducts.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  {language === 'ar' ? 'لم تقم بإدراج أي منتج في متجرك الزراعي بعد.' : 'No items listed in your supplier catalog yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sellerProducts.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/40 dark:bg-zinc-900/40 flex flex-col justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <img src={p.image} className="w-16 h-16 rounded-xl object-cover border border-zinc-100 dark:border-zinc-800" referrerPolicy="no-referrer" />
                        <div className="space-y-1 text-xs">
                          <h4 className="font-extrabold text-zinc-900 dark:text-white leading-tight">
                            {language === 'ar' ? p.nameAr : p.nameEn}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-mono">
                            {language === 'ar' ? 'التشغيلة:' : 'Batch:'} <strong className="text-indigo-500 font-bold">{p.batchNumber || 'N/A'}</strong>
                          </p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                            {p.productionDate && <span>PRD: {p.productionDate}</span>}
                            {p.expiryDate && <span className="text-rose-500">EXP: {p.expiryDate}</span>}
                            {p.warehouseLocation && <span>LOC: {p.warehouseLocation}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-900 pt-3 text-[11px] font-bold">
                        <div>
                          <p className="text-zinc-450 text-[10px] uppercase font-bold">{language === 'ar' ? 'الكمية المتاحة' : 'Available Stock'}</p>
                          <p className={`text-base font-black ${p.stock <= (p.minStockLevel || 5) ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>
                            {p.stock.toLocaleString()} <span className="text-[10px] font-medium text-zinc-400">{language === 'ar' ? 'وحدة' : 'units'}</span>
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-zinc-450 text-[10px] uppercase font-bold">{language === 'ar' ? 'السعر' : 'Unit Price'}</p>
                          <p className="text-base font-black text-indigo-600 dark:text-indigo-400">{p.price.toLocaleString()} EGP</p>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditInit(p)}
                            id={`edit-item-${p.id}`}
                            className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-450 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            id={`delete-item-${p.id}`}
                            className="p-2 text-zinc-500 hover:text-rose-600 dark:text-zinc-450 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PANEL 4: FINANCIAL MODULE, WALLETS & LEDGER */}
        {activeSubTab === 'finance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Wallet summary & withdrawal form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-6">
                <div>
                  <h3 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-500" />
                    {language === 'ar' ? 'المحفظة المالية للتاجر' : 'Your Direct Account Wallet'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {language === 'ar' ? 'أرقامك ومستحقات الشحنات بالتفصيل.' : 'Real-time bookkeeping indicators.'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Ledger layout */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-bold">{language === 'ar' ? 'الرصيد الكلي المجمع:' : 'Gross Platform Balance:'}</span>
                      <span className="font-mono font-black text-zinc-800 dark:text-white text-sm">{sellerWallet.balance.toLocaleString()} EGP</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                        {language === 'ar' ? 'أرباح معلقة (تحت التوصيل):' : 'Pending Clearance Balance:'}
                      </span>
                      <span className="font-mono font-black text-amber-600 text-sm">+{sellerWallet.pendingBalance.toLocaleString()} EGP</span>
                    </div>
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex items-center justify-between text-xs">
                      <span className="text-zinc-505 font-bold uppercase">{language === 'ar' ? 'رصيد متاح للسحب النقدي:' : 'Withdrawable Balance:'}</span>
                      <span className="font-mono font-black text-emerald-500 text-lg">{sellerWallet.withdrawableBalance.toLocaleString()} EGP</span>
                    </div>
                  </div>

                  {/* Request withdraw form */}
                  <form onSubmit={handleRequestWithdrawalSubmit} className="space-y-3 text-xs">
                    <h4 className="font-black text-[10px] tracking-wider text-zinc-500 uppercase border-b border-zinc-100 dark:border-zinc-900 pb-1">{language === 'ar' ? 'طلب سحب نقدي فوري بالجنيه' : 'Withdraw Profit Funds'}</h4>
                    
                    {payoutSuccessMsg && <p className="bg-emerald-500/10 text-emerald-600 p-2.5 rounded-xl font-bold">{payoutSuccessMsg}</p>}
                    {payoutErrorMsg && <p className="bg-rose-500/10 text-rose-500 p-2.5 rounded-xl font-bold">{payoutErrorMsg}</p>}

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'مبلغ السحب (EGP)' : 'Withdrawal Amount (EGP)'}</label>
                      <input
                        required
                        type="number"
                        min="1"
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'طريقة الاستلام المفضلة' : 'Settlement Channel'}</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e: any) => setWithdrawMethod(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-805 dark:text-white font-bold"
                      >
                        <option value="instapay">Instapay (تطبيق إنستاباي الفوري)</option>
                        <option value="vodafone_cash">Vodafone Cash (محفظة فودافون كاش)</option>
                        <option value="bank_transfer">Egyptian Bank Account Wire (حساب بنكي محلي)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'تفاصيل الحساب / الرقم الهاتفي' : 'Account Identifier / Mobile Number'}</label>
                      <input
                        required
                        type="text"
                        value={withdrawDetails}
                        onChange={(e) => setWithdrawDetails(e.target.value)}
                        placeholder={withdrawMethod === 'instapay' ? 'yourname@instapay' : withdrawMethod === 'vodafone_cash' ? '010XXXXXXXX' : 'IBAN EGXXXXXXXXXXXXXXXXXXXXX'}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-805 dark:text-white font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      id="payout-request-submit-btn"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer text-xs"
                    >
                      {language === 'ar' ? 'إرسال طلب السحب للمراجعة المباشرة' : 'Confirm Draw Placement'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Withdraw Requests Historical ledger log */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-150 dark:border-zinc-900 space-y-4">
                <h3 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <ArrowUpRight className="w-5 h-5 text-indigo-500" />
                  {language === 'ar' ? 'سجل تتبع طلبات التحويل وسحب الأرباح' : 'Settlement Logs & Payouts Journey'}
                </h3>

                {sellerPayoutRequests.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-12 text-center">{language === 'ar' ? 'لا توجد طلبات سحب سابقة.' : 'No previous payout requests.'}</p>
                ) : (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left rtl:text-right" id="seller-payouts-table">
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 lowercase font-bold text-[10px]">
                          <th className="py-2">{language === 'ar' ? 'كود التحويل' : 'Request ID'}</th>
                          <th className="py-2">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                          <th className="py-2">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                          <th className="py-2">{language === 'ar' ? 'الطريقة' : 'Channel'}</th>
                          <th className="py-2">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                          <th className="py-2">{language === 'ar' ? 'ملاحظات الإدارة' : 'Notes'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900 font-medium text-zinc-600 dark:text-zinc-350">
                        {sellerPayoutRequests.map(p => (
                          <tr key={p.id}>
                            <td className="py-2.5 font-mono text-[10px] text-zinc-500 font-bold">{p.id}</td>
                            <td className="py-2.5">{p.date}</td>
                            <td className="py-2.5 font-mono font-black text-rose-500">-{p.amount.toLocaleString()} EGP</td>
                            <td className="py-2.5 uppercase text-[10px]">{p.paymentMethod.replace('_', ' ')}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                p.status === 'approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                                  : p.status === 'rejected'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                                  : 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 animate-pulse'
                              }`}>
                                {language === 'ar'
                                  ? (p.status === 'pending' ? 'قيد المراجعة الفورية' : p.status === 'approved' ? 'مقبول ومحول' : 'مرفوض')
                                  : p.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-[10px] italic text-zinc-400">{p.notes || 'Waiting accounting verification...'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
