/**
 * MiTruCo First-Launch Experience
 * Origin: «Made with love and care from Bihar — GR_»
 * Enforces: English + up to 4 Indian languages (max 5 total),
 * Transparent privacy review & contextual permissions explanation.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Languages,
  CheckCircle2,
  Lock,
  Mic,
  Camera,
  MapPin,
  Bell,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INDIAN_LANGUAGES, ENGLISH_LANGUAGE, MAX_INDIAN_LANGUAGES, MAX_TOTAL_LANGUAGES } from '../data/languages';

export const OnboardingModal: React.FC = () => {
  const { userProfile, updateUserProfile, themeConfig } = useApp();
  const [step, setStep] = useState<number>(1);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(userProfile.selectedLanguages || ['en', 'hi', 'mai']);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  if (userProfile.onboardingCompleted) {
    return null;
  }

  const toggleLanguage = (code: string, isEnglish: boolean) => {
    setWarningMsg(null);
    if (selectedLangs.includes(code)) {
      // Don't allow deselecting everything
      if (selectedLangs.length === 1) {
        setWarningMsg('At least one language must remain selected.');
        return;
      }
      setSelectedLangs(selectedLangs.filter((c) => c !== code));
    } else {
      // Count existing Indian languages
      const currentIndianCount = selectedLangs.filter((c) => c !== 'en').length;
      
      if (!isEnglish && currentIndianCount >= MAX_INDIAN_LANGUAGES) {
        setWarningMsg(`You can select up to ${MAX_INDIAN_LANGUAGES} Indian regional languages in addition to English.`);
        return;
      }

      if (selectedLangs.length >= MAX_TOTAL_LANGUAGES) {
        setWarningMsg(`Maximum selection limit reached (${MAX_TOTAL_LANGUAGES} languages total).`);
        return;
      }

      setSelectedLangs([...selectedLangs, code]);
    }
  };

  const handleFinish = () => {
    updateUserProfile({
      selectedLanguages: selectedLangs,
      onboardingCompleted: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="onboarding_modal"
        className="w-full max-w-xl rounded-2xl border p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] transition-all"
        style={{
          backgroundColor: themeConfig.bgBase,
          borderColor: themeConfig.borderBase,
          color: themeConfig.textBase,
        }}
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: themeConfig.borderBase }}>
          <div className="flex items-center gap-2">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              {step}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Step {step} of 3
            </span>
          </div>
          <span className="text-xs font-medium" style={{ color: themeConfig.accentColor }}>
            {step === 1 ? 'Welcome' : step === 2 ? 'Multilingual Setup' : 'Privacy & Permissions'}
          </span>
        </div>

        {/* STEP 1: Welcome & Origin */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Welcome to MiTruCo
              </h2>
              <p className="text-sm font-medium" style={{ color: themeConfig.accentColor }}>
                Your Mini Truly Companion
              </p>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: themeConfig.surfaceBase, color: themeConfig.textMuted }}
              >
                «Made with love and care from Bihar — GR_»
              </div>
            </div>

            <div
              className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
              style={{ backgroundColor: themeConfig.surfaceBase, borderColor: themeConfig.borderBase }}
            >
              <p className="font-semibold text-sm">One continuous conversation. Infinite capabilities.</p>
              <p className="opacity-80">
                MiTruCo replaces scattered apps with one intelligent companion. Ask about complex science problems, find genuine product prices, stream your favorite cinema, or discover local delicacies — all without ever breaking conversational context.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                id="onboarding_next_step1"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-sm transition-transform active:scale-95"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                <span>Continue to Language Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Multilingual Engine (22 Indian Languages + English) */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5" style={{ color: themeConfig.accentColor }} />
                <h3 className="text-lg font-bold">Choose Your Languages</h3>
              </div>
              <p className="text-xs mt-1" style={{ color: themeConfig.textMuted }}>
                English is independently selectable. Choose up to 4 Indian regional languages (maximum 5 total).
              </p>
            </div>

            {/* Selection Counter Pill */}
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
              <span>Selected: <strong>{selectedLangs.length}</strong> / {MAX_TOTAL_LANGUAGES}</span>
              <span className="opacity-75">
                Indian Languages: {selectedLangs.filter(c => c !== 'en').length} / {MAX_INDIAN_LANGUAGES}
              </span>
            </div>

            {warningMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{warningMsg}</span>
              </div>
            )}

            {/* English Pill */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70">Universal English</label>
              <button
                type="button"
                id="lang_opt_en"
                onClick={() => toggleLanguage('en', true)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                  selectedLangs.includes('en') ? 'border-amber-600 bg-amber-500/10' : 'opacity-70'
                }`}
                style={{ borderColor: selectedLangs.includes('en') ? themeConfig.accentColor : themeConfig.borderBase }}
              >
                <div className="text-left">
                  <div className="font-bold">{ENGLISH_LANGUAGE.name}</div>
                  <div className="text-[11px] opacity-75">{ENGLISH_LANGUAGE.nativeName}</div>
                </div>
                {selectedLangs.includes('en') && <CheckCircle2 className="w-4 h-4" style={{ color: themeConfig.accentColor }} />}
              </button>
            </div>

            {/* 22 Indian Languages Grid */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70">
                22 Eighth Schedule Indian Languages
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                {INDIAN_LANGUAGES.map((lang) => {
                  const isChecked = selectedLangs.includes(lang.code);
                  return (
                    <button
                      key={lang.code}
                      id={`lang_opt_${lang.code}`}
                      type="button"
                      onClick={() => toggleLanguage(lang.code, false)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                        isChecked ? 'border-amber-600 font-bold' : 'opacity-75 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: isChecked ? themeConfig.accentColor : themeConfig.borderBase,
                        backgroundColor: isChecked ? `${themeConfig.accentColor}15` : themeConfig.surfaceBase,
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium text-[11px]">{lang.name}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: themeConfig.accentColor }} />}
                      </div>
                      <span className="text-[10px] opacity-70 mt-1">{lang.nativeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: themeConfig.borderBase }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                id="onboarding_next_step2"
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white shadow-sm"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                <span>Continue to Privacy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Privacy Transparency & Permissions */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" style={{ color: themeConfig.accentColor }} />
                <h3 className="text-lg font-bold">Privacy by Design</h3>
              </div>
              <p className="text-xs mt-1" style={{ color: themeConfig.textMuted }}>
                Transparent data boundaries and client-side cryptographic security.
              </p>
            </div>

            {/* Storage Transparency Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                <Lock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold">E2EE Cryptographic Vault</h4>
                  <p className="opacity-80 mt-0.5">
                    Peer communication and private bookmarks are encrypted using WebCrypto AES-GCM (256-bit). Your cryptographic keys stay in your device Keystore/Keychain.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold">Offline-First Local Storage</h4>
                  <p className="opacity-80 mt-0.5">
                    Your conversations, activities, and files live in your device database. When offline, MiTruCo functions without interruption and syncs deltas securely when reconnected.
                  </p>
                </div>
              </div>
            </div>

            {/* Permission Explanations */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70">
                Contextual Device Permissions
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border flex items-center gap-2" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <Mic className="w-4 h-4 text-amber-600" />
                  <span>Microphone (Voice notes & dictation)</span>
                </div>
                <div className="p-2.5 rounded-xl border flex items-center gap-2" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>Camera (Study doc capture)</span>
                </div>
                <div className="p-2.5 rounded-xl border flex items-center gap-2" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Location (Nearby food & places)</span>
                </div>
                <div className="p-2.5 rounded-xl border flex items-center gap-2" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Alerts (Reminders & peer updates)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: themeConfig.borderBase }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                id="onboarding_complete_btn"
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-transform active:scale-95"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                <span>Enter MiTruCo Canvas</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
