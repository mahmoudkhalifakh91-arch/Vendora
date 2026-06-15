/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';

export const LiveChat: React.FC = () => {
  const { chatMessages, sendChatMessage, language, activeChatOpen, setActiveChatOpen } = useStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText, 'user');
    setInputText('');
  };

  const handleQuickQuestion = (question: string) => {
    sendChatMessage(question, 'user');
  };

  const quickQuestionsAr = [
    'كيف يمكنني تتبع الشحنة؟ 🗺️',
    'ما هي طرق الدفع المتاحة بمصر؟ 💳',
    'كم يستغرق الشحن للمحافظات؟ 🚚'
  ];

  const quickQuestionsEn = [
    'How do I track my order? 🗺️',
    'Which payment methods exist? 💳',
    'What is the delivery timeline? 🚚'
  ];

  const quickQuestions = language === 'ar' ? quickQuestionsAr : quickQuestionsEn;

  return (
    <div className="fixed bottom-6 right-6 left-auto rtl:right-auto rtl:left-6 z-45" id="live-chat-widget">
      {/* Dynamic Bubble Button */}
      <motion.button
        onClick={() => setActiveChatOpen(!activeChatOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-xl flex items-center justify-center cursor-pointer relative group border-2 border-white/20"
        id="chat-bubble-btn"
        title={language === 'ar' ? 'الدعم الفني المباشر' : 'Live Chat Support'}
      >
        <MessageSquare className="w-6 h-6" />
        
        {/* Glow badge */}
        <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5" id="chat-glow-badge">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-[8px] font-bold text-white items-center justify-center">1</span>
        </span>
      </motion.button>

      {/* Floating Chat Box Panel */}
      <AnimatePresence>
        {activeChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, x: language === 'ar' ? -50 : 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50, x: language === 'ar' ? -50 : 50 }}
            className="absolute bottom-20 right-0 left-auto rtl:right-auto rtl:left-0 w-80 sm:w-96 h-[500px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col overflow-hidden"
            id="chat-panel-box"
          >
            {/* Header info */}
            <div className="bg-teal-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-teal-600" />
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-xs uppercase text-zinc-100">
                    VN
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold flex items-center gap-1">
                    {language === 'ar' ? 'فريق الدعم المباشر' : 'Vendora Support Desk'}
                  </h4>
                  <span className="text-[10px] text-teal-100 flex items-center gap-0.5 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    {language === 'ar' ? 'متاح للرد الفوري بمصر' : 'In-service 24/7 (Agent status: Active)'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveChatOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                id="close-chat-panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body Screen */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/40" id="chat-messages-container">
              {chatMessages.map((msg) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-1.5 max-w-[85%] ${
                      isAgent ? 'mr-auto rtl:ml-auto rtl:mr-0' : 'ml-auto mr-0 rtl:mr-auto rtl:ml-0 flex-row-reverse'
                    }`}
                  >
                    {/* Tiny Avatar */}
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                      isAgent ? 'bg-teal-100 text-teal-800' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {isAgent ? 'VN' : <User className="w-3 h-3" />}
                    </div>

                    <div>
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                          : 'bg-teal-600 text-white rounded-tr-none'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-zinc-400 font-mono block mt-0.5 text-right px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Helper Questions Drawer */}
            <div className="p-2 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200/50 dark:border-zinc-800 space-y-1.5" id="chat-quick-faqs">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider px-2 flex items-center gap-0.5">
                <HelpCircle className="w-3 h-3 text-teal-500" />
                {language === 'ar' ? 'مواضيع شائعة للمساعدة الخاطفة:' : 'Common Technical Help Topics:'}
              </span>
              <div className="flex flex-wrap gap-1 px-1" id="quick-links-pills">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className="p-1 px-2 border rounded-full bg-white dark:bg-zinc-800 text-[10px] text-zinc-700 dark:text-zinc-300 hover:border-teal-500 transition-colors uppercase font-medium cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input area */}
            <form onSubmit={handleSend} className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex gap-1.5" id="chat-input-form">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={language === 'ar' ? 'اكتب استفسارك هنا للفريق...' : 'Write your question for support desk...'}
                className="flex-grow p-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
                id="chat-user-input"
              />
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl p-2.5 flex items-center justify-center cursor-pointer transition-colors"
                id="chat-send-btn"
                title={language === 'ar' ? 'إرسال' : 'Send'}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
