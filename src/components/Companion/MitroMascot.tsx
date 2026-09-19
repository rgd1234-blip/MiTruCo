import React, { useState } from 'react';
import { Heart, Sparkles, Star, Smile, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type MascotMood = 'happy' | 'listening' | 'comforting' | 'studying' | 'celebrating';

interface MitroMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg';
  showSpeechBubble?: boolean;
  customMessage?: string;
  onTap?: () => void;
  className?: string;
}

export const MitroMascot: React.FC<MitroMascotProps> = ({
  mood = 'happy',
  size = 'md',
  showSpeechBubble = false,
  customMessage,
  onTap,
  className = '',
}) => {
  const { themeConfig, userProfile } = useApp();
  const [isWaving, setIsWaving] = useState(false);
  const [bubbleText, setBubbleText] = useState(customMessage);

  const sizePixels = size === 'sm' ? 48 : size === 'lg' ? 100 : 72;

  const handleMascotClick = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1200);

    const friendlyGreetings = [
      `I'm right here with you, ${userProfile.displayName || 'friend'}! 💕`,
      "Take a deep breath—we've got this together! 🌟",
      "Whenever you need to talk, vent, or study, I'm all ears! ✨",
      "You're doing better than you realize. So proud of you! 🤗",
      "Ready to learn something exciting today? Let's go! 🚀",
    ];
    const picked = friendlyGreetings[Math.floor(Math.random() * friendlyGreetings.length)];
    setBubbleText(picked);

    if (onTap) onTap();
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group ${className}`}
      onClick={handleMascotClick}
      title="Tap your friend Mitro!"
    >
      {/* Interactive Speech Bubble */}
      {(showSpeechBubble || bubbleText) && (
        <div
          className="mb-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold shadow-md max-w-xs text-center animate-in fade-in zoom-in-95 duration-150 relative"
          style={{
            backgroundColor: themeConfig.surfaceBase,
            borderColor: themeConfig.borderBase,
            color: themeConfig.textBase,
          }}
        >
          <span>{bubbleText || customMessage || `Hey ${userProfile.displayName || 'friend'}! Glad you're here ✨`}</span>
          {/* Bubble Tail */}
          <div
            className="w-2.5 h-2.5 rotate-45 border-r border-b absolute -bottom-1.5 left-1/2 -translate-x-1/2"
            style={{
              backgroundColor: themeConfig.surfaceBase,
              borderColor: themeConfig.borderBase,
            }}
          />
        </div>
      )}

      {/* Creature Avatar SVG (Mitro: Caring, warm, friendly companion with rounded ears, big eyes, and blush) */}
      <div
        className={`relative transition-transform duration-300 ${
          isWaving ? 'scale-110 rotate-3' : 'group-hover:scale-105'
        }`}
        style={{ width: sizePixels, height: sizePixels }}
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-md overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body Gradient */}
            <linearGradient id="mitroBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFAA5B" />
              <stop offset="50%" stopColor="#FF7E67" />
              <stop offset="100%" stopColor="#E8505B" />
            </linearGradient>

            {/* Belly Gradient */}
            <linearGradient id="mitroBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF9F2" />
              <stop offset="100%" stopColor="#FFE8D6" />
            </linearGradient>

            {/* Ear Inner Gradient */}
            <linearGradient id="mitroEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFC6B3" />
              <stop offset="100%" stopColor="#FFA07A" />
            </linearGradient>

            {/* Glow Aura */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glowing Aura */}
          <circle cx="60" cy="62" r="48" fill="#FF7E67" opacity="0.18" filter="url(#softGlow)" />

          {/* Left Ear */}
          <ellipse cx="32" cy="32" rx="14" ry="18" fill="url(#mitroBodyGrad)" transform="rotate(-15 32 32)" />
          <ellipse cx="32" cy="33" rx="8" ry="11" fill="url(#mitroEarInner)" transform="rotate(-15 32 33)" />

          {/* Right Ear */}
          <ellipse cx="88" cy="32" rx="14" ry="18" fill="url(#mitroBodyGrad)" transform="rotate(15 88 32)" />
          <ellipse cx="88" cy="33" rx="8" ry="11" fill="url(#mitroEarInner)" transform="rotate(15 88 33)" />

          {/* Main Body */}
          <ellipse cx="60" cy="65" rx="44" ry="40" fill="url(#mitroBodyGrad)" />

          {/* Soft Belly */}
          <ellipse cx="60" cy="74" rx="28" ry="24" fill="url(#mitroBellyGrad)" opacity="0.95" />

          {/* Little Companion Horn / Cute Antennas or Hair Tuft */}
          <path
            d="M 56 26 Q 60 18 64 26"
            fill="none"
            stroke="#FFAA5B"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Cheerful Eyes */}
          {mood === 'comforting' ? (
            /* Gentle curved smiling eyes */
            <>
              <path d="M 42 56 Q 48 50 54 56" fill="none" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
              <path d="M 66 56 Q 72 50 78 56" fill="none" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : mood === 'celebrating' ? (
            /* Starry / joyous eyes */
            <>
              <circle cx="48" cy="54" r="5" fill="#2D2D2D" />
              <circle cx="72" cy="54" r="5" fill="#2D2D2D" />
              <circle cx="46" cy="52" r="1.8" fill="#FFF" />
              <circle cx="70" cy="52" r="1.8" fill="#FFF" />
              <circle cx="50" cy="56" r="1" fill="#FFF" />
              <circle cx="74" cy="56" r="1" fill="#FFF" />
            </>
          ) : (
            /* Big, warm empathetic dark eyes with sparkle */
            <>
              <ellipse cx="48" cy="55" rx="5.5" ry="6.5" fill="#2D2D2D" />
              <ellipse cx="72" cy="55" rx="5.5" ry="6.5" fill="#2D2D2D" />
              {/* Eye Catchlights */}
              <circle cx="46" cy="52" r="2.2" fill="#FFFFFF" />
              <circle cx="70" cy="52" r="2.2" fill="#FFFFFF" />
              <circle cx="50" cy="57" r="1.2" fill="#FFFFFF" />
              <circle cx="74" cy="57" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Cute Tiny Nose */}
          <ellipse cx="60" cy="62" rx="2.5" ry="2" fill="#8C2D19" />

          {/* Sweet Smile */}
          <path
            d="M 54 66 Q 60 72 66 66"
            fill="none"
            stroke="#2D2D2D"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Rosy Cheeks */}
          <ellipse cx="38" cy="63" rx="5" ry="3.5" fill="#FF4D6D" opacity="0.6" />
          <ellipse cx="82" cy="63" rx="5" ry="3.5" fill="#FF4D6D" opacity="0.6" />

          {/* Cute Hands / Paws */}
          {/* Left Hand: Waving or Resting */}
          <ellipse
            cx="22"
            cy={isWaving ? 48 : 72}
            rx="6.5"
            ry="9"
            fill="url(#mitroBodyGrad)"
            transform={isWaving ? 'rotate(-30 22 48)' : 'rotate(15 22 72)'}
            className="transition-all duration-300"
          />

          {/* Right Hand: Resting or Holding something */}
          <ellipse
            cx="98"
            cy="72"
            rx="6.5"
            ry="9"
            fill="url(#mitroBodyGrad)"
            transform="rotate(-15 98 72)"
          />

          {/* Little Feet */}
          <ellipse cx="46" cy="98" rx="8" ry="5" fill="url(#mitroBodyGrad)" />
          <ellipse cx="74" cy="98" rx="8" ry="5" fill="url(#mitroBodyGrad)" />

          {/* Cute Accessories based on mood */}
          {mood === 'studying' && (
            /* Glasses */
            <g stroke="#374151" strokeWidth="2" fill="none">
              <circle cx="48" cy="54" r="8" />
              <circle cx="72" cy="54" r="8" />
              <line x1="56" y1="54" x2="64" y2="54" />
            </g>
          )}
        </svg>

        {/* Floating Heart or Sparkle on hover/wave */}
        <div
          className={`absolute -top-2 -right-1 transition-all duration-300 ${
            isWaving ? 'scale-125 opacity-100' : 'opacity-70 group-hover:scale-110'
          }`}
        >
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
        </div>
      </div>

      {/* Companion Name Badge */}
      <span className="mt-1 text-[11px] font-bold tracking-tight opacity-75 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <span>Mitro</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      </span>
    </div>
  );
};
