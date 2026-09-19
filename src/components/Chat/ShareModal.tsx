import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send, Instagram, Smartphone, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  summaryText?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  query,
  summaryText = '',
}) => {
  const { themeConfig } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Clean prompt / title for sharing
  const effectiveQuery = (query && query.trim()) || 'Exam & Study Search Result';
  
  // Create shareable deep link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/?q=${encodeURIComponent(effectiveQuery)}`;

  // Extract a clean 2-3 sentence snippet without markdown hashes
  const cleanSnippet = summaryText
    .replace(/[#*`_~>[\]]/g, '')
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 3)
    .join(' ')
    .slice(0, 220);

  const shareTitle = `MiTruCo Study & Search: ${effectiveQuery}`;
  const whatsappBody = `📚 *${shareTitle}*\n\n${cleanSnippet ? `"${cleanSnippet}..."\n\n` : ''}🔗 Open full interactive search result & exam triage:\n${shareUrl}`;
  const telegramBody = `📚 ${shareTitle}\n\n${cleanSnippet ? `"${cleanSnippet}..."\n\n` : ''}Open full result:\n${shareUrl}`;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      triggerToast('Share link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      triggerToast('Unable to copy link automatically.');
    }
  };

  const handleCopySummary = async () => {
    try {
      const fullSharePayload = `${shareTitle}\n\n${summaryText}\n\nShared via MiTruCo: ${shareUrl}`;
      await navigator.clipboard.writeText(fullSharePayload);
      setCopiedText(true);
      triggerToast('Complete result & answer copied to clipboard!');
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      triggerToast('Unable to copy summary automatically.');
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappBody)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(telegramBody)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInstagramShare = async () => {
    // Instagram does not have a direct web URL text injector, so we copy the formatted note and open Instagram
    try {
      const igNote = `📚 ${shareTitle}\n\n${cleanSnippet ? `${cleanSnippet}...\n\n` : ''}🔗 Search link: ${shareUrl}`;
      await navigator.clipboard.writeText(igNote);
      triggerToast('Summary copied! Opening Instagram so you can paste in DM or Story...');
      setTimeout(() => {
        window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
      }, 700);
    } catch {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${cleanSnippet ? `${cleanSnippet}\n\n` : ''}Shared from MiTruCo:`,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      id="share_modal_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="share_modal_card"
        className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          backgroundColor: themeConfig.bgBase,
          borderColor: themeConfig.borderBase,
          color: themeConfig.textBase,
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: themeConfig.borderBase }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">Share Search Result</h2>
              <p className="text-[11px] opacity-70">Share directly to WhatsApp, Instagram, Telegram, or copy link</p>
            </div>
          </div>

          <button
            id="share_modal_close_btn"
            onClick={onClose}
            className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Query & Excerpt Preview Box */}
        <div className="p-5 space-y-4">
          <div
            className="p-3.5 rounded-xl border text-xs space-y-1.5"
            style={{
              borderColor: themeConfig.borderBase,
              backgroundColor: themeConfig.surfaceBase,
            }}
          >
            <div className="flex items-center gap-1.5 font-bold" style={{ color: themeConfig.accentColor }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="truncate">Search: "{effectiveQuery}"</span>
            </div>
            {cleanSnippet && (
              <p className="text-[11px] opacity-80 line-clamp-3 leading-relaxed">
                "{cleanSnippet}..."
              </p>
            )}
          </div>

          {/* 1-Click Platform Channels */}
          <div>
            <label className="text-[11px] font-bold opacity-75 uppercase tracking-wider block mb-2">
              Share to Apps & Friends
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                id="share_to_whatsapp_btn"
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-semibold text-xs transition-all hover:scale-102 hover:shadow-xs group"
                style={{
                  borderColor: '#25D36640',
                  backgroundColor: '#25D36610',
                }}
              >
                <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <span className="text-[#128C7E] dark:text-[#25D366] font-bold">WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                id="share_to_telegram_btn"
                onClick={handleTelegramShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-semibold text-xs transition-all hover:scale-102 hover:shadow-xs group"
                style={{
                  borderColor: '#229ED940',
                  backgroundColor: '#229ED910',
                }}
              >
                <div className="w-9 h-9 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4 ml-0.5" />
                </div>
                <span className="text-[#0088cc] dark:text-[#229ED9] font-bold">Telegram</span>
              </button>

              {/* Instagram */}
              <button
                id="share_to_instagram_btn"
                onClick={handleInstagramShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-semibold text-xs transition-all hover:scale-102 hover:shadow-xs group"
                style={{
                  borderColor: '#E1306C40',
                  backgroundColor: '#E1306C10',
                }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-[#C13584] dark:text-[#E1306C] font-bold">Instagram</span>
              </button>

              {/* Native Device Share Sheet */}
              <button
                id="share_to_native_btn"
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border font-semibold text-xs transition-all hover:scale-102 hover:shadow-xs group"
                style={{
                  borderColor: themeConfig.borderBase,
                  backgroundColor: themeConfig.surfaceBase,
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${themeConfig.accentColor}20`, color: themeConfig.accentColor }}
                >
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="font-bold">More Apps</span>
              </button>
            </div>
          </div>

          {/* Direct Link Copy Bar */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold opacity-75 uppercase tracking-wider block">
              Direct Search Link
            </label>
            <div
              className="flex items-center gap-2 p-1.5 pl-3 rounded-xl border text-xs"
              style={{
                borderColor: themeConfig.borderBase,
                backgroundColor: themeConfig.surfaceBase,
              }}
            >
              <input
                id="share_link_input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent outline-hidden font-mono text-[11px] select-all opacity-80"
              />
              <button
                id="copy_share_link_btn"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                style={{ backgroundColor: themeConfig.accentColor }}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Copy Full Text Snippet */}
          <div className="pt-1 flex items-center justify-between border-t" style={{ borderColor: themeConfig.borderBase }}>
            <span className="text-[11px] opacity-70">Need the full notes & breakdown?</span>
            <button
              id="copy_full_summary_btn"
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              style={{ borderColor: themeConfig.borderBase }}
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Notes Copied' : 'Copy Full Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
