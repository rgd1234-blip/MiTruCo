/**
 * MiTruCo Settings Module
 * Profile, Themes (Royal Ivory & Coral, Mystic Plum & Slate, Sage Meadow, Desert Amber),
 * 22-language customization, E2EE vault status, and Provider Health monitor.
 */

import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Languages,
  Shield,
  Server,
  User,
  Sparkles,
  Lock,
  Moon,
  Sun,
  Check,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { THEME_PRESETS } from '../../data/themes';
import { INDIAN_LANGUAGES, ENGLISH_LANGUAGE, MAX_INDIAN_LANGUAGES, MAX_TOTAL_LANGUAGES } from '../../data/languages';
import { ThemePreset } from '../../types';

interface SettingsViewProps {
  onOpenAdminModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenAdminModal }) => {
  const {
    themeConfig,
    userProfile,
    updateUserProfile,
    setThemePreset,
    toggleDarkMode,
    providers,
    refreshProviders,
  } = useApp();

  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [selectedCohort, setSelectedCohort] = useState<'adult' | 'minor'>(userProfile.ageCohort || 'adult');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(userProfile.selectedLanguages || ['en', 'hi', 'mai']);
  const [langWarning, setLangWarning] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleLang = (code: string, isEnglish: boolean) => {
    setLangWarning(null);
    if (selectedLangs.includes(code)) {
      if (selectedLangs.length === 1) {
        setLangWarning('At least one language must remain selected.');
        return;
      }
      setSelectedLangs(selectedLangs.filter((c) => c !== code));
    } else {
      const currentIndian = selectedLangs.filter((c) => c !== 'en').length;
      if (!isEnglish && currentIndian >= MAX_INDIAN_LANGUAGES) {
        setLangWarning(`Maximum ${MAX_INDIAN_LANGUAGES} Indian languages allowed.`);
        return;
      }
      if (selectedLangs.length >= MAX_TOTAL_LANGUAGES) {
        setLangWarning(`Maximum ${MAX_TOTAL_LANGUAGES} total languages allowed.`);
        return;
      }
      setSelectedLangs([...selectedLangs, code]);
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      displayName: displayName.trim() || 'Companion User',
      ageCohort: selectedCohort,
      selectedLanguages: selectedLangs,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      id="settings_view"
      className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors"
      style={{ backgroundColor: themeConfig.bgBase, color: themeConfig.textBase }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Companion Settings
          </h2>
          <p className="text-xs opacity-75">
            Configure profile, themes, multilingual preferences, and cryptographic safety boundaries.
          </p>
        </div>

        {/* Section 1: User Profile & Age Cohort */}
        <div
          className="p-5 rounded-2xl border space-y-4 shadow-2xs"
          style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
        >
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: themeConfig.accentColor }}>
            <User className="w-4 h-4" />
            <span>Profile & Safety Cohort</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold opacity-75 block mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 rounded-xl border outline-hidden"
                style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
              />
            </div>

            <div>
              <label className="font-bold opacity-75 block mb-1">Age Cohort</label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value as 'adult' | 'minor')}
                className="w-full p-2 rounded-xl border"
                style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
              >
                <option value="adult">Adult (18+ verified peer boundary)</option>
                <option value="minor">Minor (Supervised student boundary)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] opacity-70">
              Fingerprint: <strong className="font-mono">{userProfile.e2eKeyFingerprint || '4F8A-92C1'}</strong>
            </span>
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Theme Engine */}
        <div
          className="p-5 rounded-2xl border space-y-4 shadow-2xs"
          style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: themeConfig.accentColor }}>
              <Palette className="w-4 h-4" />
              <span>Theme Engine & Appearance</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
            >
              {themeConfig.isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{themeConfig.isDark ? 'Light Canvas' : 'Dark Canvas'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(THEME_PRESETS) as ThemePreset[]).map((key) => {
              const presetObj = THEME_PRESETS[key];
              const isSelected = userProfile.themePreset === key;
              return (
                <button
                  key={key}
                  onClick={() => setThemePreset(key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected ? 'ring-2 font-bold shadow-xs' : 'opacity-75 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: isSelected ? themeConfig.accentColor : themeConfig.borderBase,
                    backgroundColor: themeConfig.bgBase,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs">{presetObj.name}</span>
                    {isSelected && <Check className="w-4 h-4" style={{ color: themeConfig.accentColor }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: presetObj.light.accentColor }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: presetObj.light.secondaryAccent }} />
                    <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: presetObj.light.bgBase, borderColor: '#D0D0D0' }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: presetObj.dark.bgBase }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Multilingual Customization */}
        <div
          className="p-5 rounded-2xl border space-y-4 shadow-2xs"
          style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: themeConfig.accentColor }}>
              <Languages className="w-4 h-4" />
              <span>Language Selection ({selectedLangs.length}/{MAX_TOTAL_LANGUAGES})</span>
            </div>
          </div>

          {langWarning && (
            <div className="p-2.5 rounded-xl text-xs bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{langWarning}</span>
            </div>
          )}

          {/* English */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-70">Universal Language</label>
            <button
              onClick={() => handleToggleLang('en', true)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between w-full ${
                selectedLangs.includes('en') ? 'border-amber-600 bg-amber-500/10' : 'opacity-70'
              }`}
              style={{ borderColor: selectedLangs.includes('en') ? themeConfig.accentColor : themeConfig.borderBase }}
            >
              <span>{ENGLISH_LANGUAGE.name} ({ENGLISH_LANGUAGE.nativeName})</span>
              {selectedLangs.includes('en') && <Check className="w-4 h-4" style={{ color: themeConfig.accentColor }} />}
            </button>
          </div>

          {/* 22 Indian Languages */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider block mb-1 opacity-70">
              Indian Regional Languages (Select up to {MAX_INDIAN_LANGUAGES})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {INDIAN_LANGUAGES.map((lang) => {
                const isChecked = selectedLangs.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleToggleLang(lang.code, false)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isChecked ? 'font-bold' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: isChecked ? themeConfig.accentColor : themeConfig.borderBase,
                      backgroundColor: isChecked ? `${themeConfig.accentColor}15` : themeConfig.bgBase,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]">{lang.name}</span>
                      {isChecked && <Check className="w-3 h-3" style={{ color: themeConfig.accentColor }} />}
                    </div>
                    <span className="text-[10px] opacity-60 mt-0.5">{lang.nativeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Provider Health & System Status */}
        <div
          className="p-5 rounded-2xl border space-y-4 shadow-2xs"
          style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: themeConfig.accentColor }}>
              <Server className="w-4 h-4" />
              <span>Connected Providers & Services</span>
            </div>
            <button
              onClick={refreshProviders}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border hover:opacity-80"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
            >
              Check Health
            </button>
          </div>

          <div className="space-y-2">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border flex items-center justify-between text-xs"
                style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
              >
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-[11px] opacity-70">{p.description}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'AVAILABLE'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : p.status === 'AUTH_REQUIRED'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        : 'bg-neutral-500/15 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Admin Moderation Portal & Origin Note */}
        <div
          className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
        >
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-red-600 dark:text-red-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Moderation & Safety Queue</span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              Review age safety reports, abuse logs, and provider rate-limiting status.
            </p>
          </div>

          <button
            onClick={onOpenAdminModal}
            className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: themeConfig.borderBase }}
          >
            Open Admin Queue
          </button>
        </div>

        {/* Footer Origin Tag */}
        <div className="text-center py-4 space-y-1 text-xs opacity-75">
          <p className="font-bold">MiTruCo — Mini Truly Companion v1.0.0</p>
          <p className="text-[11px]" style={{ color: themeConfig.accentColor }}>
            «Made with love and care from Bihar — GR_»
          </p>
        </div>
      </div>
    </div>
  );
};
