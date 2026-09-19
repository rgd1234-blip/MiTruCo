/**
 * MiTruCo — Mini Truly Companion
 * Main Application Root
 * Origin: «Made with love and care from Bihar — GR_»
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ConversationalCanvas } from './components/Chat/ConversationalCanvas';
import { ActivityView } from './components/Activity/ActivityView';
import { ConnectView } from './components/Connect/ConnectView';
import { DownloadsView } from './components/Downloads/DownloadsView';
import { SettingsView } from './components/Settings/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminModerationModal } from './components/Admin/AdminModerationModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, platformPreview, themeConfig, sendMessage } = useApp();
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Deep Link Support: When user or friend clicks a shared URL with ?q=... (from WhatsApp/Telegram/Instagram)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedQuery = params.get('q') || params.get('search');
      if (sharedQuery && sharedQuery.trim()) {
        const decoded = decodeURIComponent(sharedQuery.trim());
        setActiveTab('home');
        // Clean URL parameter without page reload
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        // Automatically run the shared search
        const timer = setTimeout(() => {
          sendMessage(decoded);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <ConversationalCanvas />;
      case 'activity':
        return <ActivityView />;
      case 'connect':
        return <ConnectView />;
      case 'downloads':
        return <DownloadsView />;
      case 'settings':
        return <SettingsView onOpenAdminModal={() => setIsAdminOpen(true)} />;
      default:
        return <ConversationalCanvas />;
    }
  };

  // If in mobile preview frame (Android / iOS)
  const isMobileFrame = platformPreview === 'android' || platformPreview === 'ios';

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors selection:bg-amber-500/20"
      style={{
        backgroundColor: isMobileFrame ? (themeConfig.isDark ? '#090B0E' : '#E8E3DA') : themeConfig.bgBase,
        color: themeConfig.textBase,
      }}
    >
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        {isMobileFrame ? (
          <div className="py-4 px-2 w-full flex justify-center items-center flex-1">
            <div
              className={`w-full max-w-[420px] h-[85vh] max-h-[860px] flex flex-col overflow-hidden shadow-2xl border transition-all ${
                platformPreview === 'ios' ? 'rounded-[48px] border-neutral-400/40' : 'rounded-[28px] border-neutral-500/40'
              }`}
              style={{
                backgroundColor: themeConfig.bgBase,
                borderColor: themeConfig.borderBase,
              }}
            >
              {/* Native Status Bar Emulation */}
              <div
                className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold select-none border-b shrink-0"
                style={{
                  backgroundColor: themeConfig.surfaceBase,
                  borderColor: themeConfig.borderBase,
                  color: themeConfig.textMuted,
                }}
              >
                <span>9:41</span>
                {platformPreview === 'ios' && (
                  <div className="w-20 h-4 rounded-full bg-black/80 dark:bg-white/20 mx-auto" />
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {platformPreview === 'android' ? 'Compose' : 'SwiftUI'}
                  </span>
                  <span>5G</span>
                </div>
              </div>

              {/* View Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {renderActiveView()}
              </div>

              {/* Navigation */}
              <Navigation />

              {/* iOS Home Indicator Bar */}
              {platformPreview === 'ios' && (
                <div className="py-1.5 flex justify-center shrink-0" style={{ backgroundColor: themeConfig.surfaceBase }}>
                  <div className="w-32 h-1 rounded-full bg-neutral-400/60" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-[calc(100vh-61px)] flex flex-col overflow-hidden">
            <Navigation />
            <div className="flex-1 flex flex-col overflow-hidden">
              {renderActiveView()}
            </div>
          </div>
        )}
      </main>

      {/* First-Launch Onboarding Experience */}
      <OnboardingModal />

      {/* Admin Moderation Modal */}
      {isAdminOpen && <AdminModerationModal onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
