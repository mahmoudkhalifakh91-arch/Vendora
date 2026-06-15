/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, HeartHandshake, CheckCircle2, MessageSquare, Send, Mail } from 'lucide-react';

export const SupportFeedback: React.FC = () => {
  const { addTicket, language } = useStore();
  
  // Local states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'complaint' | 'suggestion' | 'inquiry'>('complaint');
  
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !title || !description) return;

    addTicket(type, name, email, title, description);
    
    // Clear states
    setName('');
    setEmail('');
    setTitle('');
    setDescription('');
    
    // Success feedback
    setShowSuccessAlert(true);
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8" id="complaints-feedback-panel">
      
      {/* Dynamic Success Alert toast */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:text-emerald-400 font-bold text-xs flex items-center gap-2"
            id="ticket-success-alert"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            <span>
              {language === 'ar'
                ? 'تم تسجيل تذكرتكم وبلاغكم بنجاح! تم إحالة الشكوى/المقترح لقسم الإدارة الفورية، وتم بعث كود تتبع المساعدة التلقائي في الشات المباشر.'
                : 'Your suggestion or complaint has been successfully dispatched! Our desk is on it, and an automated helper ticket response is waiting inside the Active Live Chat below.'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Quick Guidelines */}
        <div className="md:col-span-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm space-y-4" id="feedback-hints">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600" />
            {language === 'ar' ? 'نستمع لك دوماً لتطوير خدماتنا بمصر' : 'Vendora Customer Protection Desk'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {language === 'ar'
              ? 'نهتم بأدق التعليقات والآراء ونوفر مصلحة حماية المستهلك عبر نظام تتبع الشكاوى وحل الصعوبات خلال 12 ساعة فقط.'
              : 'Our priority is customer safety and absolute fulfillment. Submit your thoughts, logistics disputes, or enhancement suggestions below to coordinate directly with our directors.'}
          </p>

          <div className="space-y-3.5 pr-2 pt-2 border-t border-zinc-50 dark:border-zinc-800 text-xs">
            <div className="flex gap-2 items-start">
              <span className="p-1 px-2 rounded bg-red-100 dark:bg-red-950 text-red-600 font-bold">1</span>
              <div>
                <strong className="block text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'حل الشكاوى الفوري' : 'Express Issue Resolution'}</strong>
                <span className="text-[10px] text-zinc-400">{language === 'ar' ? 'ضمان إرجاع الأموال واستبدال البضائع التالفة مع المندوب.' : 'Complaints have top support priority.'}</span>
              </div>
            </div>

            <div className="flex gap-2 items-start">
              <span className="p-1 px-2 rounded bg-amber-100 dark:bg-amber-950 text-amber-600 font-bold">2</span>
              <div>
                <strong className="block text-zinc-700 dark:text-zinc-300">{language === 'ar' ? 'مقترحات تطوير الكتالوج' : 'Enhancement Proposals'}</strong>
                <span className="text-[10px] text-zinc-400">{language === 'ar' ? 'رأيك بمثابة حجر زاوية لإدراج معايير جودة وعلامات تجارية جديدة.' : 'Suggestions inspire new additions.'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint / Suggestion Entry Box */}
        <div className="md:col-span-7 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm" id="feedback-form-box">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 mb-4">
            {language === 'ar' ? 'تقديم بلاغ مصلحة المستهلك والمقترحات' : 'Open Ticket/Complaint Form'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4" id="feedback-submission-form">
            {/* Ticket type selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('complaint')}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'complaint'
                    ? 'border-red-400 bg-red-50/10 text-red-600 dark:bg-red-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {language === 'ar' ? '⚠️ تقديم شكوى' : 'Complaint'}
              </button>

              <button
                type="button"
                onClick={() => setType('suggestion')}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'suggestion'
                    ? 'border-emerald-400 bg-emerald-50/10 text-emerald-600 dark:bg-emerald-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {language === 'ar' ? '💡 مقترح جديد' : 'Suggestion'}
              </button>

              <button
                type="button"
                onClick={() => setType('inquiry')}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  type === 'inquiry'
                    ? 'border-blue-400 bg-blue-50/10 text-blue-600 dark:bg-blue-950/20'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                {language === 'ar' ? '💬 استفسار عام' : 'Inquiry'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">{language === 'ar' ? 'الاسم' : 'Your name'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'الاسم بالكامل' : 'Jane Doe'}
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">{language === 'ar' ? 'بريدك الإلكتروني للتواصل' : 'Email contact'}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-9550 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">
                {language === 'ar' ? 'عنوان الموضوع / البلاغ' : 'Subject / Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'complaint' 
                    ? (language === 'ar' ? 'العطل بخصوص الشحنة أو جودة السلعة' : 'Dispute regarding item quality or transport delay')
                    : (language === 'ar' ? 'مقترح لتعديل بوابات الشراء والمحافظات' : 'Proposal for interface enhancement or features layout')
                }
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase mb-1 block">
                {language === 'ar' ? 'التفاصيل الكاملة' : 'Description details'}
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'ar' ? 'يرجى كتابة التفاصيل لنقوم بدراستها والرد الفوري عليها...' : 'We take client feedback seriously. Provide descriptive notes so we can inspect.'}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-bold text-xs py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إرسال التذكرة للأمانة الفنية 🚀' : 'Dispatch Feedback 🚀'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
