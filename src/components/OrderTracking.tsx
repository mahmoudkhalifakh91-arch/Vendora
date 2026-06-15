/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { Search, MapPin, Truck, CheckCircle2, Clock, Calendar, Mail, MessageSquare, Compass, Send } from 'lucide-react';

// Coordinates of Egyptian Shipping Hubs on our custom SVG coordinate map of Egypt
const CITY_COORDS: { [key: string]: { x: number; y: number; ar: string; en: string } } = {
  'Cairo': { x: 200, y: 180, ar: 'القاهرة (مركز التوزيع الأول)', en: 'Cairo (Central Distribution Hub)' },
  'Giza': { x: 190, y: 195, ar: 'الجيزة', en: 'Giza' },
  'Alexandria': { x: 90, y: 105, ar: 'الإسكندرية (عروس المتوسط)', en: 'Alexandria' },
  'Mansoura': { x: 215, y: 115, ar: 'المنصورة (الدلتا)', en: 'Mansoura' },
  'Port Said': { x: 285, y: 110, ar: 'بورسعيد (القناة)', en: 'Port Said' },
  'Suez': { x: 280, y: 185, ar: 'السويس', en: 'Suez' },
  'Tantah': { x: 175, y: 130, ar: 'طنطا', en: 'Tanta' },
  'Luxor': { x: 250, y: 295, ar: 'الأقصر (الصعيد)', en: 'Luxor' },
  'Aswan': { x: 260, y: 340, ar: 'أسوان', en: 'Aswan' }
};

export const OrderTracking: React.FC = () => {
  const { trackOrder, language, currentOrderTrackingId, setCurrentOrderTrackingId, notificationLogs, orders, currentUser } = useStore();
  const [searchInput, setSearchInput] = useState(currentOrderTrackingId);
  const [searchedId, setSearchedId] = useState(currentOrderTrackingId);

  const matchedOrder = searchedId ? trackOrder(searchedId) : undefined;
  
  // Find current position / path
  const destinationCity = matchedOrder ? matchedOrder.city : 'Cairo';
  const startHub = CITY_COORDS['Cairo'];
  const endHub = CITY_COORDS[destinationCity] || CITY_COORDS['Cairo'];
  
  // Calculate current dynamic coordinate of delivery vehicle
  const progressPercent = matchedOrder ? matchedOrder.progressPercent : 0;
  const progressRatio = progressPercent / 100;
  const carX = startHub.x + (endHub.x - startHub.x) * progressRatio;
  const carY = startHub.y + (endHub.y - startHub.y) * progressRatio;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedId(searchInput);
    setCurrentOrderTrackingId(searchInput);
  };

  // Filter logs for this specific order
  const orderSpecificLogs = notificationLogs.filter(log => log.includes(searchedId));

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8" id="tracking-portal-wrapper">
      <div className="mb-6 space-y-2">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2" id="tracking-title">
          <Compass className="w-8 h-8 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
          {language === 'ar' ? 'تتبع طلبك لحظة بلحظة' : 'Real-time Order Tracking Map'}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {language === 'ar' 
            ? 'أدخل كود التتبع الخاص بك (مثلاً: VD-XXXXX) الذي تسلمته بالبريد وتتبع الشحنة وعربة التوصيل فورياً على الخريطة المصرية.' 
            : 'Enter your custom order code (e.g. VD-XXXXX) to watch our delivery truck navigate between Egyptian logistics junctions on the map.'}
        </p>
      </div>

      {/* Input code panel */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-xl mb-8" id="tracking-search-form">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل رمز تتبع الشحنة (مثال: VD-12345)' : 'Enter Tracking Code (e.g., VD-48392)'}
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:outline-none"
            id="tracking-input-id"
          />
          <Search className="absolute right-3.5 top-3.5 w-5 h-5 text-zinc-400" />
        </div>
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-xl shadow-md cursor-pointer transition-colors"
          id="tracking-search-btn"
        >
          {language === 'ar' ? 'تتبع الآن' : 'Track'}
        </button>
      </form>

      {/* Dynamic Previous / Demo Orders section to prevent Empty state confusion */}
      {currentUser && (
        <div className="mb-8 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm" id="user-orders-quicktrack">
          <h4 className="text-xs font-black text-zinc-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 bg-teal-600 rounded-full" />
            {language === 'ar' ? 'حدد أحد طلباتك السابقة للتتبع الفوري:' : 'Select one of your previous orders for instant tracking:'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {orders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()).length === 0 ? (
              <span className="text-xs text-zinc-500 italic pb-1">
                {language === 'ar' ? '⚠️ ليس لديك أي طلبات سابقة مسجلة بحسابك بمصر حالياً.' : 'No previous orders found for your profile in Egypt.'}
              </span>
            ) : (
              orders
                .filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
                .map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSearchInput(o.id);
                      setSearchedId(o.id);
                      setCurrentOrderTrackingId(o.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all border ${
                      searchedId === o.id
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    📦 {o.id} ({o.total} EGP)
                  </button>
                ))
            )}
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="mb-8 p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm" id="demo-orders-quicktrack">
          <h4 className="text-xs font-black text-zinc-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
            {language === 'ar' ? 'طلبات تجريبية سريعة بالمنصة للتجربة الفورية لقوة المحاكاة الخرائطية والرسائل:' : 'Demo Platform Shipments (Click to test map simulation directly):'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {orders.length === 0 ? (
              <span className="text-xs text-zinc-500 italic">
                {language === 'ar' ? 'لا توجد شحنات مسجلة بالنظام حالياً لتجربتها.' : 'No system shipments registered currently for tracking demonstration.'}
              </span>
            ) : (
              orders.slice(0, 4).map(o => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSearchInput(o.id);
                    setSearchedId(o.id);
                    setCurrentOrderTrackingId(o.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono cursor-pointer transition-all border ${
                    searchedId === o.id
                      ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                      : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  🚚 {o.id} ({language === 'ar' ? 'شحنة تجريبية' : 'Test Shipment'})
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {searchedId && !matchedOrder ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10 text-red-600 dark:text-red-400 font-medium" id="tracking-not-found">
          {language === 'ar' 
            ? `⚠️ عذراً، لم نجد أي طلب مسجل تحت الكود "${searchedId}". كخطوة تجريبية، يرجى القيام بإجراء طلب شراء لتوليد كود تتبع جديد وتجربة محاكاة الخريطة، أو تفقد لوحة تحكم المدير.`
            : `⚠️ Sorry, no registered order has been found under "${searchedId}". Please place a trial order first to generate a dynamic tracking code, or consult the Admin Dashboard.`}
        </div>
      ) : matchedOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="tracking-active-layout">
          {/* Timeline & details */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm space-y-6" id="tracking-details">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {matchedOrder.id}
                </span>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                  {language === 'ar' ? 'العميل:' : 'Customer:'} {matchedOrder.customerName}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">{language === 'ar' ? 'تاريخ الطلب' : 'Ordered on'}</p>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  {matchedOrder.date}
                </p>
              </div>
            </div>

            {/* Current Step Banner */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3">
              <div className="p-2 bg-teal-600 text-white rounded-lg">
                <Truck className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
                  {language === 'ar' ? 'حالة الشحن الحالية' : 'Current Status'}
                </h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {matchedOrder.status === 'pending' && (language === 'ar' ? 'قيد المراجعة والانتظار' : 'Pending Review')}
                  {matchedOrder.status === 'preparing' && (language === 'ar' ? 'جاري تجهيز السلع بالمستودع' : 'In Preparation')}
                  {matchedOrder.status === 'shipping' && (language === 'ar' ? 'خارج للتوصيل مع المندوب' : 'Out for Delivery / Shipping')}
                  {matchedOrder.status === 'delivered' && (language === 'ar' ? 'تم التسليم وإمضاء العميل' : 'Delivered & Completed')}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {language === 'ar' ? 'الموقع الحالي: ' : 'Current Location: '} 
                  <span className="font-semibold text-teal-600">
                    {language === 'ar' ? (CITY_COORDS[matchedOrder.city]?.ar || matchedOrder.city) : matchedOrder.city}
                  </span>
                </p>
              </div>
            </div>

            {/* Custom Interactive Road Line Tracker */}
            <div className="relative pl-6 rtl:pl-0 rtl:pr-6 border-l rtl:border-l-0 rtl:border-r border-zinc-200 dark:border-zinc-800 space-y-8" id="tracking-timeline-steps">
              {matchedOrder.trackingHistory.slice().reverse().map((step, idx) => (
                <div key={idx} className="relative" id={`timeline-step-${idx}`}>
                  {/* Dot */}
                  <span className="absolute -left-[31px] rtl:-right-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border-2 border-teal-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  </span>

                  <div>
                    <span className="text-xs text-zinc-400 font-mono block">
                      {step.timestamp}
                    </span>
                    <h5 className="font-bold text-sm text-zinc-950 dark:text-zinc-100 mt-0.5">
                      {language === 'ar' ? step.locationAr : step.locationEn}
                    </h5>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {language === 'ar' ? step.noteAr : step.noteEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery address details */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <p className="text-zinc-400 font-medium">{language === 'ar' ? 'تفاصيل العنوان والتسليم' : 'Delivery Address & Contact'}</p>
              <p className="text-zinc-700 dark:text-zinc-300 font-semibold">{matchedOrder.address}, {language === 'ar' ? CITY_COORDS[matchedOrder.city]?.ar : matchedOrder.city}</p>
              <p className="text-zinc-500">{language === 'ar' ? 'رقم الهاتف: ' : 'Phone: '} {matchedOrder.customerPhone}</p>
              <div className="flex justify-between items-center text-zinc-500">
                <span>{language === 'ar' ? 'بوابة الدفع:' : 'Gateway:'}</span>
                <span className="font-bold uppercase text-zinc-700 dark:text-zinc-300">{matchedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-sm border-t border-zinc-100 dark:border-zinc-800 pt-2">
                <span className="text-zinc-800 dark:text-zinc-200">{language === 'ar' ? 'الإجمالي المدفوع:' : 'Paid Total:'}</span>
                <span className="text-teal-600">{matchedOrder.total} EGP {language === 'ar' ? 'ج.م' : ''}</span>
              </div>
            </div>
          </div>

          {/* Egypt Vector map */}
          <div className="lg:col-span-7 space-y-6" id="tracking-visual-map-panel">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm" id="tracking-egypt-map-canvas">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-zinc-800 dark:text-white text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  {language === 'ar' ? 'الخريطة الحية لحركة العربة بمصر' : 'Live Delivery Route Map - Egypt Hubs'}
                </h4>
                <div className="flex gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 bg-dashed border border-emerald-500 block rounded-full" />
                    {language === 'ar' ? 'المسار البري' : 'Land path'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 bg-emerald-500 block rounded-full animate-ping" />
                    {language === 'ar' ? 'الموقع الحالي' : 'Parcel Marker'}
                  </span>
                </div>
              </div>

              {/* Vector SVG Egypt Custom Map */}
              <div className="relative w-full overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-teal-50/20 dark:bg-zinc-950/40 rounded-xl" style={{ height: '390px' }} id="egypt-svg-container">
                {/* Embedded Nile River & Sinai background SVG simulation */}
                <svg viewBox="0 0 400 380" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sinai Peninsula polygon backdrop */}
                  <polygon points="260,110 320,80 380,110 330,190" className="fill-emerald-100/10 dark:fill-emerald-900/5 stroke-emerald-500/10" strokeWidth="1" />
                  
                  {/* Nile River flow pathway blue curve */}
                  <path d="M 230 380 Q 240 330 230 280 T 205 180 Q 200 150 170 120" fill="none" className="stroke-blue-200/50 dark:stroke-blue-900/30" strokeWidth="4" />
                  
                  {/* Roads network connecting Cairo Logistics Hub to rest of governorates */}
                  {Object.keys(CITY_COORDS).map((name) => {
                    if (name === 'Cairo') return null;
                    const hub = CITY_COORDS[name];
                    return (
                      <g key={name}>
                        {/* Connecting road line */}
                        <line
                          x1={startHub.x}
                          y1={startHub.y}
                          x2={hub.x}
                          y2={hub.y}
                          className="stroke-zinc-300 dark:stroke-zinc-800"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                        />
                      </g>
                    );
                  })}

                  {/* Active delivery track glowing road */}
                  {destinationCity !== 'Cairo' && (
                    <line
                      x1={startHub.x}
                      y1={startHub.y}
                      x2={endHub.x}
                      y2={endHub.y}
                      className="stroke-teal-500/70"
                      strokeWidth="3.5"
                    />
                  )}

                  {/* Shipping Hub Markers */}
                  {Object.keys(CITY_COORDS).map((name) => {
                    const hub = CITY_COORDS[name];
                    const isDestination = name === destinationCity;
                    const isCairo = name === 'Cairo';
                    
                    return (
                      <g key={name} id={`hub-${name}`}>
                        <circle
                          cx={hub.x}
                          cy={hub.y}
                          r={isCairo ? 8 : 6}
                          className={`${
                            isCairo 
                              ? 'fill-teal-600 stroke-teal-200 shadow-md' 
                              : isDestination 
                                ? 'fill-rose-500 stroke-rose-200 animate-pulse' 
                                : 'fill-zinc-400 dark:fill-zinc-700'
                          }`}
                        />
                        <text
                          x={hub.x}
                          y={hub.y - 10}
                          textAnchor="middle"
                          className="font-sans font-bold text-[10px] fill-zinc-700 dark:fill-zinc-300"
                        >
                          {language === 'ar' ? hub.ar : hub.en}
                        </text>
                      </g>
                    );
                  })}

                  {/* Dynamic Driving Delivery Van Icon representation */}
                  {matchedOrder && matchedOrder.status !== 'delivered' && (
                    <g transform={`translate(${carX - 12}, ${carY - 12})`} id="moving-car-delivery">
                      {/* Pulse Circle */}
                      <circle cx="12" cy="12" r="14" className="stroke-teal-500/40 fill-teal-100/20 dark:fill-teal-900/10 animate-ping" strokeWidth="1" />
                      
                      <rect x="2" y="5" width="20" height="12" rx="2" className="fill-teal-600 stroke-white" strokeWidth="1" />
                      <circle cx="7" cy="17" r="2.5" className="fill-zinc-900" />
                      <circle cx="17" cy="17" r="2.5" className="fill-zinc-900" />
                      <path d="M 18 5 L 21 8 L 21 11 L 18 11 Z" className="fill-teal-400" />
                      <text x="12" y="13" textAnchor="middle" className="fill-white text-[7px] font-mono font-bold">VN</text>
                    </g>
                  )}

                  {/* Delivered checkmark over destination if delivered */}
                  {matchedOrder && matchedOrder.status === 'delivered' && (
                    <g transform={`translate(${endHub.x - 12}, ${endHub.y - 12})`} id="delivered-marker">
                      <circle cx="12" cy="12" r="14" className="stroke-teal-500/50 fill-emerald-100 dark:fill-emerald-950/60" />
                      <path d="M 7 12 L 10 15 L 17 8" fill="none" className="stroke-teal-600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  )}
                </svg>

                {/* Simulated Overlay info */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-zinc-900/95 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                      {language === 'ar' ? 'بث الإحداثيات الحي عبر الأقمار الصناعية لجمهورية مصر' : 'Satellite stream live - Egyptian Hub Transmissions'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-mono font-bold px-2 py-0.5 rounded">
                    GPS 30.0444° N, 31.2357° E
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Alerts Messaging Logs (Transparency in communication) */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm" id="tracking-simulated-logs">
              <h4 className="font-bold text-zinc-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-500" />
                {language === 'ar' ? 'سجل الإشعارات البنكية والبريدية وواتساب للطلب الحالية' : 'System WhatsApp and Email Alerts Log'}
              </h4>
              <p className="text-xs text-zinc-400 mb-4">
                {language === 'ar' 
                  ? 'هذه الميزة تعرض الإشعارات المرسلة لبريد وهاتف العميل تلقائياً عند قيام الإدارة بتحديث الحالة من لوحة التحكم.'
                  : 'This panel shows instant simulated logs generated on email & WhatsApp when order state changes on our custom system server.'}
              </p>
              
              <div className="space-y-2 max-h-[140px] overflow-y-auto font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="notification-logs-viewport">
                {orderSpecificLogs.length === 0 ? (
                  <p className="text-zinc-400 italic text-center py-2">
                    {language === 'ar' ? 'قيد الانتظار لموجة رسائل جديدة للطلب...' : 'No email/WhatsApp logs registered for this order code yet.'}
                  </p>
                ) : (
                  orderSpecificLogs.map((log, idx) => {
                    const isWa = log.includes('WhatsApp');
                    return (
                      <div key={idx} className={`p-2 rounded border ${isWa ? 'bg-emerald-50/20 border-emerald-100 dark:border-emerald-950/25 text-emerald-800 dark:text-emerald-400' : 'bg-blue-50/20 border-blue-100 dark:border-blue-950/25 text-blue-800 dark:text-blue-400'}`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Promo tracking state */
        <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800" id="tracking-empty-placeholder">
          <Truck className="w-16 h-16 text-teal-600 mx-auto animate-bounce mb-4" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {language === 'ar' ? 'جاهز تتبع شحنتك؟' : 'Ready to Track Your Parcel?'}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto mt-2">
            {language === 'ar'
              ? 'أدخل الكود المخصص لتنشيط الخريطة التفاعلية الفورية ومعاينة حركة السائق عبر محافظات مصر، بالإضافة إلى مخرجات إشعارات الواتساب والبريد المباشرة.'
              : 'Enter a valid tracking code to engage the vector driver overlay, trace road milestones, and monitor simulated WhatsApp text updates.'}
          </p>
        </div>
      )}
    </div>
  );
};
