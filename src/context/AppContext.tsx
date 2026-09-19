/**
 * MiTruCo App Context
 * Central state orchestration: unified conversational thread, offline synchronization,
 * E2EE crypto keys, theme engine, and multilingual preferences.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ActiveTab,
  PlatformTarget,
  Conversation,
  Message,
  UserProfile,
  ThemeConfig,
  ThemePreset,
  ProviderHealth,
  ActivityRecord,
  DownloadItem,
  AttachmentItem,
  Citation,
  ProductCardData,
  MediaCardData,
  LocalPlaceData,
  StudyBlockData,
  ExamTriageCardData,
  PressureReliefCardData,
  ToolExecutionState,
  DocumentViewData,
} from '../types';
import { THEME_PRESETS } from '../data/themes';
import { LocalDatabase } from '../services/db';
import { SyncService, SyncState } from '../services/sync';
import { E2EEService } from '../services/crypto';
import { ApiService } from '../services/api';
import { MemoryService } from '../services/memory';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  platformPreview: PlatformTarget;
  setPlatformPreview: (platform: PlatformTarget) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  themeConfig: ThemeConfig;
  setThemePreset: (preset: ThemePreset, isDark?: boolean) => void;
  toggleDarkMode: () => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isStreaming: boolean;
  activeToolState: ToolExecutionState | null;
  syncState: SyncState;
  providers: ProviderHealth[];
  sendMessage: (text: string, attachments?: AttachmentItem[]) => Promise<void>;
  stopGeneration: () => void;
  startNewConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  saveBookmark: (title: string, subtitle: string, conversationId?: string) => Promise<void>;
  addDownloadFile: (
    filename: string,
    content: string,
    mimeType?: string,
    fileType?: 'pdf' | 'ppt' | 'notes' | 'doc' | 'code' | 'other',
    slides?: Array<{ title: string; bullets: string[]; takeaway?: string; codeSnippet?: string }>,
    autoDownloadToDevice?: boolean
  ) => Promise<void>;
  activeDocument: DocumentViewData | null;
  openDocument: (doc: DocumentViewData) => void;
  closeDocument: () => void;
  refreshProviders: () => Promise<void>;
  manualSync: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'user_' + Math.random().toString(36).substring(2, 9),
  displayName: 'Divya Gupta',
  isGuest: false,
  ageCohort: 'adult',
  selectedLanguages: ['en', 'hi', 'mai'], // Universal English + Hindi + Maithili (Bihar)
  themePreset: 'royal-ivory-coral',
  isDarkMode: false,
  onboardingCompleted: false,
  e2ePublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA',
  e2eKeyFingerprint: '4F8A-92C1-3E0B-8812',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [platformPreview, setPlatformPreview] = useState<PlatformTarget>('web');

  const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('mitruco_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const preset = userProfile.themePreset || 'royal-ivory-coral';
    const isDark = userProfile.isDarkMode || false;
    return THEME_PRESETS[preset][isDark ? 'dark' : 'light'];
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [activeToolState, setActiveToolState] = useState<ToolExecutionState | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const [syncState, setSyncState] = useState<SyncState>(SyncService.getState());
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentViewData | null>(null);

  const openDocument = useCallback((doc: DocumentViewData) => {
    setActiveDocument(doc);
  }, []);

  const closeDocument = useCallback(() => {
    setActiveDocument(null);
  }, []);

  // Update theme when preset or dark mode changes
  const updateTheme = useCallback((preset: ThemePreset, isDark: boolean) => {
    const newConfig = THEME_PRESETS[preset][isDark ? 'dark' : 'light'];
    setThemeConfig(newConfig);
    setUserProfileState((prev) => {
      const updated = { ...prev, themePreset: preset, isDarkMode: isDark };
      localStorage.setItem('mitruco_profile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setThemePreset = useCallback((preset: ThemePreset, isDark?: boolean) => {
    updateTheme(preset, isDark !== undefined ? isDark : userProfile.isDarkMode);
  }, [updateTheme, userProfile.isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    updateTheme(userProfile.themePreset, !userProfile.isDarkMode);
  }, [updateTheme, userProfile.themePreset, userProfile.isDarkMode]);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfileState((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('mitruco_profile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Initialize DB, Sync, and Crypto
  useEffect(() => {
    SyncService.initialize();
    const unsubSync = SyncService.subscribe(setSyncState);

    // Initialize E2EE Vault
    E2EEService.initializeVault().then((fp) => {
      updateUserProfile({ e2eKeyFingerprint: fp });
    });

    // Load Providers
    ApiService.getProvidersStatus().then(setProviders);

    // Load initial conversations
    LocalDatabase.getConversations().then(async (list) => {
      if (list.length > 0) {
        setConversations(list);
        setCurrentConversationId(list[0].id);
        const msgs = await LocalDatabase.getMessagesByConversation(list[0].id);
        setMessages(msgs);
      } else {
        // Create initial welcoming companion conversation
        const initialConv: Conversation = {
          id: 'conv_welcome_' + Date.now(),
          title: 'Welcome to MiTruCo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 1,
          topicCategory: 'general',
          lastMessageSnippet: 'Namaste! I am your Mini Truly Companion, made with love and care from Bihar.',
        };
        await LocalDatabase.saveConversation(initialConv);

        const welcomeMessage: Message = {
          id: 'msg_welcome_' + Date.now(),
          conversationId: initialConv.id,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          blocks: [
            {
              type: 'text',
              content: `**Namaste & Welcome to MiTruCo (Mini Truly Companion)** 🌸\n\n*«Made with love and care from Bihar — GR_»*\n\nMiTruCo is specially designed for students, candidates, and aspirants under **deep pressure** preparing for competitive exams, board exams, and pre-board situations. Whether you are facing immense anxiety, massive backlogs, or tough questions, you have an empathetic, sharp companion here to help you tackle:\n\n- 🏛️ **Civil Services (UPSC CSE / State PSCs):** GS 1-4 answer writing structure, ethics dilemmas, and current affairs.\n- 🩺 **Medical / MBBS (NEET UG/PG):** High-yield NCERT Biology mnemonics, clinical reasoning, and organic mechanisms.\n- ⚖️ **Law (CLAT / Judiciary):** Principle-fact deductive logic, Constitutional articles, and landmark judgements.\n- 📐 **Architecture (NATA / JEE B.Arch):** 3D perception, visual aesthetics, building materials, and elevation analysis.\n- 📝 **Pre-Boards & Board Exams (Class 10/12):** Step-marking strategies, 3-hour time management, and formula revision.\n- 🧘 **Deep Pressure & Anxiety Reset:** 4-4-4-4 tactical breathing, 80/20 triage for backlogs, and panic recovery.\n\nYou can also seamlessly transition into shopping verification, media radar, food discovery, or native file exports in the same continuous canvas.`,
            },
            {
              type: 'actionRow',
              actions: [
                { id: 'act_panic_reset', label: "🧘 I'm Panicking & Need Focus", actionType: 'prompt', payload: "I am feeling deep pressure and panic about my upcoming exam. Please help me calm down and give me a 3-step triage plan." },
                { id: 'act_civil_services', label: "🏛️ UPSC Mains Answer Structure", actionType: 'prompt', payload: "How to structure a 15-mark GS Mains answer under 7 minutes for UPSC Civil Services?" },
                { id: 'act_neet_mbbs', label: "🩺 NEET/MBBS High-Yield Triage", actionType: 'prompt', payload: "I have 48 hours for NEET Biology. Give me an 80/20 high-yield triage of must-master units and mnemonics." },
                { id: 'act_law_clat', label: "⚖️ CLAT Legal Reasoning", actionType: 'prompt', payload: "Break down the Principle-Fact deductive method for CLAT legal reasoning with a high-stakes example." },
                { id: 'act_architecture', label: "📐 NATA 3D Perception Breakdown", actionType: 'prompt', payload: "Explain visual perception, 2D/3D elevations, and architectural design principles for NATA & JEE Paper 2." },
                { id: 'act_preboard', label: "📝 Pre-Board Step-Marking Strategy", actionType: 'prompt', payload: "How do I maximize step marks in Class 12 Pre-Boards even if I don't know the final answer?" },
              ],
            },
          ],
        };
        await LocalDatabase.saveMessage(welcomeMessage);

        setConversations([initialConv]);
        setCurrentConversationId(initialConv.id);
        setMessages([welcomeMessage]);
      }
    });

    return () => {
      unsubSync();
    };
  }, [updateUserProfile]);

  const selectConversation = useCallback(async (id: string) => {
    setCurrentConversationId(id);
    const msgs = await LocalDatabase.getMessagesByConversation(id);
    setMessages(msgs);
    setActiveTab('home');
  }, []);

  const startNewConversation = useCallback(async () => {
    const newConv: Conversation = {
      id: 'conv_' + Date.now(),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      topicCategory: 'general',
      lastMessageSnippet: 'Conversation started',
    };
    await LocalDatabase.saveConversation(newConv);
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
    setActiveTab('home');
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        selectConversation(remaining[0].id);
      } else {
        startNewConversation();
      }
    }
  }, [conversations, currentConversationId, selectConversation, startNewConversation]);

  // Stop Generation
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsStreaming(false);
    setActiveToolState(null);
  }, [abortController]);

  // Send Message with multi-turn streaming and rich blocks
  const sendMessage = useCallback(async (text: string, attachments?: AttachmentItem[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    let convId = currentConversationId;
    if (!convId) {
      const newConv: Conversation = {
        id: 'conv_' + Date.now(),
        title: text.slice(0, 32) + (text.length > 32 ? '...' : ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        lastMessageSnippet: text.slice(0, 60),
      };
      await LocalDatabase.saveConversation(newConv);
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversationId(newConv.id);
      convId = newConv.id;
    }

    const userMsg: Message = {
      id: 'msg_user_' + Date.now(),
      conversationId: convId,
      sender: 'user',
      timestamp: new Date().toISOString(),
      blocks: [{ type: 'text', content: text }],
      attachments: attachments || [],
    };

    setMessages((prev) => [...prev, userMsg]);
    await LocalDatabase.saveMessage(userMsg);

    // Record in activity
    await LocalDatabase.addActivity({
      id: 'act_' + Date.now(),
      type: 'conversation',
      title: text.slice(0, 40),
      subtitle: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      conversationId: convId,
    });

    // Create placeholder for assistant response
    const assistantMsgId = 'msg_asst_' + Date.now();
    const assistantMsg: Message = {
      id: assistantMsgId,
      conversationId: convId,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      blocks: [{ type: 'text', content: '' }],
      isStreaming: true,
      toolStates: [],
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    setAbortController(controller);

    let streamText = '';
    const collectedCitations: Citation[] = [];
    let productCard: ProductCardData | undefined;
    let mediaCard: MediaCardData | undefined;
    let localCard: LocalPlaceData | undefined;
    let studyCard: StudyBlockData | undefined;
    let examTriageCard: ExamTriageCardData | undefined;
    let pressureReliefCard: PressureReliefCardData | undefined;

    // Build conversation history for continuous context
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.blocks.map((b) => b.content || '').join('\n'),
    }));

    try {
      // Learn from user message and fetch E2EE memory context
      await MemoryService.scanAndLearnFromMessage(text);
      const memoryContext = await MemoryService.getPromptMemoryInjection();

      await ApiService.streamChat(
        text,
        historyPayload,
        userProfile.selectedLanguages[0] || 'en',
        {
          onChunk: (chunk) => {
            streamText += chunk;
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantMsgId) return m;
                return {
                  ...m,
                  blocks: [
                    { type: 'markdown', content: streamText },
                    ...(productCard ? [{ type: 'product' as const, productData: productCard }] : []),
                    ...(mediaCard ? [{ type: 'media' as const, mediaData: mediaCard }] : []),
                    ...(localCard ? [{ type: 'local' as const, localData: localCard }] : []),
                    ...(studyCard ? [{ type: 'study' as const, studyData: studyCard }] : []),
                    ...(examTriageCard ? [{ type: 'examTriage' as const, examTriageData: examTriageCard }] : []),
                    ...(pressureReliefCard ? [{ type: 'pressureRelief' as const, pressureReliefData: pressureReliefCard }] : []),
                    ...(collectedCitations.length > 0 ? [{ type: 'citations' as const, citations: collectedCitations }] : []),
                  ],
                };
              })
            );
          },
          onToolState: (state) => {
            setActiveToolState(state);
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantMsgId) return m;
                const existing = m.toolStates || [];
                return {
                  ...m,
                  toolStates: [...existing.filter((t) => t.toolName !== state.toolName), state],
                };
              })
            );
          },
          onCitations: (cits) => {
            collectedCitations.push(...cits);
          },
          onProductCard: (card) => {
            productCard = card;
          },
          onMediaCard: (card) => {
            mediaCard = card;
          },
          onLocalCard: (card) => {
            localCard = card;
          },
          onStudyCard: (card) => {
            studyCard = card;
          },
          onExamTriageCard: (card) => {
            examTriageCard = card;
          },
          onPressureReliefCard: (card) => {
            pressureReliefCard = card;
          },
          onError: (errMsg) => {
            setIsStreaming(false);
            setActiveToolState(null);
            setAbortController(null);
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantMsgId) return m;
                return {
                  ...m,
                  isStreaming: false,
                  error: errMsg,
                  blocks: [
                    ...m.blocks,
                    { type: 'error', content: errMsg },
                  ],
                };
              })
            );
          },
          onComplete: async () => {
            setIsStreaming(false);
            setActiveToolState(null);
            setAbortController(null);

            // Finalize message object and save
            const finalBlocks = [
              { type: 'markdown' as const, content: streamText },
              ...(productCard ? [{ type: 'product' as const, productData: productCard }] : []),
              ...(mediaCard ? [{ type: 'media' as const, mediaData: mediaCard }] : []),
              ...(localCard ? [{ type: 'local' as const, localData: localCard }] : []),
              ...(studyCard ? [{ type: 'study' as const, studyData: studyCard }] : []),
              ...(examTriageCard ? [{ type: 'examTriage' as const, examTriageData: examTriageCard }] : []),
              ...(pressureReliefCard ? [{ type: 'pressureRelief' as const, pressureReliefData: pressureReliefCard }] : []),
              ...(collectedCitations.length > 0 ? [{ type: 'citations' as const, citations: collectedCitations }] : []),
            ];

            const finalMsg: Message = {
              id: assistantMsgId,
              conversationId: convId!,
              sender: 'assistant',
              timestamp: new Date().toISOString(),
              blocks: finalBlocks,
              isStreaming: false,
            };

            setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? finalMsg : m)));
            await LocalDatabase.saveMessage(finalMsg);

            // Update conversation title and count if needed
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== convId) return c;
                return {
                  ...c,
                  title: c.title === 'New Conversation' ? text.slice(0, 30) : c.title,
                  updatedAt: new Date().toISOString(),
                  messageCount: c.messageCount + 2,
                  lastMessageSnippet: streamText.slice(0, 60),
                };
              })
            );
          },
        },
        controller.signal
      );
    } catch (err: any) {
      console.error('Send message error:', err);
      setIsStreaming(false);
      setActiveToolState(null);
    }
  }, [currentConversationId, messages, userProfile.selectedLanguages]);

  const saveBookmark = useCallback(async (title: string, subtitle: string, convId?: string) => {
    const act: ActivityRecord = {
      id: 'bm_' + Date.now(),
      type: 'saved_item',
      title,
      subtitle,
      timestamp: new Date().toISOString(),
      conversationId: convId || currentConversationId || undefined,
      bookmarked: true,
    };
    await LocalDatabase.addActivity(act);
  }, [currentConversationId]);

  const addDownloadFile = useCallback(async (filename: string, content: string, mimeType: string) => {
    const hash = await E2EEService.sha256(content);
    const blob = new Blob([content], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);

    const dlItem: DownloadItem = {
      id: 'dl_' + Date.now(),
      filename,
      mimeType,
      sizeBytes: blob.size,
      createdAt: new Date().toISOString(),
      source: 'MiTruCo Companion Export',
      sha256Hash: hash.slice(0, 16).toUpperCase(),
      encrypted: true,
      blobUrl,
      contentSnippet: content.slice(0, 140),
    };

    await LocalDatabase.saveDownload(dlItem);
    await SyncService.updatePendingCount();
  }, []);

  const refreshProviders = useCallback(async () => {
    const list = await ApiService.getProvidersStatus();
    setProviders(list);
  }, []);

  const manualSync = useCallback(async () => {
    await SyncService.triggerSync();
  }, []);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        platformPreview,
        setPlatformPreview,
        userProfile,
        updateUserProfile,
        themeConfig,
        setThemePreset,
        toggleDarkMode,
        conversations,
        currentConversationId,
        messages,
        isStreaming,
        activeToolState,
        syncState,
        providers,
        sendMessage,
        stopGeneration,
        startNewConversation,
        selectConversation,
        deleteConversation,
        saveBookmark,
        addDownloadFile,
        refreshProviders,
        manualSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
