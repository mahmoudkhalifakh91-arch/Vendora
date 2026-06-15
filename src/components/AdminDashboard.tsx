/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order, Ticket } from '../types';
import { motion } from 'motion/react';
import { TrendingUp, ShoppingBag, Plus, Trash2, Edit2, AlertCircle, FileText, CheckCircle, RefreshCw, Send, Lock, User, MapPin, UserPlus } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    tickets,
    updateOrderStatus,
    addProduct,
    deleteProduct,
    language,
    notificationLogs,
    clearLogs,
    currentUser,
    users,
    registerAdmin,
    sellers,
    globalCommissionRate,
    transactions,
    payoutRequests,
    wallets,
    approveSeller,
    rejectSeller,
    updateSellerCommissionRate,
    setGlobalCommissionRate,
    approvePayoutRequest,
    rejectPayoutRequest,
    promoCoupons,
    addPromoCoupon,
    updatePromoCoupon,
    deletePromoCoupon
  } = useStore();

  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'products' | 'tickets' | 'admins' | 'sellers' | 'payouts' | 'promotions'>('stats');

  // Input fields for adding a new admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');

  // Input fields for adding a new product
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdDescEn, setNewProdDescEn] = useState('');
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('1000');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdImg, setNewProdImg] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');
  const [newProdCategory, setNewProdCategory] = useState('mobiles');

  // Dynamic Promotion Coupon generation form states
  const [promoCode, setPromoCode] = useState('');
  const [promoTitleAr, setPromoTitleAr] = useState('');
  const [promoTitleEn, setPromoTitleEn] = useState('');
  const [promoDescAr, setPromoDescAr] = useState('');
  const [promoDescEn, setPromoDescEn] = useState('');
  const [promoTermsAr, setPromoTermsAr] = useState('');
  const [promoTermsEn, setPromoTermsEn] = useState('');
  const [promoType, setPromoType] = useState<'free_shipping' | 'percentage' | 'fixed'>('free_shipping');
  const [promoValue, setPromoValue] = useState(0);
  const [promoMinCart, setPromoMinCart] = useState(1000);
  const [promoCategory, setPromoCategory] = useState('all');
  const [promoMinItems, setPromoMinItems] = useState(1);
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Core calculations and statistics
  const metrics = useMemo(() => {
    const validOrders = orders.filter(ord => (ord.status as string) !== 'cancelled');
    const totalSalesRevenue = validOrders.reduce((sum, ord) => sum + ord.total, 0);
    const avgOrderValue = validOrders.length > 0 ? Math.round(totalSalesRevenue / validOrders.length) : 0;
    const totalOutofStock = products.filter(p => p.stock === 0).length;
    const pendingReviewOrders = orders.filter(o => o.status === 'pending').length;
    const openTicketsCount = tickets.filter(t => t.status === 'open').length;

    return {
      totalSalesRevenue,
      avgOrderValue,
      totalOutofStock,
      pendingReviewOrders,
      openTicketsCount
    };
  }, [orders, products, tickets]);

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameEn || !newProdNameAr || !newProdPrice || !newProdImg) return;

    addProduct({
      nameEn: newProdNameEn,
      nameAr: newProdNameAr,
      descriptionEn: newProdDescEn,
      descriptionAr: newProdDescAr,
      price: parseFloat(newProdPrice) || 0,
      stock: parseInt(newProdStock) || 0,
      image: newProdImg,
      category: newProdCategory
    });

    // Reset fields
    setNewProdNameEn('');
    setNewProdNameAr('');
    setNewProdDescEn('');
    setNewProdDescAr('');
    setNewProdPrice('1000');
    setNewProdStock('10');
    setNewProdImg('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60');
  };

  // Custom Chart Data calculation (Latest 5 Orders)
  const chartSalesData = useMemo(() => {
    const sorted = [...orders].reverse().slice(-6);
    return sorted.map((ord, idx) => ({
      label: ord.id,
      amount: ord.total
    }));
  }, [orders]);

  // Comparative distribution of articles by categories
  const categoryCounts = useMemo(() => {
    const initial: { [key: string]: number } = { electronics: 0, fashion: 0, home: 0, beauty: 0 };
    products.forEach(p => {
      if (p.category in initial) {
        initial[p.category]++;
      } else {
        initial[p.category] = 1;
      }
    });
    return Object.keys(initial).map(key => ({
      name: key,
      count: initial[key]
    }));
  }, [products]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8" id="admin-dashboard-container">
      {/* Upper lock alert */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
            <Lock className="w-7 h-7 text-amber-500" />
            {language === 'ar' ? 'لوحة تحكم المدير والإدارة المالي' : 'Vendora Executive Administration Panel'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'ar' 
              ? 'تجهيز وتغيير وضع الطلبات، إضافة منتجات جديدة، تتبع الإشعار البريدي ومحاكاة واتساب، ورصد المخططات البيانية.'
              : 'Update delivery stages, manage catalogs, monitor automated WhatsApp text output and compile finance reports.'}
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? 'الإحصائيات والتقارير' : 'Financials & Stats'}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? `إدارة الطلبات (${orders.length})` : `Manage Orders (${orders.length})`}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'products'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? `كتالوج المنتجات (${products.length})` : `Update Catalog (${products.length})`}
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'tickets'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? `الشكاوى والمقترحات (${tickets.length})` : `Complaints / Suggestions (${tickets.length})`}
          </button>
          
          <button
            onClick={() => setActiveTab('sellers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'sellers'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? `طلبات التجار (${sellers.filter(s => s.status === 'pending').length}+)` : `Sellers Approvals (${sellers.filter(s => s.status === 'pending').length}+)`}
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'payouts'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? `حسابات وصرف الأرباح (${payoutRequests.filter(p => p.status === 'pending').length})` : `Payouts Audit (${payoutRequests.filter(p => p.status === 'pending').length})`}
          </button>
          
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'promotions'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            {language === 'ar' ? `العروض والخصومات ⚡` : `Promotions & Coupons ⚡`}
          </button>
          
          {currentUser?.role === 'superadmin' && (
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'admins'
                  ? 'bg-white dark:bg-zinc-900 text-teal-600 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              {language === 'ar' ? 'إضافة وإدارة المديرين 🔑' : 'Manage Admins 🔑'}
            </button>
          )}
        </div>
      </div>

      {/* Main Administrative Screens */}

      {/* VIEW 1: STATS & ANALYTICS CHARTS */}
      {activeTab === 'stats' && (
        <div className="space-y-6" id="admin-pane-stats">
          {/* Metrics upper row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
              <span className="text-zinc-400 text-xs block">{language === 'ar' ? 'إجمالي المبيعات المحققة بمصر' : 'Total Revenue (EGP)'}</span>
              <span className="text-2xl font-black text-teal-600 block mt-1">{metrics.totalSalesRevenue} EGP</span>
              <span className="text-[10px] text-zinc-400">{orders.length} {language === 'ar' ? 'طلب مسجل ومكتمل' : 'order entries placed.'}</span>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
              <span className="text-zinc-400 text-xs block">{language === 'ar' ? 'متوسط السلة الشرائية' : 'Average Basket Value'}</span>
              <span className="text-2xl font-black text-rose-500 block mt-1">{metrics.avgOrderValue} EGP</span>
              <span className="text-[10px] text-zinc-400">{language === 'ar' ? 'لكل عملية دفع صحيحة' : 'Computed per registered check.'}</span>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
              <span className="text-zinc-400 text-xs block">{language === 'ar' ? 'منتجات نفدت من المخزن' : 'Depleted Stocks'}</span>
              <span className={`text-2xl font-black block mt-1 ${metrics.totalOutofStock > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-700 dark:text-zinc-300'}`}>
                {metrics.totalOutofStock}
              </span>
              <span className="text-[10px] text-zinc-400">{language === 'ar' ? 'تحتاج إلى إعادة تزويد عاجلة' : 'Products currently at 0 stock.'}</span>
            </div>

            <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs">
              <span className="text-zinc-400 text-xs block">{language === 'ar' ? 'شكاوى واقتراحات العملاء المفتوحة' : 'Open Complaints / Suggestions'}</span>
              <span className="text-2xl font-black text-amber-500 block mt-1">{metrics.openTicketsCount}</span>
              <span className="text-[10px] text-zinc-400">{language === 'ar' ? 'خدمة تسوية الشكاوي الفورية بمصر' : 'Complaints requiring action.'}</span>
            </div>
          </div>

          {/* Interactive D3/SVG Visualizers Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts-layout">
            
            {/* Chart A: Earnings Area Curve chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-white mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                {language === 'ar' ? 'منحنى الإيرادات التراكمية والتصاعدي للطلبات الأخيرة' : 'Financial Earnings Growth (Recent Orders Stream)'}
              </h4>
              
              {chartSalesData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-zinc-400 italic">
                  {language === 'ar' ? 'سجل بضعة طلبات لرؤية تقارير المنحنى المالي.' : 'Place a few dummy orders to populate chart telemetry.'}
                </div>
              ) : (
                <div className="relative w-full" id="earnings-growth-visual">
                  {/* Styled vector graph using native values */}
                  <svg viewBox="0 0 400 180" className="w-full h-auto">
                    {/* Horizontal helper dashed grid lines */}
                    <line x1="30" y1="20" x2="380" y2="20" className="stroke-zinc-100 dark:stroke-zinc-800" strokeDasharray="3,3" />
                    <line x1="30" y1="70" x2="380" y2="70" className="stroke-zinc-100 dark:stroke-zinc-800" strokeDasharray="3,3" />
                    <line x1="30" y1="120" x2="380" y2="120" className="stroke-zinc-100 dark:stroke-zinc-800" strokeDasharray="3,3" />
                    <line x1="30" y1="150" x2="380" y2="150" className="stroke-zinc-200 dark:stroke-zinc-800" />

                    {/* Compute Area Coordinates */}
                    {(() => {
                      const maxVal = Math.max(...chartSalesData.map(d => d.amount), 5000);
                      const points = chartSalesData.map((d, i) => {
                        const stepX = 30 + (i * (350 / (chartSalesData.length - 1 || 1)));
                        const stepY = 150 - (d.amount / maxVal) * 120;
                        return { x: stepX, y: stepY, original: d };
                      });

                      const pathStr = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaStr = `${pathStr} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                      return (
                        <g>
                          {/* Shading Area Fill */}
                          <path d={areaStr} className="fill-teal-500/10 dark:fill-teal-500/5" />
                          {/* Curve Line */}
                          <path d={pathStr} fill="none" className="stroke-teal-600" strokeWidth="2.5" />
                          
                          {/* Node circles */}
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="4" className="fill-white stroke-teal-600" strokeWidth="2" />
                              <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[8px] font-mono fill-zinc-500 dark:fill-zinc-400 font-bold">
                                {p.original.amount}
                              </text>
                              <text x={p.x} y="165" textAnchor="middle" className="text-[7px] font-mono fill-zinc-400 uppercase font-semibold">
                                {p.original.label}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              )}
            </div>

            {/* Chart B: Category Distributions Column Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-white mb-4 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-rose-500" />
                {language === 'ar' ? 'توزع وتنوع البضائع عبر الكتالوج' : 'Category Distribution & Variety breakdown'}
              </h4>

              <div className="relative w-full" id="category-bar-visual">
                <svg viewBox="0 0 400 180" className="w-full h-auto">
                  <line x1="40" y1="150" x2="380" y2="150" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  
                  {categoryCounts.map((cat, idx) => {
                    const maxCount = Math.max(...categoryCounts.map(c => c.count), 4);
                    const barWidth = 35;
                    const barGap = 45;
                    const x = 50 + idx * (barWidth + barGap);
                    const barHeight = (cat.count / maxCount) * 110;
                    const y = 150 - barHeight;

                    return (
                      <g key={cat.name}>
                        {/* Bar pillar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barHeight, 2)}
                          rx="4"
                          className="fill-rose-500/80 hover:fill-rose-500 transition-colors cursor-pointer"
                        />
                        {/* Numerical Value indicator on top */}
                        <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[9px] font-mono font-bold fill-zinc-600 dark:fill-zinc-400">
                          {cat.count}
                        </text>
                        {/* Label bottom */}
                        <text x={x + barWidth / 2} y="165" textAnchor="middle" className="text-[8px] font-black uppercase fill-zinc-400">
                          {cat.name.slice(0, 5)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

          </div>

          {/* Quick diagnostic alert tracker */}
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-zinc-100 space-y-4" id="alerts-logger-diagnostic">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping block" />
                {language === 'ar' ? 'مخرج سيرفر الإشعارات الفوري المباشر (المراقبة)' : 'Live Notification Delivery Proxy Log Stream'}
              </h4>

              <button
                onClick={clearLogs}
                className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
                id="clear-logs-btn"
              >
                {language === 'ar' ? 'تصفير السجل' : 'Clear Logs'}
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              {language === 'ar' 
                ? 'تفقد التنبيهات النصية والبريدية المحاكية التي أصدرها المتجر وعناوين وجهاتها في المحافظات المصرية.'
                : 'Monitor mock email digests and WhatsApp chat triggers issued by Vendora order processing engines below.'}
            </p>

            <div className="font-mono text-xs max-h-[160px] overflow-y-auto space-y-1.5 bg-black/50 p-4 rounded-xl border border-zinc-800/80 text-emerald-400/90 whitespace-pre-wrap" id="admin-notif-logs-renderer">
              {notificationLogs.length === 0 ? (
                <p className="italic text-zinc-600 text-center py-4">
                  {language === 'ar' ? 'بانتظار موجة طلبات أو تغيير حالات لعقد الإرسال...' : 'Waiting for mock logs to record from checkout updates...'}
                </p>
              ) : (
                notificationLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-zinc-900 pb-1 font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ORDERS MANAGEMENT MODULE */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 space-y-4" id="admin-pane-orders">
          <h3 className="font-extrabold text-lg text-zinc-950 dark:text-white">
            {language === 'ar' ? 'التحكم وحالة الشحن لطلبات العملاء' : 'Active Client Orders Tracking Controls'}
          </h3>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs italic">
              {language === 'ar' 
                ? 'لم يتم تسجيل أي طلب شراء من قبل العملاء حتى الآن. قم بالذهاب للمتجر وتجربة الدفع وإصدار طلب ليظهر هنا فورا!' 
                : 'No client orders received. Go buy some items to generate tracking queues.'}
            </div>
          ) : (
            <div className="overflow-x-auto" id="orders-admin-table-scroll font-sans">
              <table className="w-full text-left rtl:text-right border-collapse text-xs" id="orders-admin-table">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase">
                    <th className="py-3 px-2">{language === 'ar' ? 'كود التتبع' : 'ID'}</th>
                    <th className="py-3 px-2">{language === 'ar' ? 'العميل والهاتف' : 'Customer'}</th>
                    <th className="py-3 px-2">{language === 'ar' ? 'المحافظة والعنوان' : 'Egypt Hub / Dest'}</th>
                    <th className="py-3 px-2">{language === 'ar' ? 'القيمة' : 'Value'}</th>
                    <th className="py-3 px-2">{language === 'ar' ? 'تعديل حالة السائق في الخريطة والتنبيهات المباشرة' : 'Road Stage & Alerts Dispatch'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                      {/* ID with highlight */}
                      <td className="py-4 px-2 font-mono font-black text-teal-600">
                        {ord.id}
                      </td>

                      {/* Customer contact Info */}
                      <td className="py-4 px-2">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{ord.customerName}</div>
                        <div className="text-zinc-400 text-[10px]">{ord.customerPhone} | {ord.customerEmail}</div>
                      </td>

                      {/* Destination Egypt */}
                      <td className="py-4 px-2">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{ord.city}</div>
                        <div className="text-zinc-400 text-[10px] line-clamp-1">{ord.address}</div>
                      </td>

                      {/* Total EGP */}
                      <td className="py-4 px-2 font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {ord.total} EGP
                      </td>

                      {/* Interactive drop change state */}
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            onChange={(e: any) => updateOrderStatus(ord.id, e.target.value)}
                            className="p-1 px-2 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="pending">{language === 'ar' ? 'انتظار المراجعة (Pending)' : 'Pending Review'}</option>
                            <option value="preparing">{language === 'ar' ? 'قيد التعبئة والتجهيز (Preparing)' : 'In Preparation'}</option>
                            <option value="shipping">{language === 'ar' ? 'شحن خارجي مع السائق (Shipping)' : 'Out with Express Driver'}</option>
                            <option value="delivered">{language === 'ar' ? 'تم الوصول وتسليم المنتجات (Delivered)' : 'Delivered & Complete'}</option>
                          </select>
                          
                          {/* Alert success dot */}
                          <span className="h-2 w-2 rounded-full inline-block bg-teal-500 animate-pulse" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PRODUCT CATALOG CREATOR & DELETER */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-pane-products">
          
          {/* Form Create */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-600 flex items-center gap-1">
              <Plus className="w-5 h-5" />
              {language === 'ar' ? 'إطلاق منتج جديد بالكتالوج' : 'Add New Premium Product'}
            </h3>

            <form onSubmit={handleCreateProductSubmit} className="space-y-3 font-sans" id="product-create-form">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (En)'}</label>
                  <input
                    type="text"
                    required
                    value={newProdNameEn}
                    onChange={(e) => setNewProdNameEn(e.target.value)}
                    placeholder="Premium Cotton Shirt"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'الاسم بالعربية' : 'Name (Ar)'}</label>
                  <input
                    type="text"
                    required
                    value={newProdNameAr}
                    onChange={(e) => setNewProdNameAr(e.target.value)}
                    placeholder="قميص قطني فاخر"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="1200"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'مخزون السلعة' : 'Stock count'}</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    placeholder="15"
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'القسم والنوع' : 'Category'}</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
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

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'رابط صورة السلعة (URL)' : 'Product Image link'}</label>
                <input
                  type="text"
                  required
                  value={newProdImg}
                  onChange={(e) => setNewProdImg(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'الوصف بالإنجليزية' : 'Description (En)'}</label>
                <textarea
                  rows={2}
                  value={newProdDescEn}
                  onChange={(e) => setNewProdDescEn(e.target.value)}
                  placeholder="Organic thread design..."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-0.5 block">{language === 'ar' ? 'الوصف بالعربية' : 'Description (Ar)'}</label>
                <textarea
                  rows={2}
                  value={newProdDescAr}
                  onChange={(e) => setNewProdDescAr(e.target.value)}
                  placeholder="تصميم بخيوط قطنية عضوية عالية الجودة..."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إطلاق وقيد المنتج بالمتجر 🚀' : 'Confirm Launch & Add to Store 🚀'}
              </button>
            </form>
          </div>

          {/* Catalog items stock view and delete */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>{language === 'ar' ? 'تفقد البضائع وإحصاء المخازن' : 'In-store Active Catalog Stock Ledger'}</span>
              <span className="text-zinc-500 font-mono">({products.length} {language === 'ar' ? 'بضاعة' : 'products'})</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1" id="admin-catalog-stock-list">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.nameEn}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                        {language === 'ar' ? item.nameAr : item.nameEn}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono">
                        ID: {item.id} | Price: {item.price} EGP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className={`text-xs font-bold block ${item.stock === 0 ? 'text-red-500 animate-pulse' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {item.stock} {language === 'ar' ? 'في المخزن' : 'in Stock'}
                      </span>
                      <span className="text-[9px] text-zinc-400 block font-mono">
                        {item.salesCount} {language === 'ar' ? 'مبيعة' : 'Sales'}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteProduct(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                      title={language === 'ar' ? 'حذف المنتج النهائي' : 'Delete Product Entry'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: COMPLAINTS & SUGGESTIONS FEEDBACK */}
      {activeTab === 'tickets' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 space-y-4" id="admin-pane-tickets">
          <h3 className="font-extrabold text-lg text-zinc-950 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            {language === 'ar' ? 'بريد خدمة العملاء بالمتجر (الشكاوى والمقترحات)' : 'Client Complaints & Suggestions Inbox (Egypt Local Support)'}
          </h3>

          {tickets.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs italic border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
              {language === 'ar' 
                ? 'لا شكاوى أو بلاغات مسجلة في الوقت الراهن بالمتجر. يمكنك محاكاة إرسال بلاغ خدمة عملاء من التبويب المخصص بالمتجر.' 
                : 'Customer service inbox is currently empty. Test complaints submissions from Customer support section.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="tickets-admin-grid">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      t.type === 'complaint' 
                        ? 'bg-red-100 dark:bg-red-950/45 text-red-800 dark:text-red-400' 
                        : t.type === 'suggestion' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800 dark:text-emerald-400' 
                          : 'bg-blue-100 dark:bg-blue-950/45 text-blue-800 dark:text-blue-400'
                    }`}>
                      {t.type === 'complaint' && (language === 'ar' ? '⚠️ شكوى شحن/بضاعة' : 'Complaint')}
                      {t.type === 'suggestion' && (language === 'ar' ? '💡 مقترح تطوير' : 'Suggestion')}
                      {t.type === 'inquiry' && (language === 'ar' ? '💬 استفسار عام' : 'Inquiry')}
                    </span>

                    <span className="text-[10px] font-mono text-zinc-400">{t.date}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{t.title}</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{t.description}</p>
                  </div>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{t.senderName}</p>
                      <p className="text-zinc-400 text-[10px] font-mono">{t.senderEmail}</p>
                    </div>

                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 bg-emerald-100/30 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'تم الاستلام والاستجابة' : 'Received & Processing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: MANAGE ADMINS (SUPERADMIN ONLY) */}
      {activeTab === 'admins' && currentUser?.role === 'superadmin' && (
        <div className="space-y-6 animate-fadeIn" id="admin-pane-admins">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Hand: Create an Admin form */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-950 dark:text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-500" />
                  {language === 'ar' ? 'إنشاء حساب مدير جديد' : 'Register New Manager Account'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {language === 'ar' 
                    ? 'يمكنك إضافة مدير مالي أو مدير تشغيل جديد للنظام لمساعدتك في إدارة العمليات.' 
                    : 'Provision full administrative credentials for a new operations manager.'}
                </p>
              </div>

              {adminSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              {adminError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                setAdminSuccess('');
                setAdminError('');

                if (!adminName || !adminEmail || !adminPhone || !adminPassword) {
                  setAdminError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة بالكامل.' : 'Please fill out all manager details.');
                  return;
                }

                const res = registerAdmin(adminName, adminEmail, adminPhone, adminPassword);
                if (res.success) {
                  setAdminSuccess(language === 'ar' ? `تم تسجيل المدير ${adminName} بنجاح للعمل المباشر!` : `Successfully registered ${adminName} as a Store Administrator!`);
                  setAdminName('');
                  setAdminEmail('');
                  setAdminPhone('');
                  setAdminPassword('');
                } else {
                  setAdminError(language === 'ar' ? res.errorAr : res.errorEn);
                }
              }} className="space-y-3.5" id="add-admin-form">
                <div>
                  <label className="block text-xs text-zinc-500 font-bold mb-1.5">{language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full text-xs font-medium p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all font-sans"
                    placeholder={language === 'ar' ? 'مثال: محمود عادل' : 'e.g. Mahmoud Adel'}
                    id="admin-form-name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 font-bold mb-1.5">{language === 'ar' ? 'البريد الإلكتروني' : 'Mail Address (ID)'}</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="name@azstore.eg"
                    id="admin-form-email"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 font-bold mb-1.5">{language === 'ar' ? 'رقم الهاتف المحمول' : 'Egyptian Mobile Number'}</label>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="01200000000"
                    id="admin-form-phone"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 font-bold mb-1.5">{language === 'ar' ? 'كلمة المرور' : 'Secure Admin Password'}</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-hidden focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="••••••••"
                    id="admin-form-password"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full p-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إضافة وتفعيل المدير' : 'Deploy Administrator'}</span>
                </button>
              </form>
            </div>

            {/* Right Hand: Admins list details */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-950 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" />
                  {language === 'ar' ? 'المديرون والمسؤولون النشطون بالنظام' : 'Active System Operations Personnel'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {language === 'ar'
                    ? 'قائمة المسؤولين المخولين بالوصول للبيانات وتعديل الأسعار وإدارة المنظومة والجمهور.'
                    : 'Authorized operational members with console permissions.'}
                </p>
              </div>

              <div className="overflow-x-auto" id="admins-list-table-container">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-left rtl:text-right text-zinc-400 font-bold">
                      <th className="pb-3 pt-1">{language === 'ar' ? 'الاسم والصفة' : 'Personnel Name'}</th>
                      <th className="pb-3 pt-1">{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</th>
                      <th className="pb-3 pt-1">{language === 'ar' ? 'رقم الهاتف' : 'Egyptian Phone'}</th>
                      <th className="pb-3 pt-1 text-center">{language === 'ar' ? 'مستوى الصلاحية' : 'Permission Level'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                    {users
                      .filter(u => u.role === 'admin' || u.role === 'superadmin')
                      .map((u) => (
                        <tr key={u.id} className="text-zinc-800 dark:text-zinc-200">
                          <td className="py-3.5 pr-2">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold font-sans">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-extrabold text-zinc-950 dark:text-white animate-pulse-slow">{u.name}</p>
                                <p className="text-[10px] text-zinc-400 font-sans">ID: {u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                            {u.email}
                          </td>
                          <td className="py-3.5 font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                            {u.phone}
                          </td>
                          <td className="py-3.5 text-center">
                            <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                              u.role === 'superadmin' 
                                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-200/60 dark:border-rose-905-200/20' 
                                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/20'
                            }`}>
                              {u.role === 'superadmin' 
                                ? (language === 'ar' ? 'مدير عام / سوبر' : 'Super Admin') 
                                : (language === 'ar' ? 'مدير مالي / تشغيل' : 'Store Admin')}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 6: SELLERS APPROVAL & COMMISSION CONFIGURATION */}
      {activeTab === 'sellers' && (
        <div className="space-y-6 animate-fadeIn" id="admin-pane-sellers">
          {/* Global Commission Setting Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-6 space-y-4">
            <h3 className="font-extrabold text-base text-zinc-950 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              {language === 'ar' ? 'إعداد ومراقبة عمولة المنصة الممررة' : 'Global Marketplace Commission Configuration'}
            </h3>
            <p className="text-xs text-zinc-400">
              {language === 'ar'
                ? 'العمولة الأساسية المقتطعة تلقائياً للتحويلات هي 10%. يمكنك ضبط العمولة من 5% إلى 15% كحد أقصى.'
                : 'Configure standard global market commission rate. Allowed commission limit boundaries are between 5% and 15%.'}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-bold font-sans">
              <div className="space-y-1">
                <label className="text-zinc-550 dark:text-zinc-350">{language === 'ar' ? 'النسبة المئوية الحالية (%)' : 'Current Global Commission (%)'}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="15"
                    value={globalCommissionRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 10;
                      if (val >= 5 && val <= 15) {
                        setGlobalCommissionRate(val);
                      }
                    }}
                    className="w-24 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg text-center font-mono font-black text-zinc-800 dark:text-white"
                  />
                  <span className="text-sm font-black text-zinc-650">%</span>
                </div>
              </div>
              <p className="bg-zinc-55 dark:bg-zinc-950 p-3 rounded-xl max-w-md text-[11px] leading-relaxed text-zinc-560 font-medium border border-zinc-150 dark:border-zinc-850">
                💡 {language === 'ar'
                  ? 'أي طلب يتم تقديمه جديداً يتقاضى النظام تلقائياً هذه النسبة إلا لو تم ضبط نسبة مخصصة لهذا البائع بعينه.'
                  : 'All future distributed sales invoices deduct this rate, unless a specific over-ride is tailored for a particular seller.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Hand: Pending applications */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-6 space-y-4">
              <h3 className="font-extrabold text-base text-zinc-950 dark:text-white border-b border-zinc-50 dark:border-zinc-850 pb-3">
                {language === 'ar' ? 'طالبي العضوية والمعرّفين الجدد للتدقيق' : 'Pending Merchant Registrations'}
              </h3>

              {sellers.filter(s => s.status === 'pending').length === 0 ? (
                <p className="text-xs text-zinc-400 py-12 text-center">{language === 'ar' ? 'لا توجد طلبات شراكة معلقة حالياً.' : 'No pending merchant registration requests.'}</p>
              ) : (
                <div className="space-y-4">
                  {sellers.filter(s => s.status === 'pending').map((sel) => (
                    <div key={sel.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-805 bg-zinc-50/50 dark:bg-zinc-950 space-y-3" id={`pending-store-app-${sel.id}`}>
                      <div className="flex items-start gap-3">
                        <img src={sel.logo} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">{sel.storeName}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{language === 'ar' ? 'المسئول:' : 'Owner:'} {sel.name} ({sel.phone})</p>
                          <p className="text-[10px] text-zinc-400">{sel.email}</p>
                        </div>
                      </div>
                      
                      <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-[10px] text-zinc-502 font-medium">
                        <strong>Bio:</strong> {sel.bioAr}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => approveSeller(sel.id)}
                          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer text-center"
                        >
                          {language === 'ar' ? 'قبول وتفعيل' : 'Approve & Activate'}
                        </button>
                        <button
                          onClick={() => rejectSeller(sel.id)}
                          className="flex-1 bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 text-zinc-600 font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer text-center"
                        >
                          {language === 'ar' ? 'رفض الطلب' : 'Reject Application'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Hand: Active Sellers List with Custom Commission Rate settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-xs p-6 space-y-4">
              <h3 className="font-extrabold text-base text-zinc-950 dark:text-white border-b border-zinc-50 dark:border-zinc-850 pb-3">
                {language === 'ar' ? 'قائمة التجار الزراعيين المفعلين والعمولة الخاصة' : 'Approved Partner Commission Modals'}
              </h3>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {sellers.filter(s => s.status === 'approved').map((sel) => (
                  <div key={sel.id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/70 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={sel.logo} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-extrabold text-zinc-900 dark:text-white">{sel.storeName}</h4>
                        <div className="flex gap-3 text-[10px] text-zinc-400 mt-0.5">
                          <span>{language === 'ar' ? 'التقييم:' : 'Rate:'} ⭐ {sel.rating}</span>
                          <span>•</span>
                          <span>{sel.joinedDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Rate input */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{language === 'ar' ? 'عمولة التاجر:' : 'Custom Fee:'}</span>
                      <input
                        type="number"
                        min="5"
                        max="15"
                        value={sel.customCommissionRate || 10}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value) || 10;
                          if (rate >= 5 && rate <= 15) {
                            updateSellerCommissionRate(sel.id, rate);
                          }
                        }}
                        className="w-16 p-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white rounded-lg text-center font-mono font-bold"
                      />
                      <span className="font-black text-teal-605">%</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 7: PAYOUTS AUDIT & WALLET LEDGER JOURNAL */}
      {activeTab === 'payouts' && (
        <div className="space-y-6 animate-fadeIn" id="admin-pane-payouts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Pending Payout approvals form */}
            <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-6 space-y-4">
              <h3 className="font-extrabold text-base text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                {language === 'ar' ? 'طلبات سحب وصرف مستحقات التجار المعلقة' : 'Pending Wallet Payout Inquiries'}
              </h3>

              {payoutRequests.filter(p => p.status === 'pending').length === 0 ? (
                <p className="text-xs text-zinc-405 py-16 text-center">{language === 'ar' ? 'لا توجد طلبات سحب معلقة حالياً للصرف.' : 'Clear - No pending payouts requests found.'}</p>
              ) : (
                <div className="space-y-4">
                  {payoutRequests.filter(p => p.status === 'pending').map((pay) => {
                    const linkedSeller = sellers.find(s => s.id === pay.sellerId);
                    return (
                      <div key={pay.id} className="p-4 rounded-xl border border-rose-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 space-y-3" id={`payout-item-${pay.id}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[9px] text-zinc-400 font-bold">REQ: {pay.id}</span>
                          <span className="text-zinc-400 text-[10px]">{pay.date}</span>
                        </div>

                        <div>
                          <p className="font-extrabold text-xs text-zinc-900 dark:text-white">{linkedSeller?.storeName || pay.sellerId}</p>
                          <p className="text-xl font-black text-rose-500 font-mono mt-1">-{pay.amount.toLocaleString()} EGP</p>
                          <p className="text-[10px] text-zinc-500 bg-white dark:bg-zinc-900 p-2 border border-zinc-100 dark:border-zinc-800 mt-2 rounded">
                            <strong className="uppercase">{pay.paymentMethod.replace('_', ' ')}:</strong> {pay.paymentDetails}
                          </p>
                        </div>

                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => approvePayoutRequest(pay.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg cursor-pointer text-center text-[11px]"
                          >
                            {language === 'ar' ? 'موافقة وتحويل' : 'Release Cash'}
                          </button>
                          <button
                            onClick={() => rejectPayoutRequest(pay.id, 'Insufficient clear funds / Audit failure')}
                            className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-1.5 px-3 rounded-lg cursor-pointer text-center text-[11px]"
                          >
                            {language === 'ar' ? 'رفض الطلب' : 'Reject & Lock'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Global transactions ledger */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xs p-6 space-y-4">
              <h3 className="font-extrabold text-base text-zinc-950 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
                {language === 'ar' ? 'سجل العمليات وحركات المحاسبة وتوزيع المبيعات' : 'Automated Marketplace Transaction Clearing Sheet'}
              </h3>

              {transactions.length === 0 ? (
                <p className="text-xs text-zinc-400 py-16 text-center">{language === 'ar' ? 'لا توجد حركات تسوية مالية اليوم بالقائمة.' : 'Commission ledger ledger is empty.'}</p>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left rtl:text-right border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[9px]/[1.5]">
                        <th className="pb-3">{language === 'ar' ? 'التسوية' : 'TX ID'}</th>
                        <th className="pb-3">{language === 'ar' ? 'المتجر المستفيد' : 'Seller Name'}</th>
                        <th className="pb-3">{language === 'ar' ? 'القيمة الإجمالية' : 'Order Gross'}</th>
                        <th className="pb-3 text-rose-500">{language === 'ar' ? 'حق السيرفر (١٠٪)' : 'Invoiced Fee'}</th>
                        <th className="pb-3 text-emerald-500">{language === 'ar' ? 'المحول للمربط' : 'Merchant WalletNet'}</th>
                        <th className="pb-3">{language === 'ar' ? 'الحالة' : 'Log State'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium text-zinc-650 dark:text-zinc-305">
                      {transactions.map((tx) => {
                        const storeMeta = sellers.find(s => s.id === tx.sellerId);
                        return (
                          <tr key={tx.id}>
                            <td className="py-2.5 font-mono text-[9px] text-zinc-400 font-bold">{tx.id}</td>
                            <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">{storeMeta?.storeName || tx.sellerId}</td>
                            <td className="py-2.5 font-mono font-bold">{tx.amount.toLocaleString()} EGP</td>
                            <td className="py-2.5 font-mono text-rose-500">-{tx.commissionAmount.toLocaleString()} EGP ({tx.commissionRate}%)</td>
                            <td className="py-2.5 font-mono text-emerald-500 font-black font-sans">+{tx.netAmount.toLocaleString()} EGP</td>
                            <td className="py-2.5 font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                tx.status === 'cleared' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950 text-amber-500'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIEW 8: PROMOTIONS & MARKETING COUPONS MANAGEMENT */}
      {activeTab === 'promotions' && (
        <div className="space-y-6" id="admin-pane-promotions" style={{ direction: 'rtl' }}>
          {/* Section banner */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl border border-slate-850 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                أدوات التحكم وتخصيص قسائم الشحن والعروض الذكية (تسويق)
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                هذه الواحة تتيح للمدير العام والـ Admins إنشاء وتعديل شروط ظهور العروض والتخفيضات بدقة للعملاء. 
                سيظهر الكوبون المصمم (كارت الشحن أو كارت التخفيض) بشكل فوري لعملاء تجزئة وعملاء الجملة الذين يستوفون شروطك فقط!
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5 font-bold flex-shrink-0">
              <span className="text-emerald-400 font-mono font-black">{promoCoupons.length}</span>
              <span>قسائم مسجلة</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Area: Add New Coupon Form */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 p-5 md:p-6 shadow-sm">
              <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 mb-4 border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-1.5">
                <span>➕</span>
                تصميم وإصدار قسيمة ترويجية جديدة
              </h4>

              {promoError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  {promoError}
                </div>
              )}

              {promoSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold mb-4 flex items-center gap-2 animate-pulse">
                  <span>✅</span>
                  {promoSuccess}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!promoCode.trim()) {
                    setPromoError('يرجى تحديد رمز كوبون فريد (مثال: FREE_EGYPT)');
                    return;
                  }
                  if (!promoTitleAr.trim()) {
                    setPromoError('يرجى كتابة عنوان الكوبون باللغة العربية');
                    return;
                  }
                  if (!promoDescAr.trim()) {
                    setPromoError('يرجى كتابة الشرح والتفاصيل باللغة العربية لتظهر للناس');
                    return;
                  }
                  if (!promoTermsAr.trim()) {
                    setPromoError('يرجى تعيين شروط وأحكام الكوبون المصغرة');
                    return;
                  }

                  // Successfully compile and add the promo coupon
                  addPromoCoupon({
                    code: promoCode.trim().toUpperCase(),
                    titleAr: promoTitleAr.trim(),
                    titleEn: promoTitleEn.trim() || promoTitleAr.trim(),
                    descriptionAr: promoDescAr.trim(),
                    descriptionEn: promoDescEn.trim() || promoDescAr.trim(),
                    discountType: promoType,
                    discountValue: promoType === 'free_shipping' ? 0 : Number(promoValue) || 0,
                    minCartTotal: Number(promoMinCart) || 0,
                    requiredCategory: promoCategory,
                    minItemsCount: Number(promoMinItems) || 1,
                    isActive: promoIsActive,
                    termsDetailsAr: promoTermsAr.trim(),
                    termsDetailsEn: promoTermsEn.trim() || promoTermsAr.trim()
                  });

                  // Reset states
                  setPromoCode('');
                  setPromoTitleAr('');
                  setPromoTitleEn('');
                  setPromoDescAr('');
                  setPromoDescEn('');
                  setPromoTermsAr('');
                  setPromoTermsEn('');
                  setPromoType('free_shipping');
                  setPromoValue(0);
                  setPromoMinCart(1000);
                  setPromoCategory('all');
                  setPromoMinItems(1);
                  setPromoIsActive(true);
                  setPromoError('');
                  setPromoSuccess('تم إصدار ونشر الكوبون التسويقي بنجاح! سيخضع الآن لقواعد الفرز المخصصة عند تصفح العملاء.');
                  setTimeout(() => setPromoSuccess(''), 5000);
                }}
                className="space-y-4 text-xs"
              >
                {/* 1. Code & Type row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase font-sans">رمز الكوبون (الرمز التسويقي بالإنجليزية) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ULTRA_SHIPPING"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono uppercase font-black tracking-widest text-[#5294e2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">نوع المكافأة والتخفيض *</label>
                    <select
                      value={promoType}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setPromoType(val);
                        if (val === 'free_shipping') setPromoValue(0);
                      }}
                      className="w-full p-2.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 font-extrabold"
                    >
                      <option value="free_shipping">شحن مجاني بالكامل (0 EGP شحن)</option>
                      <option value="percentage">نسبة مئوية مخصصة للخصم (%)</option>
                      <option value="fixed">مبلغ خصم ثابت مخصوم كلياً (EGP)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Discount value only visible if percentage or fixed */}
                {promoType !== 'free_shipping' && (
                  <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-center justify-between gap-4">
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {promoType === 'percentage' ? 'عيّن النسبة المئوية % خصم من السلة (1% إلى 99%)' : 'عيّن مبلغ الخصم المباشر بالجنيه المصري (EGP)'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={promoValue}
                      onChange={(e) => setPromoValue(Number(e.target.value))}
                      className="w-24 p-2 rounded-lg border border-zinc-200 bg-white text-center font-extrabold"
                    />
                  </div>
                )}

                {/* 3. Titles En / Ar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">العنوان باللغة العربية (يظهر على الكوبون) *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: قسيمة الشحن المجاني بمصر ⚡"
                      value={promoTitleAr}
                      onChange={(e) => setPromoTitleAr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">العنوان باللغة الإنجليزية (اختياري)</label>
                    <input
                      type="text"
                      placeholder="e.g. Free Egypt Shipping Discount ⚡"
                      value={promoTitleEn}
                      onChange={(e) => setPromoTitleEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                {/* 4. Descriptions En / Ar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">شرح ووصف العرض باللغة العربية *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="اكتب عبارات ترويجية تشجع على الاستهلاك..."
                      value={promoDescAr}
                      onChange={(e) => setPromoDescAr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 leading-relaxed font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">شرح ووصف العرض باللغة الإنجليزية (اختياري)</label>
                    <textarea
                      rows={2}
                      placeholder="English copywriting for target shoppers..."
                      value={promoDescEn}
                      onChange={(e) => setPromoDescEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 leading-relaxed font-sans"
                    />
                  </div>
                </div>

                {/* 5. Rules Settings Header */}
                <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 block mb-3">📍 إعداد وتعيين شروط الاستحقاق ومحدودية الظهور (قواعد الفرز):</span>
                  <p className="text-[10px] text-zinc-400 leading-normal mb-3">
                    لن يتمكّن العميل من رؤية أو تطبيق هذه القسيمة إلا إذا استوفى سلتُه الشروط المكتوبة أدناه بدقة متناهية:
                  </p>
                </div>

                {/* 6. Parameters rows */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">مبلغ السلة الأدنى (EGP) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={promoMinCart}
                      onChange={(e) => setPromoMinCart(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-zinc-250 bg-white dark:bg-zinc-900 font-mono text-center font-extrabold"
                    />
                    <span className="text-[9px] text-zinc-400 mt-1 block">الحق الدائن للشراء فوقه (مثال: 1000)</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">الحد الأدنى للأجهزة/القطع *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={promoMinItems}
                      onChange={(e) => setPromoMinItems(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-zinc-250 bg-white dark:bg-zinc-900 font-mono text-center font-extrabold"
                    />
                    <span className="text-[9px] text-zinc-400 mt-1 block">عدد السلع المطلوبة كحد أدنى</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">التصنيف المستهدف الحصري</label>
                    <select
                      value={promoCategory}
                      onChange={(e) => setPromoCategory(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-zinc-250 bg-white dark:bg-zinc-900 font-bold"
                    >
                      <option value="all">كل التصنيفات (All products)</option>
                      <option value="feed">الأعلاف والإنتاج الداجني (Feeds)</option>
                      <option value="vet">الأدوية والبيطري (Vet Pharma)</option>
                      <option value="spare_parts">قطع الغيار والصيانة (Spare Parts)</option>
                      <option value="agricultural">أدوات الري والزراعة (Agri Drip)</option>
                      <option value="additives">إضافات الأعلاف وعلاجات (Feed Additives)</option>
                    </select>
                    <span className="text-[9px] text-zinc-400 mt-1 block">تقييد الظهور لمنتجات محددة</span>
                  </div>
                </div>

                {/* 7. Terms footer note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">ملاحظة الكوبون وشروط الاستخدام باللغة العربية *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: *صالح لكل المحافظات والطلب الفردي"
                      value={promoTermsAr}
                      onChange={(e) => setPromoTermsAr(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5">ملاحظة الكوبون وشروط الاستخدام باللغة الإنجليزية (اختياري)</label>
                    <input
                      type="text"
                      placeholder="e.g. *Valid on singular checkout only"
                      value={promoTermsEn}
                      onChange={(e) => setPromoTermsEn(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    />
                  </div>
                </div>

                {/* 8. Active state and Button Submit */}
                <div className="flex items-center justify-between pt-4 gap-4 border-t border-zinc-100 dark:border-zinc-850">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promoIsActive}
                      onChange={(e) => setPromoIsActive(e.target.checked)}
                      className="w-4.5 h-4.5 text-teal-600 rounded-md accent-teal-600 cursor-pointer"
                    />
                    <span className="font-extrabold text-[#111] dark:text-[#eee]">تفعيل الكوبون ونشره فوراً للعملاء المؤهلين</span>
                  </label>

                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 px-6 rounded-xl cursor-pointer shadow-md transition-colors text-xs flex items-center gap-1.5"
                  >
                    اصدار وحفظ القسيمة الآن 🚀
                  </button>
                </div>
              </form>
            </div>

            {/* Right Area: Real-time visual mockup preview & current active promotions */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              {/* Mockup Preview Card */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="text-[10px] bg-slate-800 text-slate-400 font-extrabold uppercase px-1.5 rounded">
                    Mockup Preview (مظهر العميل)
                  </span>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>

                {/* Mock card matching actual PromoCouponWidget */}
                <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-right relative overflow-hidden select-none">
                  {/* Glowing background circles */}
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 mb-3 border-b border-slate-800/60 pb-3">
                    <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1 font-mono">
                      {promoType === 'free_shipping' ? (
                        <>
                          <span>EGP</span>
                          <span>0</span>
                        </>
                      ) : promoType === 'percentage' ? (
                        <span>{promoValue || 15}% OFF</span>
                      ) : (
                        <span>{promoValue || 150} EGP</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-right text-sm font-black text-slate-100">
                      <span>{promoTitleAr || 'قسيمة الشحن المجاني بمصر ⚡'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4 text-right">
                    {promoDescAr || 'استخدم كود الخصم الفوري لمضاعفة المبيعات والحصول على شحن مجاني بالكامل لكافة مشترياتك هذا اليوم.'}
                  </p>

                  <div className="bg-slate-900 border border-dashed border-slate-850 rounded-xl p-3.5 flex items-center justify-between gap-3 text-sm mb-3">
                    <span className="font-mono tracking-widest text-[#5294e2] font-black uppercase text-center flex-grow">
                      {promoCode || 'FREE_EGYPT'}
                    </span>
                    <button type="button" className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold">
                      نسخ ومحاكاة
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 font-sans block text-right">
                    {promoTermsAr || '*صالح لكل المحافظات والطلب الفردي'}
                  </span>
                </div>
              </div>

              {/* Current Active Coupons Grid List */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 p-5 shadow-sm">
                <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-1.5">
                  📁 الكوبونات المسجلة والفعالة بالمنصة
                </h4>

                {promoCoupons.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl">
                    <p className="text-xs font-bold font-sans">لا توجد قسائم ترويجية مسجلة حتى الآن.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                    {promoCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 rounded-xl text-right relative hover:bg-zinc-100/40 transition-colors"
                        id={`admin-coupon-row-${coupon.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          {/* Toggle switch */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                updatePromoCoupon({
                                  ...coupon,
                                  isActive: !coupon.isActive
                                });
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer uppercase ${
                                coupon.isActive 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {coupon.isActive ? (language === 'ar' ? 'فعّال لعامة الناس' : 'Active') : (language === 'ar' ? 'معطل ومخفي' : 'Inactive')}
                            </button>

                            <button
                              onClick={() => deletePromoCoupon(coupon.id)}
                              type="button"
                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#111] dark:text-[#eee] font-mono tracking-widest">
                              {coupon.code}
                            </span>
                            <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {coupon.discountType === 'free_shipping' ? 'شحن مجاني' : coupon.discountType === 'percentage' ? `خصم %${coupon.discountValue}` : `خصم EGP ${coupon.discountValue}`}
                            </span>
                          </div>
                        </div>

                        {/* Title details */}
                        <p className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{coupon.titleAr}</p>
                        
                        {/* Summary of constraints */}
                        <div className="mt-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-850 text-[10px] text-zinc-500 space-y-1">
                          <div className="flex justify-between">
                            <span>الحد الأدنى للسلة:</span>
                            <span className="font-extrabold text-[#111] dark:text-zinc-300 font-mono">{coupon.minCartTotal} EGP</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الحد الأدنى للقطع:</span>
                            <span className="font-bold">{coupon.minItemsCount} قطع</span>
                          </div>
                          <div className="flex justify-between">
                            <span>تقييد الفئة:</span>
                            <span className="font-extrabold text-blue-500">
                              {coupon.requiredCategory === 'all' 
                                ? 'كل الفئات' 
                                : coupon.requiredCategory === 'feed' ? 'الأعلاف' : coupon.requiredCategory === 'vet' ? 'البيطري' : coupon.requiredCategory}
                            </span>
                          </div>
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

      {/* VIEW 9: PROMOTIONS END */}

    </div>
  );
};

