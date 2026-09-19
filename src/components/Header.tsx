/**
 * MiTruCo Companion Header
 * Displays Origin Tag («Made with love and care from Bihar — GR_»),
 * Platform View Switcher, Offline Sync & E2EE security indicators.
 */

import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Smartphone,
  Apple,
  Globe,
  Plus,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_SUPPORTED_LANGUAGES } from '../data/languages';

export const Header: React.FC = () => {
  const {
    themeConfig,
    toggleDarkMode,
    platformPreview,
    setPlatformPreview,
    syncState,
    manualSync,
    userProfile,
    startNewConversation,
    sendMessage,
  } = useApp();

  const selectedLangObj = ALL_SUPPORTED_LANGUAGES.find(
    (l) => l.code === userProfile.selectedLanguages[0]
  );

  return (
    <header
      id="mitruco_header"
      className="border-b px-4 py-2.5 transition-colors sticky top-0 z-30 shadow-xs"
      style={{
        backgroundColor: themeConfig.surfaceBase,
        borderColor: themeConfig.borderBase,
        color: themeConfig.textBase,
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Identity & Origin Tag */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
            style={{
              backgroundColor: themeConfig.accentColor,
            }}
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-lg leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                MiTruCo
              </h1>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: themeConfig.borderBase,
                  color: themeConfig.accentColor,
                }}
              >
                Mini Truly Companion
              </span>
            </div>
            <p className="text-[11px] tracking-wide mt-0.5 opacity-80" style={{ color: themeConfig.textMuted }}>
              Made with love and care from Bihar — GR_
            </p>
          </div>
        </div>

        {/* Center: Cross-Platform Preview Switcher & Sync Status */}
        <div className="flex items-center gap-2">
          {/* Platform Switcher */}
          <div
            className="hidden sm:flex items-center p-1 rounded-xl text-xs border"
            style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
          >
            <button
              id="platform_web_btn"
              onClick={() => setPlatformPreview('web')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                platformPreview === 'web' ? 'shadow-xs text-white' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: platformPreview === 'web' ? themeConfig.accentColor : 'transparent',
              }}
              title="Universal Web Canvas"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web</span>
            </button>

            <button
              id="platform_android_btn"
              onClick={() => setPlatformPreview('android')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                platformPreview === 'android' ? 'shadow-xs text-white' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: platformPreview === 'android' ? themeConfig.accentColor : 'transparent',
              }}
              title="Android Native (Jetpack Compose Mode)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android</span>
            </button>

            <button
              id="platform_ios_btn"
              onClick={() => setPlatformPreview('ios')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                platformPreview === 'ios' ? 'shadow-xs text-white' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: platformPreview === 'ios' ? themeConfig.accentColor : 'transparent',
              }}
              title="iOS Native (SwiftUI Mode)"
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iOS</span>
            </button>
          </div>

          {/* Sync Status Badge */}
          <button
            id="sync_status_btn"
            onClick={manualSync}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-opacity hover:opacity-90"
            style={{
              borderColor: themeConfig.borderBase,
              backgroundColor: themeConfig.bgBase,
              color: syncState.isOnline ? themeConfig.accentColor : '#C47B89',
            }}
            title={syncState.isOnline ? 'Online & Encrypted. Click to synchronize now.' : 'Offline Mode active. Local data stored safely.'}
          >
            {syncState.isOnline ? (
              syncState.status === 'syncing' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wifi className="w-3.5 h-3.5" />
              )
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span>
              {syncState.isOnline
                ? syncState.status === 'syncing'
                  ? 'Syncing...'
                  : 'Synced'
                : 'Offline Vault'}
            </span>
          </button>

          {/* E2EE Indicator */}
          <div
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border"
            style={{
              borderColor: themeConfig.borderBase,
              backgroundColor: themeConfig.bgBase,
              color: themeConfig.textMuted,
            }}
            title={`E2EE Active. Device fingerprint: ${userProfile.e2eKeyFingerprint || '4F8A-92C1'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>E2EE Active</span>
          </div>
        </div>

        {/* Right Controls: New Chat, Theme Toggle & Language */}
        <div className="flex items-center gap-2">
          {/* Quick Exam Calm & Triage Anchor Button */}
          <button
            id="header_exam_calm_btn"
            onClick={() => sendMessage("I am feeling extreme pressure and panicking before my exams. My mind feels blank, please guide me.")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 transition-all active:scale-95"
            title="Immediate Exam Pressure Relief & 4-4-4-4 Box Breathing"
          >
            <HeartPulse className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">Exam Calm</span>
          </button>

          <button
            id="new_chat_btn"
            onClick={startNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-transform active:scale-95"
            style={{ backgroundColor: themeConfig.accentColor }}
            title="Start new conversation"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Canvas</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="darkmode_toggle_btn"
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-xl flex items-center justify-center border transition-colors hover:opacity-80"
            style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
            aria-label="Toggle dark mode"
          >
            {themeConfig.isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Selected Language Badge */}
          <div
            className="px-2.5 py-1 rounded-xl text-xs font-medium border"
            style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
          >
            <span className="font-semibold">{selectedLangObj?.name || 'English'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
