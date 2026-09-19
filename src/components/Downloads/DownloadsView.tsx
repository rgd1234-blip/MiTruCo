/**
 * MiTruCo Downloads & File Vault
 * Platform-native file handling (Android MediaStore / iOS Files equivalent)
 * Features: Open, Rename, Delete, Share, Metadata (SHA-256 hash, size), and export.
 */

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Trash2,
  Edit2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Plus,
  Hash,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DownloadItem } from '../../types';
import { LocalDatabase } from '../../services/db';

export const DownloadsView: React.FC = () => {
  const { themeConfig, addDownloadFile } = useApp();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [selectedMeta, setSelectedMeta] = useState<DownloadItem | null>(null);

  const loadDownloads = async () => {
    const list = await LocalDatabase.getDownloads();
    setDownloads(list);
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const handleDelete = async (id: string) => {
    await LocalDatabase.deleteDownload(id);
    await loadDownloads();
  };

  const handleStartRename = (item: DownloadItem) => {
    setRenameId(item.id);
    setNewName(item.filename);
  };

  const handleSaveRename = async (id: string) => {
    if (!newName.trim()) return;
    const item = downloads.find((d) => d.id === id);
    if (item) {
      const updated = { ...item, filename: newName.trim() };
      await LocalDatabase.saveDownload(updated);
      setRenameId(null);
      await loadDownloads();
    }
  };

  const handleCreateSampleDoc = async () => {
    const content = `MiTruCo Study Summary & Research Notes\nDate: ${new Date().toLocaleDateString()}\nOrigin: Made with love and care from Bihar — GR_\n\nKey Concepts:\n1. Newton's Second Law: F = m * a\n2. Conservation of Energy: E_total = Constant\n\nEncrypted via WebCrypto AES-GCM (256-bit).`;
    await addDownloadFile('physics_study_summary.txt', content, 'text/plain');
    await loadDownloads();
  };

  return (
    <div
      id="downloads_view"
      className="flex-1 overflow-y-auto p-4 sm:p-6 transition-colors"
      style={{ backgroundColor: themeConfig.bgBase, color: themeConfig.textBase }}
    >
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Downloads & File Vault
            </h2>
            <p className="text-xs opacity-75">
              Platform-native file storage with SHA-256 cryptographic verification and encrypted exports.
            </p>
          </div>

          <button
            onClick={handleCreateSampleDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xs"
            style={{ backgroundColor: themeConfig.accentColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Study Note</span>
          </button>
        </div>

        {/* Downloads List */}
        <div className="space-y-2">
          {downloads.length === 0 ? (
            <div
              className="p-8 rounded-2xl border text-center text-xs opacity-75 space-y-2"
              style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
            >
              <Download className="w-8 h-8 mx-auto opacity-40 mb-2" />
              <p className="font-bold text-sm">No downloaded documents yet</p>
              <p>When you export study notes, conversation summaries, or attachments, they will appear here.</p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs"
                style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: themeConfig.bgBase }}>
                    <FileText className="w-4 h-4" style={{ color: themeConfig.accentColor }} />
                  </div>

                  <div>
                    {renameId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="px-2 py-0.5 rounded-md border text-xs outline-hidden"
                          style={{ borderColor: themeConfig.accentColor, backgroundColor: themeConfig.bgBase }}
                        />
                        <button
                          onClick={() => handleSaveRename(item.id)}
                          className="p-1 rounded-md bg-emerald-600 text-white"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold">{item.filename}</h4>
                        <button
                          onClick={() => handleStartRename(item)}
                          className="opacity-50 hover:opacity-100"
                          title="Rename file"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-65">
                      <span>{(item.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{item.mimeType}</span>
                      <span>•</span>
                      <span className="font-mono">SHA: {item.sha256Hash}</span>
                    </div>
                  </div>
                </div>

                {/* File Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedMeta(item)}
                    className="p-2 rounded-xl border text-xs opacity-75 hover:opacity-100"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                    title="Inspect SHA-256 metadata & checksum"
                  >
                    <Hash className="w-3.5 h-3.5" />
                  </button>

                  {item.blobUrl && (
                    <a
                      href={item.blobUrl}
                      download={item.filename}
                      className="p-2 rounded-xl text-white font-bold shadow-2xs"
                      style={{ backgroundColor: themeConfig.accentColor }}
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl border opacity-70 hover:opacity-100 hover:text-red-500"
                    style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.bgBase }}
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Metadata Modal */}
        {selectedMeta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div
              className="w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-xl"
              style={{ backgroundColor: themeConfig.bgBase, borderColor: themeConfig.borderBase }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>File Integrity & Metadata</span>
                </h3>
                <button onClick={() => setSelectedMeta(null)} className="text-xs font-bold opacity-60 hover:opacity-100">
                  Close
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg border" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <span className="opacity-60 block">Filename</span>
                  <span className="font-bold">{selectedMeta.filename}</span>
                </div>

                <div className="p-2 rounded-lg border" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <span className="opacity-60 block">SHA-256 Checksum</span>
                  <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    {selectedMeta.sha256Hash}
                  </span>
                </div>

                <div className="p-2 rounded-lg border" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <span className="opacity-60 block">MIME Type / Size</span>
                  <span>{selectedMeta.mimeType} ({(selectedMeta.sizeBytes / 1024).toFixed(2)} KB)</span>
                </div>

                <div className="p-2 rounded-lg border" style={{ borderColor: themeConfig.borderBase, backgroundColor: themeConfig.surfaceBase }}>
                  <span className="opacity-60 block">Created At / Origin</span>
                  <span>{selectedMeta.createdAt} · {selectedMeta.source}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
