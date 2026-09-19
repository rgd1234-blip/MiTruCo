/**
 * MiTruCo Unified Conversational Canvas
 * One continuous context where the user seamlessly transitions between
 * Study, Shopping, Food, Media, Search, Files, and General Questions.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  Compass,
  ShoppingCart,
  Film,
  Utensils,
  BookOpen,
  HeartPulse,
  Landmark,
  Stethoscope,
  Scale,
  Building2,
  FileCheck,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MessageItem } from './MessageItem';
import { Composer } from './Composer';
import { ShareModal } from './ShareModal';

export const ConversationalCanvas: React.FC = () => {
  const { messages, sendMessage, themeConfig, isStreaming } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isGlobalShareOpen, setIsGlobalShareOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleActionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  // Derive latest query and response for the top share banner
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
  const latestQuery =
    lastUserMsg?.blocks.find((b) => b.type === 'text' || b.type === 'markdown')?.content ||
    'CLAT, judiciary, and law exams';

  const latestAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
  const latestSummary =
    latestAssistantMsg?.blocks
      .filter((b) => b.type === 'markdown' || b.type === 'text')
      .map((b) => b.content)
      .join('\n\n') || '';

  return (
    <div
      id="conversational_canvas"
      className="flex-1 flex flex-col h-full overflow-hidden transition-colors"
      style={{ backgroundColor: themeConfig.bgBase }}
    >
      {/* Active Search & Share Banner when conversation is underway */}
      {messages.length > 1 && (
        <div
          id="active_search_session_banner"
          className="px-4 py-2 border-b flex items-center justify-between text-xs transition-colors shrink-0 animate-in fade-in"
          style={{
            backgroundColor: themeConfig.surfaceBase,
            borderColor: themeConfig.borderBase,
          }}
        >
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold opacity-70 shrink-0 text-[11px]">Search:</span>
            <span className="font-bold truncate text-[11px]" title={latestQuery}>
              "{latestQuery}"
            </span>
          </div>

          <button
            type="button"
            id="global_share_search_btn"
            onClick={() => setIsGlobalShareOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
            style={{
              borderColor: '#25D36660',
              backgroundColor: '#25D36615',
              color: '#128C7E',
            }}
            title="Share this search result to WhatsApp, Instagram, Telegram"
          >
            <Share2 className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Share Search</span>
          </button>
        </div>
      )}

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Quick Domain Suggestion Pills */}
          {messages.length <= 1 && (
            <div className="space-y-4 mb-6">
              {/* Specialized Student Exam & Pressure Recovery Section */}
              <div
                className="p-4 rounded-2xl border text-xs space-y-3 shadow-xs"
                style={{
                  borderColor: '#f59e0b',
                  backgroundColor: themeConfig.surfaceBase,
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                    <HeartPulse className="w-4 h-4 animate-pulse" />
                    <span>High-Pressure Exam Triage & Mental Anchors</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    80/20 High-Yield Strategy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <button
                    onClick={() => sendMessage("I am feeling extreme pressure and panicking before my exams. My mind feels blank, please guide me.")}
                    className="p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all hover:scale-101 group"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 text-red-600 shrink-0 mt-0.5">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block group-hover:text-amber-600">Acute Panic Reset</span>
                      <span className="text-[10px] opacity-70 leading-tight block">4-4-4-4 box breathing & instant recall reboot</span>
                    </div>
                  </button>

                  <button
                    onClick={() => sendMessage("Civil Services (UPSC) exam preparation under high stress: 80/20 triage for Mains answer writing and high-scoring topics.")}
                    className="p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all hover:scale-101 group"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-500/10 text-indigo-600 shrink-0 mt-0.5">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block group-hover:text-amber-600">Civil Services (UPSC)</span>
                      <span className="text-[10px] opacity-70 leading-tight block">Mains GS structure & high-yield prelims</span>
                    </div>
                  </button>

                  <button
                    onClick={() => sendMessage("NEET / MBBS medical entrance backlog triage: high-yield NCERT Biology and Organic Chemistry under heavy pressure.")}
                    className="p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all hover:scale-101 group"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block group-hover:text-amber-600">NEET / MBBS (mobs)</span>
                      <span className="text-[10px] opacity-70 leading-tight block">Physiology, genetics & formula attack</span>
                    </div>
                  </button>

                  <button
                    onClick={() => sendMessage("CLAT & Law exam under time crunch: Legal reasoning Principle-Fact method and negative marking traps.")}
                    className="p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all hover:scale-101 group"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-600 shrink-0 mt-0.5">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block group-hover:text-amber-600">Law (CLAT / Judiciary)</span>
                      <span className="text-[10px] opacity-70 leading-tight block">Strict principle application & torts/contracts</span>
                    </div>
                  </button>

                  <button
                    onClick={() => sendMessage("Architecture NATA & JEE Paper 2 triage: 3D perspective visualization, color harmony, and landmark memory.")}
                    className="p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all hover:scale-101 group"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block group-hover:text-amber-600">Architecture (NATA)</span>
                      <span className="text-[10px] opacity-70 leading-tight block">3D elevation, aesthetics & Golden Ratio</span>
                    </div>
                  </button>

                  <button
                    onClick={() => sendMessage("Pre-board exam panic: Board exam step-marking strategy, derivations, and guaranteed scoring questions.")}
                    className="p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all hover:scale-101 group"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 shrink-0 mt-0.5">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block group-hover:text-amber-600">Pre-Boards & Boards</span>
                      <span className="text-[10px] opacity-70 leading-tight block">Step-marking protocol & PYQ repeats</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* General Multi-Domain Explorations */}
              <div className="p-4 rounded-2xl border text-xs space-y-3" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                <div className="flex items-center gap-2 font-bold" style={{ color: themeConfig.accentColor }}>
                  <Compass className="w-4 h-4" />
                  <span>Explore General Companion Modules</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => sendMessage("Explain Newton's laws with formulas and worked examples.")}
                    className="p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all hover:scale-102"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-[11px]">Study Physics</span>
                    <span className="text-[10px] opacity-70">Newton's laws & equations</span>
                  </button>

                  <button
                    onClick={() => sendMessage("Find verified SPF 50 sunscreen under ₹500 with ratings.")}
                    className="p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all hover:scale-102"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-[11px]">Shopping Radar</span>
                    <span className="text-[10px] opacity-70">Sunscreen under ₹500</span>
                  </button>

                  <button
                    onClick={() => sendMessage("Where can I watch Interstellar on streaming platforms in India?")}
                    className="p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all hover:scale-102"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <Film className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-[11px]">OTT Media</span>
                    <span className="text-[10px] opacity-70">Where to stream Interstellar</span>
                  </button>

                  <button
                    onClick={() => sendMessage("Find top-rated biryani and local restaurants nearby.")}
                    className="p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all hover:scale-102"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                  >
                    <Utensils className="w-4 h-4 text-red-600" />
                    <span className="font-bold text-[11px]">Local Food</span>
                    <span className="text-[10px] opacity-70">Nearby dining & maps</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Timeline Messages */}
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onActionClick={handleActionClick}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Unified Multimodal Composer */}
      <Composer onSend={(text, atts) => sendMessage(text, atts)} />

      {/* Global Share Modal */}
      <ShareModal
        isOpen={isGlobalShareOpen}
        onClose={() => setIsGlobalShareOpen(false)}
        query={latestQuery}
        summaryText={latestSummary}
      />
    </div>
  );
};
