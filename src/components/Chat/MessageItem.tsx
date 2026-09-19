/**
 * MiTruCo Message Item Component
 * Renders unified conversational blocks: Markdown, LaTeX/Formulas,
 * Product Cards with verified specs & prices, Media Radar cards,
 * Local Places cards, Study worked solutions, and verified Search Citations.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Bookmark,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Tv,
  ShoppingBag,
  GraduationCap,
  FileText,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { Message, MessageBlock, Citation, ProductCardData, MediaCardData, LocalPlaceData, StudyBlockData } from '../../types';
import { useApp } from '../../context/AppContext';
import { ExamTriageCard } from './ExamTriageCard';
import { PressureReliefCard } from './PressureReliefCard';
import { ShareModal } from './ShareModal';

interface MessageItemProps {
  message: Message;
  onActionClick?: (payload: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onActionClick }) => {
  const { themeConfig, saveBookmark, addDownloadFile, messages } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isUser = message.sender === 'user';

  // Derive inferred query from the preceding user turn
  const currentMsgIdx = messages.findIndex((m) => m.id === message.id);
  const precedingUserMsg =
    currentMsgIdx > 0
      ? messages
          .slice(0, currentMsgIdx)
          .reverse()
          .find((m) => m.sender === 'user')
      : null;

  const inferredQuery =
    precedingUserMsg?.blocks.find((b) => b.type === 'text' || b.type === 'markdown')?.content ||
    'CLAT, judiciary, and law exams search';

  const fullMarkdownText = message.blocks
    .filter((b) => b.type === 'markdown' || b.type === 'text')
    .map((b) => b.content)
    .filter(Boolean)
    .join('\n\n');

  const hasCitations = message.blocks.some((b) => b.type === 'citations' && b.citations && b.citations.length > 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSaveProduct = async (prod: ProductCardData) => {
    await saveBookmark(
      `${prod.productName} (${prod.currency}${prod.currentPrice})`,
      `Merchant: ${prod.merchantName} · Verified ${prod.verifiedTimestamp}`,
      message.conversationId
    );
    setBookmarkedIds((prev) => ({ ...prev, [prod.id]: true }));
  };

  const handleSaveMedia = async (media: MediaCardData) => {
    await saveBookmark(
      `${media.title} (${media.releaseYear})`,
      `Streaming on ${media.streamingProviders.map((p) => p.name).join(', ')}`,
      message.conversationId
    );
    setBookmarkedIds((prev) => ({ ...prev, [media.id]: true }));
  };

  const handleExportStudy = async (study: StudyBlockData) => {
    const text = `# ${study.subject}: ${study.topic} (${study.complexity})\n\n` +
      study.workedSteps?.map(s => `## Step ${s.stepNumber}: ${s.title}\n${s.explanation}\nFormula: ${s.mathFormula || 'N/A'}`).join('\n\n') +
      '\n\n## Practice Questions:\n' +
      study.practiceQuestions?.map(q => `Q: ${q.question}\nAns: ${q.answer}`).join('\n');
    await addDownloadFile(`${study.topic.replace(/\s+/g, '_')}_notes.txt`, text, 'text/plain');
    alert('Study notes exported to Downloads module!');
  };

  return (
    <div
      className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}
      id={`message_${message.id}`}
    >
      <div className={`flex gap-3 max-w-3xl w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Assistant Avatar */}
        {!isUser && (
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs mt-1"
            style={{ backgroundColor: themeConfig.accentColor }}
            title="MiTruCo Companion"
          >
            <Sparkles className="w-4 h-4" />
          </div>
        )}

        {/* Message Bubble & Cards Container */}
        <div className={`space-y-3 ${isUser ? 'max-w-xl' : 'w-full'}`}>
          {/* Active Tool Execution States */}
          {message.toolStates && message.toolStates.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {message.toolStates.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border animate-fade-in"
                  style={{
                    backgroundColor: themeConfig.surfaceBase,
                    borderColor: themeConfig.borderBase,
                    color: themeConfig.accentColor,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-semibold capitalize">{tool.toolName.replace('_', ' ')}:</span>
                  <span className="opacity-90">{tool.statusMessage}</span>
                </div>
              ))}
            </div>
          )}

          {/* User Attachments Preview */}
          {isUser && message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border"
                  style={{
                    borderColor: themeConfig.borderBase,
                    backgroundColor: themeConfig.surfaceBase,
                    color: themeConfig.textBase,
                  }}
                >
                  <FileText className="w-3.5 h-3.5 opacity-70" />
                  <span className="max-w-[120px] truncate">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Blocks */}
          {message.blocks.map((block, idx) => (
            <div key={idx}>
              {/* Text / Markdown Block */}
              {(block.type === 'text' || block.type === 'markdown') && block.content && (
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-colors ${
                    isUser ? 'text-white rounded-br-xs' : 'border rounded-tl-xs shadow-2xs'
                  }`}
                  style={{
                    backgroundColor: isUser ? themeConfig.accentColor : themeConfig.surfaceBase,
                    borderColor: isUser ? 'transparent' : themeConfig.borderBase,
                    color: isUser ? '#FFFFFF' : themeConfig.textBase,
                  }}
                >
                  {block.content}
                </div>
              )}

              {/* Product Card Block */}
              {block.type === 'product' && block.productData && (
                <div
                  className="p-4 rounded-2xl border shadow-xs transition-all hover:shadow-md"
                  style={{
                    backgroundColor: themeConfig.surfaceBase,
                    borderColor: themeConfig.borderBase,
                    color: themeConfig.textBase,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: themeConfig.accentColor }}>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Verified Commerce Match</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                        In Stock
                      </span>
                    </div>

                    <button
                      onClick={() => handleSaveProduct(block.productData!)}
                      className="flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity"
                      title="Save product to Activity Bookmarks"
                    >
                      {bookmarkedIds[block.productData.id] ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      <span>{bookmarkedIds[block.productData.id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {block.productData.productName}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black" style={{ color: themeConfig.accentColor }}>
                      {block.productData.currency}{block.productData.currentPrice.toLocaleString('en-IN')}
                    </span>
                    {block.productData.originalPrice && (
                      <span className="text-xs line-through opacity-50">
                        {block.productData.currency}{block.productData.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {block.productData.discountPercentage && (
                      <span className="text-xs font-bold text-emerald-600">
                        ({block.productData.discountPercentage}% OFF)
                      </span>
                    )}
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3 pt-3 border-t text-xs" style={{ borderColor: themeConfig.borderBase }}>
                    {block.productData.specifications.map((spec, sIdx) => (
                      <div key={sIdx} className="flex justify-between p-1.5 rounded-md" style={{ backgroundColor: themeConfig.bgBase }}>
                        <span className="opacity-70">{spec.label}</span>
                        <span className="font-semibold">{spec.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 text-xs border-t opacity-80" style={{ borderColor: themeConfig.borderBase }}>
                    <span>Merchant: <strong>{block.productData.merchantName}</strong> · {block.productData.verifiedTimestamp}</span>
                    <a
                      href={block.productData.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-bold underline"
                      style={{ color: themeConfig.accentColor }}
                    >
                      <span>Check Retailer</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Media Radar Card Block */}
              {block.type === 'media' && block.mediaData && (
                <div
                  className="p-4 rounded-2xl border shadow-xs"
                  style={{
                    backgroundColor: themeConfig.surfaceBase,
                    borderColor: themeConfig.borderBase,
                    color: themeConfig.textBase,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: themeConfig.accentColor }}>
                      <Tv className="w-4 h-4" />
                      <span>Media & OTT Streaming Radar</span>
                    </div>

                    <button
                      onClick={() => handleSaveMedia(block.mediaData!)}
                      className="flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100"
                    >
                      {bookmarkedIds[block.mediaData.id] ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
                      <span>{bookmarkedIds[block.mediaData.id] ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>

                  <div className="mt-2">
                    <h3 className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {block.mediaData.title} ({block.mediaData.releaseYear})
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {block.mediaData.genre.map((g, gIdx) => (
                        <span
                          key={gIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium"
                          style={{ backgroundColor: themeConfig.bgBase, color: themeConfig.textMuted }}
                        >
                          {g}
                        </span>
                      ))}
                      {block.mediaData.ratingScore && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                          ★ {block.mediaData.ratingScore}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed mt-2.5 opacity-80">
                    {block.mediaData.synopsis}
                  </p>

                  {/* Streaming Providers */}
                  <div className="mt-3 pt-3 border-t text-xs space-y-1.5" style={{ borderColor: themeConfig.borderBase }}>
                    <div className="font-bold opacity-80 flex items-center justify-between">
                      <span>Verified Streaming Platforms:</span>
                      <span className="text-[10px] font-normal opacity-70">{block.mediaData.checkedTimestamp}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                      {block.mediaData.streamingProviders.map((prov, pIdx) => (
                        <a
                          key={pIdx}
                          href={prov.directUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-transform active:scale-95"
                          style={{
                            borderColor: themeConfig.accentColor,
                            backgroundColor: `${themeConfig.accentColor}10`,
                            color: themeConfig.accentColor,
                          }}
                        >
                          <span>{prov.name}</span>
                          <span className="text-[10px] uppercase opacity-75 font-normal">({prov.type})</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Local Food & Places Block */}
              {block.type === 'local' && block.localData && (
                <div
                  className="p-4 rounded-2xl border shadow-xs"
                  style={{
                    backgroundColor: themeConfig.surfaceBase,
                    borderColor: themeConfig.borderBase,
                    color: themeConfig.textBase,
                  }}
                >
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold" style={{ color: themeConfig.accentColor }}>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>Nearby Verified Discovery</span>
                    </div>
                    <span className="text-emerald-600 font-bold">● Open Now</span>
                  </div>

                  <h3 className="text-base font-bold mt-2">{block.localData.name}</h3>
                  <p className="text-xs opacity-75 mt-0.5">{block.localData.category} · {block.localData.priceLevel}</p>

                  <div className="mt-2.5 p-2 rounded-xl text-xs space-y-1" style={{ backgroundColor: themeConfig.bgBase }}>
                    <div className="flex items-center gap-1.5 opacity-80">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{block.localData.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-80">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{block.localData.openingHours}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 text-xs border-t" style={{ borderColor: themeConfig.borderBase }}>
                    <span className="opacity-75">{block.localData.verifiedTimestamp}</span>
                    <a
                      href={block.localData.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-bold underline"
                      style={{ color: themeConfig.accentColor }}
                    >
                      <span>Get Directions & Menu</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* Study Worked Block */}
              {block.type === 'study' && block.studyData && (
                <div
                  className="p-4 rounded-2xl border shadow-xs space-y-3"
                  style={{
                    backgroundColor: themeConfig.surfaceBase,
                    borderColor: themeConfig.borderBase,
                    color: themeConfig.textBase,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: themeConfig.accentColor }}>
                      <GraduationCap className="w-4 h-4" />
                      <span>{block.studyData.subject}: {block.studyData.topic}</span>
                    </div>
                    <button
                      onClick={() => handleExportStudy(block.studyData!)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border hover:opacity-80"
                      style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                    >
                      Export Notes
                    </button>
                  </div>

                  {/* Worked steps */}
                  {block.studyData.workedSteps && block.studyData.workedSteps.length > 0 && (
                    <div className="space-y-2">
                      {block.studyData.workedSteps.map((step) => (
                        <div key={step.stepNumber} className="p-3 rounded-xl border text-xs" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}>
                          <h4 className="font-bold text-sm mb-1">{step.stepNumber}. {step.title}</h4>
                          <p className="opacity-80">{step.explanation}</p>
                          {step.mathFormula && (
                            <div className="mt-2 p-2 rounded-md font-mono bg-black/5 dark:bg-white/5 text-amber-700 dark:text-amber-300 font-bold">
                              {step.mathFormula}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Practice Questions */}
                  {block.studyData.practiceQuestions && block.studyData.practiceQuestions.length > 0 && (
                    <div className="pt-2 border-t text-xs space-y-2" style={{ borderColor: themeConfig.borderBase }}>
                      <h4 className="font-bold opacity-80">Practice & Self-Check:</h4>
                      {block.studyData.practiceQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="p-2.5 rounded-lg border" style={{ borderColor: themeConfig.borderBase }}>
                          <p className="font-medium">{q.question}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => setRevealedHints((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                              className="text-[11px] font-bold underline"
                              style={{ color: themeConfig.accentColor }}
                            >
                              {revealedHints[qIdx] ? 'Hide Answer & Hint' : 'Show Answer'}
                            </button>
                          </div>
                          {revealedHints[qIdx] && (
                            <div className="mt-2 pt-2 border-t text-[11px] space-y-1 opacity-90" style={{ borderColor: themeConfig.borderBase }}>
                              {q.hint && <p><strong>Hint:</strong> {q.hint}</p>}
                              {q.answer && <p><strong>Answer:</strong> {q.answer}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Specialized Exam 80/20 Triage Card */}
              {block.type === 'examTriage' && block.examTriageData && (
                <ExamTriageCard data={block.examTriageData} />
              )}

              {/* Acute Pressure Relief & Breathing Anchor Card */}
              {block.type === 'pressureRelief' && block.pressureReliefData && (
                <PressureReliefCard data={block.pressureReliefData} />
              )}

              {/* Citations & Verified Sources */}
              {block.type === 'citations' && block.citations && block.citations.length > 0 && (
                <div className="pt-2 border-t text-xs space-y-1.5" style={{ borderColor: themeConfig.borderBase }}>
                  <div className="font-bold opacity-75 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                    <span>Verified Web Sources ({block.citations.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {block.citations.map((cit, cIdx) => (
                      <a
                        key={cIdx}
                        href={cit.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-all hover:scale-102"
                        style={{
                          borderColor: themeConfig.borderBase,
                          backgroundColor: themeConfig.surfaceBase,
                          color: themeConfig.textBase,
                        }}
                        title={cit.title}
                      >
                        <span className="font-medium max-w-[150px] truncate">{cit.sourceName || cit.title}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Row */}
              {block.type === 'actionRow' && block.actions && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {block.actions.map((act) => (
                    <button
                      key={act.id}
                      onClick={() => onActionClick?.(act.payload || act.label)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-semibold transition-transform active:scale-95 shadow-2xs"
                      style={{
                        borderColor: themeConfig.accentColor,
                        backgroundColor: themeConfig.surfaceBase,
                        color: themeConfig.accentColor,
                      }}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Error Block */}
              {block.type === 'error' && (
                <div className="p-3 rounded-xl border flex items-center gap-2 text-xs bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{block.content}</span>
                </div>
              )}
            </div>
          ))}

          {/* Assistant Message Action Bar & Share Engine */}
          {!isUser && !message.isStreaming && (
            <div
              id={`message_actions_bar_${message.id}`}
              className="flex items-center flex-wrap gap-2 pt-2 border-t text-xs opacity-95 animate-in fade-in"
              style={{ borderColor: themeConfig.borderBase }}
            >
              {/* Primary Share Search Result Button */}
              <button
                type="button"
                id={`share_result_btn_${message.id}`}
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all hover:scale-102 active:scale-95 shadow-2xs group cursor-pointer"
                style={{
                  borderColor: '#25D36660',
                  backgroundColor: '#25D36615',
                  color: '#128C7E',
                }}
                title="Share this search result to WhatsApp, Instagram, or Telegram"
              >
                <Share2 className="w-3.5 h-3.5 text-[#25D366] group-hover:rotate-12 transition-transform" />
                <span>Share Result</span>
              </button>

              {/* Quick Copy Answer */}
              {fullMarkdownText && (
                <button
                  type="button"
                  id={`copy_answer_btn_${message.id}`}
                  onClick={() => handleCopy(fullMarkdownText, `msg_${message.id}`)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  style={{ borderColor: themeConfig.borderBase }}
                  title="Copy full answer text"
                >
                  {copiedCode === `msg_${message.id}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 opacity-70" />
                      <span>Copy Notes</span>
                    </>
                  )}
                </button>
              )}

              {/* Verified Badge */}
              {hasCitations && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Verified Sources
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog Sheet */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        query={inferredQuery}
        summaryText={fullMarkdownText}
      />
    </div>
  );
};
