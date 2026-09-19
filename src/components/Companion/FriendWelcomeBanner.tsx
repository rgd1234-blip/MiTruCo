import React, { useState } from 'react';
import { Sparkles, Heart, Coffee, BookOpen, Smile, ShieldCheck, Languages } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MitroMascot } from './MitroMascot';

interface FriendWelcomeBannerProps {
  onSelectPrompt: (promptText: string) => void;
  compact?: boolean;
}

export const FriendWelcomeBanner: React.FC<FriendWelcomeBannerProps> = ({
  onSelectPrompt,
  compact = false,
}) => {
  const { themeConfig, userProfile, setActiveTab } = useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = userProfile.displayName || 'Friend';

  const friendMoodOptions = [
    {
      id: 'anxious',
      label: 'Exam Stress 🥺',
      sub: 'Need calm & reassurance',
      prompt: "Hey Mitro, I am feeling anxious and overwhelmed about my upcoming exams. Can you talk to me like a close friend, help me ground myself, and guide me on what to prioritize?",
    },
    {
      id: 'language',
      label: 'Learn a Language 🌍',
      sub: 'English / Spanish practice',
      action: () => setActiveTab('learn'),
      prompt: "Hey Mitro! I want to practice and improve my spoken English and vocabulary with you today.",
    },
    {
      id: 'notes',
      label: 'Study Notes & Slides 📑',
      sub: 'Get revision materials',
      prompt: "Can you provide a high-yield study sheet and slide deck breakdown for my revision with key takeaways?",
    },
    {
      id: 'chat',
      label: 'Just Chat ☕',
      sub: 'Share how my day went',
      prompt: `Hey Mitro! How's your day going? Just wanted to catch up with you like a close friend.`,
    },
    {
      id: 'motivated',
      label: 'Ready to Conquer 🚀',
      sub: 'Let’s crush our goals',
      prompt: "I'm ready and focused today! What's the most effective strategy or 80/20 topic we should tackle first?",
    },
  ];

  if (compact) {
    return (
      <div
        id="friend_welcome_compact"
        className="p-3 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xs mb-3"
        style={{
          backgroundColor: themeConfig.surfaceBase,
          borderColor: themeConfig.borderBase,
        }}
      >
        <div className="flex items-center gap-3">
          <MitroMascot size="sm" />
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">
              {getGreetingTime()}, {userName}! ✨
            </h3>
            <p className="text-[11px] opacity-75">
              Your close friend Mitro is here. What's on your mind today?
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('learn')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          style={{ borderColor: themeConfig.borderBase, color: themeConfig.accentColor }}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Language Lab</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="friend_welcome_full"
      className="p-5 sm:p-6 rounded-3xl border shadow-md space-y-4 relative overflow-hidden"
      style={{
        backgroundColor: themeConfig.surfaceBase,
        borderColor: themeConfig.borderBase,
      }}
    >
      {/* Background Subtle Gradient Glow */}
      <div
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: themeConfig.accentColor }}
      />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
        {/* Animated Friendly Mascot */}
        <MitroMascot size="lg" showSpeechBubble={false} />

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
              style={{
                borderColor: `${themeConfig.accentColor}40`,
                backgroundColor: `${themeConfig.accentColor}15`,
                color: themeConfig.accentColor,
              }}
            >
              Your Caring Companion
            </span>
            <span className="flex items-center gap-1 text-[11px] opacity-60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Encrypted & Local
            </span>
          </div>

          <h2
            className="text-lg sm:text-xl font-bold tracking-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {getGreetingTime()}, {userName}!
          </h2>

          <p className="text-xs opacity-80 max-w-xl leading-relaxed">
            I'm here as your closest friend—someone who truly listens, understands what you're going through, and never judges. Whether you want to conquer exam stress, learn English, explore study notes, or just talk, I've got your back.
          </p>
        </div>
      </div>

      {/* Mood / Quick Intent Prompts */}
      <div className="pt-2 border-t" style={{ borderColor: themeConfig.borderBase }}>
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-2.5">
          How are you feeling right now? Tap to connect with Mitro:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {friendMoodOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              id={`friend_mood_${opt.id}`}
              onClick={() => {
                setSelectedMood(opt.id);
                if (opt.action) {
                  opt.action();
                } else {
                  onSelectPrompt(opt.prompt);
                }
              }}
              className="p-2.5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 shadow-2xs group cursor-pointer"
              style={{
                borderColor: selectedMood === opt.id ? themeConfig.accentColor : themeConfig.borderBase,
                backgroundColor: selectedMood === opt.id ? `${themeConfig.accentColor}15` : themeConfig.bgBase,
              }}
            >
              <div className="text-xs font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {opt.label}
              </div>
              <div className="text-[10px] opacity-65 truncate mt-0.5">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
