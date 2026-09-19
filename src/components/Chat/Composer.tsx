/**
 * MiTruCo Unified Composer
 * Multimodal input component supporting text input, voice trigger,
 * drag-and-drop & manual file attachment toggles, camera capture,
 * and live generation interruption.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Mic,
  MicOff,
  Paperclip,
  Camera,
  Image as ImageIcon,
  FileText,
  X,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttachmentItem } from '../../types';

interface ComposerProps {
  onSend: (text: string, attachments?: AttachmentItem[]) => void;
}

export const Composer: React.FC<ComposerProps> = ({ onSend }) => {
  const { themeConfig, isStreaming, stopGeneration } = useApp();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript;
            } else {
              interim += transcript;
            }
          }

          if (final.trim()) {
            setInputText((prev) => {
              const cleanedPrev = prev.trim();
              return cleanedPrev ? `${cleanedPrev} ${final.trim()}` : final.trim();
            });
            setInterimTranscript('');
          } else {
            setInterimTranscript(interim);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            setErrorMessage(`Microphone error: ${event.error || 'Access denied'}`);
            setTimeout(() => setErrorMessage(null), 4000);
          }
          setIsRecording(false);
          setInterimTranscript('');
        };

        recognition.onend = () => {
          setIsRecording(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
      } catch {
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Voice recording toggle trigger
  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      setErrorMessage('Speech recognition is not supported in this browser or is restricted.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
      setInterimTranscript('');
    } else {
      try {
        setErrorMessage(null);
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        setIsRecording(false);
        setErrorMessage('Unable to start voice recording. Check microphone permissions.');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    }
  };

  // Process uploaded files (manual or drag-and-drop)
  const processFiles = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    fileList.forEach((file, index) => {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds the 10MB size limit.`);
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newItem: AttachmentItem = {
          id: `att_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          base64Data: reader.result as string,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });

    setShowAttachmentMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) {
      stopGeneration();
      return;
    }

    const trimmed = inputText.trim();
    if (!trimmed && attachments.length === 0) return;

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
      setInterimTranscript('');
    }

    onSend(trimmed, attachments);
    setInputText('');
    setAttachments([]);
    setShowAttachmentMenu(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      id="composer_container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="p-3 border-t transition-colors sticky bottom-0 z-20 backdrop-blur-md relative"
      style={{
        backgroundColor: `${themeConfig.surfaceBase}F2`,
        borderColor: themeConfig.borderBase,
      }}
    >
      {/* Hidden Native File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Drag & Drop Visual Overlay Zone */}
      {isDraggingOver && (
        <div
          id="composer_drag_drop_zone"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 p-4 m-2 rounded-2xl border-2 border-dashed backdrop-blur-sm transition-all"
          style={{
            borderColor: themeConfig.accentColor,
            backgroundColor: `${themeConfig.bgBase}E6`,
            color: themeConfig.accentColor,
          }}
        >
          <UploadCloud className="w-8 h-8 animate-bounce" />
          <p className="text-sm font-bold">Drop files here to attach</p>
          <p className="text-xs opacity-75">Supports images, PDFs, code snippets, and study documents (up to 10MB)</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-2.5">
        {/* Error Notification Toast */}
        {errorMessage && (
          <div
            id="composer_error_banner"
            className="p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-xs animate-in fade-in"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#FCA5A5',
              color: '#B91C1C',
            }}
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-md hover:bg-black/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Voice Recording Status Bar */}
        {isRecording && (
          <div
            id="composer_voice_status_bar"
            className="flex items-center justify-between px-3 py-2 rounded-xl border text-xs shadow-xs"
            style={{
              backgroundColor: '#FEF2F2',
              borderColor: '#EF4444',
              color: '#B91C1C',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-bold">Listening... speak clearly</span>
              {interimTranscript && (
                <span className="opacity-80 italic max-w-xs truncate">"{interimTranscript}"</span>
              )}
            </div>
            <button
              type="button"
              id="composer_voice_stop_pill_btn"
              onClick={handleToggleVoice}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white shadow-2xs hover:bg-red-700 transition-colors"
            >
              Done Dictating
            </button>
          </div>
        )}

        {/* File Attachment Toggle Tray / Drawer */}
        {showAttachmentMenu && (
          <div
            id="composer_attachment_drawer"
            className="p-3 rounded-2xl border shadow-md space-y-2 animate-in slide-in-from-bottom-2"
            style={{
              backgroundColor: themeConfig.bgBase,
              borderColor: themeConfig.borderBase,
            }}
          >
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: themeConfig.borderBase }}>
              <span className="text-xs font-bold tracking-tight opacity-80">Attach Content to Conversation</span>
              <button
                type="button"
                id="composer_attachment_drawer_close"
                onClick={() => setShowAttachmentMenu(false)}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Document Option */}
              <button
                type="button"
                id="composer_upload_doc_btn"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:scale-101 min-h-[44px]"
                style={{
                  borderColor: themeConfig.borderBase,
                  backgroundColor: themeConfig.surfaceBase,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${themeConfig.accentColor}15`, color: themeConfig.accentColor }}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Document</div>
                  <div className="text-[10px] opacity-70">PDF, TXT, DOCX, Code</div>
                </div>
              </button>

              {/* Photo / Image Option */}
              <button
                type="button"
                id="composer_upload_img_btn"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:scale-101 min-h-[44px]"
                style={{
                  borderColor: themeConfig.borderBase,
                  backgroundColor: themeConfig.surfaceBase,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                >
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Photo / Image</div>
                  <div className="text-[10px] opacity-70">PNG, JPG, WebP</div>
                </div>
              </button>

              {/* Camera Capture Option */}
              <button
                type="button"
                id="composer_camera_btn"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all hover:scale-101 min-h-[44px]"
                style={{
                  borderColor: themeConfig.borderBase,
                  backgroundColor: themeConfig.surfaceBase,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                >
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Camera Snap</div>
                  <div className="text-[10px] opacity-70">Capture live question</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Attachments Preview Bar */}
        {attachments.length > 0 && (
          <div
            id="composer_attachments_preview"
            className="flex flex-wrap gap-2 p-2.5 rounded-xl border bg-black/5 dark:bg-white/5"
            style={{ borderColor: themeConfig.borderBase }}
          >
            {attachments.map((att) => {
              const isImage = att.mimeType.startsWith('image/') && att.base64Data;

              return (
                <div
                  key={att.id}
                  id={`attachment_chip_${att.id}`}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl text-xs border shadow-2xs group"
                  style={{
                    borderColor: themeConfig.borderBase,
                    backgroundColor: themeConfig.bgBase,
                    color: themeConfig.textBase,
                  }}
                >
                  {isImage ? (
                    <img
                      src={att.base64Data}
                      alt={att.name}
                      className="w-8 h-8 rounded-lg object-cover border"
                      style={{ borderColor: themeConfig.borderBase }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        borderColor: themeConfig.borderBase,
                        backgroundColor: themeConfig.surfaceBase,
                        color: themeConfig.accentColor,
                      }}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                  )}

                  <div className="max-w-[140px]">
                    <p className="font-semibold text-[11px] truncate">{att.name}</p>
                    <p className="text-[9px] opacity-65">{formatFileSize(att.sizeBytes)}</p>
                  </div>

                  <button
                    type="button"
                    id={`remove_attachment_${att.id}`}
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    title={`Remove ${att.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Main Composer Input Box */}
        <div
          className="flex items-end gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl border shadow-xs transition-all focus-within:shadow-md"
          style={{
            backgroundColor: themeConfig.bgBase,
            borderColor: isRecording ? '#EF4444' : themeConfig.borderBase,
          }}
        >
          {/* File Attachment Toggle Button */}
          <button
            type="button"
            id="composer_attachment_toggle_btn"
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl flex items-center justify-center transition-all ${
              showAttachmentMenu || attachments.length > 0
                ? 'opacity-100 font-bold'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: showAttachmentMenu ? `${themeConfig.accentColor}15` : 'transparent',
              color: showAttachmentMenu ? themeConfig.accentColor : 'inherit',
            }}
            title={showAttachmentMenu ? 'Close attachments menu' : 'Attach file, document, or photo'}
            aria-expanded={showAttachmentMenu}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Textarea Input Field */}
          <textarea
            id="composer_textarea"
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? 'Listening to speech...'
                : 'Ask anything across Study, Shopping, Food, Media, Files...'
            }
            className="flex-1 max-h-44 min-h-[44px] py-3 px-2 text-sm bg-transparent outline-hidden resize-none leading-relaxed"
            style={{ color: themeConfig.textBase }}
          />

          {/* Voice Trigger Button */}
          <button
            type="button"
            id="composer_voice_trigger_btn"
            onClick={handleToggleVoice}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-xs'
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={isRecording ? 'Stop Voice Recording' : 'Voice trigger dictation'}
            aria-label={isRecording ? 'Stop Voice Recording' : 'Voice trigger dictation'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send or Stop Generation Button */}
          {isStreaming ? (
            <button
              type="button"
              id="composer_stop_btn"
              onClick={handleSend}
              className="min-h-[44px] px-4 py-2 rounded-xl text-white font-bold bg-red-600 hover:bg-red-700 transition-transform active:scale-95 shadow-xs flex items-center gap-1.5"
              title="Stop generation"
            >
              <Square className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline text-xs">Stop</span>
            </button>
          ) : (
            <button
              type="button"
              id="composer_send_btn"
              onClick={handleSend}
              disabled={!inputText.trim() && attachments.length === 0}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-white font-bold transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 ${
                !inputText.trim() && attachments.length === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : 'opacity-100 cursor-pointer hover:opacity-90'
              }`}
              style={{
                backgroundColor: themeConfig.accentColor,
              }}
              title="Send message"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
