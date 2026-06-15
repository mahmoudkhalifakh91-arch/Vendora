/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User, Phone, LogIn, UserPlus, ShieldCheck, Info } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { language, loginUser, registerUser } = useStore();
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLoginMode) {
      const res = loginUser(email, password);
      if (res.success) {
        setSuccessMsg(language === 'ar' ? 'تم تسجيل الدخول بنجاح! 🔓' : 'Logged in successfully! 🔓');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          resetForm();
        }, 1500);
      } else {
        setErrorMsg(language === 'ar' ? res.errorAr : res.errorEn);
      }
    } else {
      if (!name || !email || !phone || !password) {
        setErrorMsg(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة بمصداقية' : 'Please fill out all the fields correctly.');
        return;
      }
      const res = registerUser(name, email, phone, password);
      if (res.success) {
        setSuccessMsg(language === 'ar' ? 'تم إنشاء حسابك ودخولك بنجاح! 🎉' : 'Account created & logged in! 🎉');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          resetForm();
        }, 1500);
      } else {
        setErrorMsg(language === 'ar' ? res.errorAr : res.errorEn);
      }
    }
  };

  const handleFillDemoCreds = () => {
    setEmail('demo@azstore.eg');
    setPassword('123456');
    setIsLoginMode(true);
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs" id="auth-modal-overlay">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Modal Backdrop click dismiss (optional/fallback) */}
        <div className="fixed inset-0 -z-10" onClick={() => { onClose(); resetForm(); }} />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -30 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-150 dark:border-zinc-800 overflow-hidden flex flex-col text-start align-middle max-h-[88vh]"
          id="auth-card-box"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex-shrink-0">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2" id="auth-header-title">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              {isLoginMode 
                ? (language === 'ar' ? 'تسجيل الدخول للمنصة' : 'Sign In to Vendora') 
                : (language === 'ar' ? 'إنشاء حساب عميل جديد' : 'Create New Account')}
            </h3>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="p-1 text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              id="auth-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Quick Demo Credentials pill */}
          {isLoginMode && (
            <div 
              onClick={handleFillDemoCreds}
              className="p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 rounded-xl cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-950/40 transition-colors flex items-start gap-2.5 text-xs text-teal-800 dark:text-teal-300"
              id="demo-creds-hint"
            >
              <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[11px] mb-0.5">
                  {language === 'ar' ? '💡 حساب تجريبي سريع للتقييم' : '💡 Fast test-session access'}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {language === 'ar' 
                    ? 'اضغط هنا لتعبئة بيانات الدخول التجريبية (demo@azstore.eg / 123456)' 
                    : 'Click here to automatically fill demo details (demo@azstore.eg / 123456)'}
                </span>
              </div>
            </div>
          )}

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold text-red-600 dark:text-red-400" id="auth-error-msg">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400" id="auth-success-msg">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" id="auth-form">
            {/* Name - only for Register */}
            {!isLoginMode && (
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 mb-1 block">
                  {language === 'ar' ? 'الاسم بالكامل' : 'Your Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: أحمد محمود' : 'e.g. John Doe'}
                    className="w-full text-xs p-3.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    id="auth-input-name"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 mb-1 block">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-3.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  id="auth-input-email"
                />
              </div>
            </div>

            {/* Phone - only for Register */}
            {!isLoginMode && (
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 mb-1 block">
                  {language === 'ar' ? 'رقم الهاتف بمصر' : 'Phone number (Egypt)'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full text-xs p-3.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    id="auth-input-phone"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase px-1 mb-1 block">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full text-xs p-3.5 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  id="auth-input-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              id="auth-submit-btn"
            >
              {isLoginMode ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isLoginMode 
                ? (language === 'ar' ? 'تسجيل الدخول الآمن 🚀' : 'Secure Login Now 🚀') 
                : (language === 'ar' ? 'إنشاء الحساب والمتابعة 🎉' : 'Register and Proceed 🎉')}
            </button>
          </form>

          {/* Toggle Mode Link */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center text-xs text-zinc-500">
            {isLoginMode ? (
              <p>
                {language === 'ar' ? 'ليس لديك حساب مسبق؟ ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(false); setErrorMsg(''); }}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  id="switchToRegister"
                >
                  {language === 'ar' ? 'إنشاء حساب جديد من هنا' : 'Register here'}
                </button>
              </p>
            ) : (
              <p>
                {language === 'ar' ? 'لديك حساب مسجل بالفعل؟ ' : 'Already registered? '}
                <button
                  type="button"
                  onClick={() => { setIsLoginMode(true); setErrorMsg(''); }}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  id="switchToLogin"
                >
                  {language === 'ar' ? 'تسجيل الدخول من هنا' : 'Login here'}
                </button>
              </p>
            )}
          </div>

        </div>
      </motion.div>
      </div>
    </div>
  );
};
