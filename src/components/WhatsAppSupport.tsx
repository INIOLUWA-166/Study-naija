import React, { useState } from 'react';
import { MessageCircle, X, Send, ShieldCheck, HelpCircle, CheckCircle, PhoneCall } from 'lucide-react';

export const WhatsAppSupport: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const WHATSAPP_NUMBER = '2349166059676';
  const DISPLAY_PHONE = '+234 916 605 9676';

  const quickPrompts = [
    'Confirm my OPay transfer for VIP activation',
    'Help me with my JAMB subject combination',
    'Question about WAEC syllabus & past questions',
    'Technical question about Mock Exam timer'
  ];

  const handleSend = (textToSend?: string) => {
    const finalMsg = (textToSend || message).trim() || 'Hello Inioluwa / StudyNaija Support! I need assistance with CBT preparation.';
    const encoded = encodeURIComponent(finalMsg);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="floating-whatsapp-btn"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/30 transition-all duration-200 cursor-pointer border border-emerald-500/50"
          aria-label="Chat on WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-white/20" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full" />
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:inline">
            WhatsApp Support
          </span>
        </button>
      )}

      {/* Expanded Support Dialog */}
      {isOpen && (
        <div
          id="whatsapp-support-dialog"
          className="w-[330px] sm:w-[360px] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm">
                    IN
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-800 rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <span>Inioluwa • Support</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  </h4>
                  <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                    <span>StudyNaija Admin & Helpdesk</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-semibold">Online</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close WhatsApp chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                Hi! Need immediate help with <strong>OPay payment activation</strong>, <strong>JAMB subject combinations</strong>, or CBT practice? Chat with us directly on WhatsApp.
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <PhoneCall className="w-3 h-3 text-emerald-600" />
                <span>Direct Line: <strong className="text-slate-700 dark:text-slate-200">{DISPLAY_PHONE}</strong></span>
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Questions:
              </span>
              <div className="space-y-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                  >
                    <span className="line-clamp-1">{q}</span>
                    <Send className="w-2.5 h-2.5 text-emerald-600 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type your question..."
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => handleSend()}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shrink-0"
                  title="Send via WhatsApp"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              Typical reply in under 5 mins
            </span>
            <span>StudyNaija Desk</span>
          </div>
        </div>
      )}
    </div>
  );
};
