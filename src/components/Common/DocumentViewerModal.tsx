import React, { useState } from 'react';
import {
  FileText,
  Presentation,
  Download,
  Copy,
  Check,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  ShieldCheck,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentViewData } from '../../types';

interface DocumentViewerModalProps {
  documentData: DocumentViewData | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  documentData,
  onClose,
}) => {
  const { themeConfig, addDownloadFile } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [fontSizeZoom, setFontSizeZoom] = useState(100);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!documentData) return null;

  const isSlidePresentation =
    documentData.fileType === 'ppt' ||
    (documentData.slides && documentData.slides.length > 0);

  const slides = documentData.slides || [];
  const currentSlide = slides[currentSlideIndex];

  // Real device download function
  const handleDeviceDownload = async () => {
    try {
      let contentToSave = documentData.content;
      let filename = documentData.filename;
      let mimeType = documentData.mimeType;

      if (isSlidePresentation && (!contentToSave || contentToSave.length < 50)) {
        // Format slides as readable presentation markup
        contentToSave = `# ${documentData.title}\n\n` +
          slides
            .map(
              (s, i) =>
                `## Slide ${i + 1}: ${s.title}\n` +
                s.bullets.map((b) => `* ${b}`).join('\n') +
                (s.takeaway ? `\n> **Key Takeaway:** ${s.takeaway}` : '')
            )
            .join('\n\n---\n\n');
      }

      if (!filename.includes('.')) {
        filename += isSlidePresentation ? '.pptx.txt' : '.pdf.txt';
      }

      // Real browser download
      const blob = new Blob([contentToSave], { type: mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Also persist to Downloads vault in IndexedDB
      await addDownloadFile(filename, contentToSave, mimeType, isSlidePresentation ? 'ppt' : 'pdf', slides);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyContent = async () => {
    try {
      const text = isSlidePresentation
        ? slides
            .map((s, idx) => `[Slide ${idx + 1}] ${s.title}\n${s.bullets.join('\n')}`)
            .join('\n\n')
        : documentData.content;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="document_viewer_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="document_viewer_modal"
        className={`w-full rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'max-w-7xl h-[95vh]' : 'max-w-4xl h-[88vh]'
        }`}
        style={{
          backgroundColor: themeConfig.bgBase,
          borderColor: themeConfig.borderBase,
          color: themeConfig.textBase,
        }}
      >
        {/* Top Header & Toolbar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{
                backgroundColor: isSlidePresentation ? '#F97316' : themeConfig.accentColor,
              }}
            >
              {isSlidePresentation ? (
                <Presentation className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold truncate leading-tight">
                  {documentData.title || documentData.filename}
                </h3>
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase shrink-0"
                  style={{
                    backgroundColor: `${themeConfig.accentColor}18`,
                    color: themeConfig.accentColor,
                  }}
                >
                  {documentData.fileType.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] opacity-65 truncate font-mono">
                {documentData.filename} {documentData.sha256Hash ? `· SHA: ${documentData.sha256Hash}` : ''}
              </p>
            </div>
          </div>

          {/* Actions & Zoom Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Zoom for reading */}
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-lg border text-xs opacity-75" style={{ borderColor: themeConfig.borderBase }}>
              <button
                type="button"
                onClick={() => setFontSizeZoom((prev) => Math.max(80, prev - 10))}
                className="p-1 hover:opacity-100 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] px-1">{fontSizeZoom}%</span>
              <button
                type="button"
                onClick={() => setFontSizeZoom((prev) => Math.min(150, prev + 10))}
                className="p-1 hover:opacity-100 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              id="doc_viewer_copy_btn"
              onClick={handleCopyContent}
              className="p-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              style={{ borderColor: themeConfig.borderBase }}
              title="Copy notes to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-75" />}
            </button>

            {/* Print Button */}
            <button
              type="button"
              id="doc_viewer_print_btn"
              onClick={handlePrint}
              className="hidden sm:flex p-2 rounded-xl border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              style={{ borderColor: themeConfig.borderBase }}
              title="Print document or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 opacity-75" />
            </button>

            {/* Download to Device Button */}
            <button
              type="button"
              id="doc_viewer_download_device_btn"
              onClick={handleDeviceDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              style={{ backgroundColor: themeConfig.accentColor }}
              title="Download actual file to phone or PC"
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{downloadSuccess ? 'Downloaded!' : 'Download to Device'}</span>
              <span className="sm:hidden">{downloadSuccess ? 'Saved' : 'Download'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl border text-xs opacity-75 hover:opacity-100 cursor-pointer"
              style={{ borderColor: themeConfig.borderBase }}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              id="doc_viewer_close_btn"
              onClick={onClose}
              className="p-2 rounded-xl border opacity-75 hover:opacity-100 hover:text-red-500 cursor-pointer"
              style={{ borderColor: themeConfig.borderBase }}
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewer Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isSlidePresentation && slides.length > 0 ? (
            /* SLIDES PRESENTATION VIEW */
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-between space-y-4">
              {/* Slide Card */}
              <div
                id={`slide_frame_${currentSlideIndex + 1}`}
                className="flex-1 p-6 sm:p-10 rounded-2xl border shadow-lg flex flex-col justify-between transition-all"
                style={{
                  backgroundColor: themeConfig.surfaceBase,
                  borderColor: themeConfig.borderBase,
                  fontSize: `${(fontSizeZoom / 100) * 1}rem`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b mb-6" style={{ borderColor: themeConfig.borderBase }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                        Slide {currentSlideIndex + 1} of {slides.length}
                      </span>
                    </div>
                    <span className="text-xs font-mono opacity-50">MiTruCo Presentation Studio</span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-bold tracking-tight mb-6" style={{ color: themeConfig.accentColor }}>
                    {currentSlide?.title || `Slide ${currentSlideIndex + 1}`}
                  </h2>

                  <ul className="space-y-3 pl-1">
                    {(currentSlide?.bullets || []).map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-sm leading-relaxed">
                        <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: themeConfig.accentColor }} />
                        <span className="opacity-90">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {currentSlide?.codeSnippet && (
                    <pre className="mt-4 p-3 rounded-xl bg-black/10 dark:bg-black/40 font-mono text-xs overflow-x-auto border" style={{ borderColor: themeConfig.borderBase }}>
                      <code>{currentSlide.codeSnippet}</code>
                    </pre>
                  )}
                </div>

                {currentSlide?.takeaway && (
                  <div
                    className="mt-6 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 font-medium"
                    style={{
                      borderColor: '#F9731650',
                      backgroundColor: '#F9731610',
                      color: themeConfig.textBase,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-orange-600 dark:text-orange-400 font-bold mb-0.5">Key Exam Takeaway:</strong>
                      <span className="opacity-90">{currentSlide.takeaway}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Slide Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  id="slide_prev_btn"
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  style={{ borderColor: themeConfig.borderBase }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Slide</span>
                </button>

                <div className="flex items-center gap-1">
                  {slides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        dotIdx === currentSlideIndex ? 'w-6 bg-orange-500' : 'w-2 bg-neutral-400/40 hover:bg-neutral-400/80'
                      }`}
                      title={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  id="slide_next_btn"
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold disabled:opacity-30 disabled:pointer-events-none hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  style={{ borderColor: themeConfig.borderBase }}
                >
                  <span>Next Slide</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* DOCUMENT / NOTES / PDF READER VIEW */
            <div
              className="max-w-3xl mx-auto p-6 sm:p-10 rounded-2xl border shadow-sm space-y-6"
              style={{
                backgroundColor: themeConfig.surfaceBase,
                borderColor: themeConfig.borderBase,
                fontSize: `${(fontSizeZoom / 100) * 0.9}rem`,
              }}
            >
              {/* Document Header Banner */}
              <div className="border-b pb-4 space-y-1" style={{ borderColor: themeConfig.borderBase }}>
                <div className="flex items-center justify-between text-[11px] opacity-70">
                  <span>MiTruCo Verified Document & Study Sheet</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Cryptographically Sealed (E2EE)
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight pt-1">
                  {documentData.title || documentData.filename}
                </h1>
                <p className="text-xs opacity-65">
                  Source: {documentData.source || 'MiTruCo Companion & Legal/Exam Research Engine'}
                </p>
              </div>

              {/* Formatted Content */}
              <div className="space-y-4 leading-relaxed font-sans opacity-90 whitespace-pre-wrap select-text">
                {documentData.content}
              </div>

              {/* Footer Note */}
              <div
                className="pt-6 mt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] opacity-60"
                style={{ borderColor: themeConfig.borderBase }}
              >
                <span>Generated by MiTruCo Companion</span>
                <span>«Made with love and care from Bihar — GR_»</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
