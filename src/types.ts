/**
 * MiTruCo — Mini Truly Companion
 * Core Shared Data Types & Contracts
 * Origin: «Made with love and care from Bihar — GR_»
 */

export type PlatformTarget = 'web' | 'android' | 'ios';

export type ActiveTab = 'home' | 'learn' | 'activity' | 'connect' | 'downloads' | 'settings';

export type ProviderStatusType = 'AVAILABLE' | 'LIMITED' | 'AUTH_REQUIRED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';

export interface ProviderHealth {
  id: string;
  name: string;
  category: 'ai' | 'search' | 'commerce' | 'media' | 'local' | 'push' | 'crypto';
  status: ProviderStatusType;
  description: string;
  latencyMs?: number;
  lastChecked: string;
  rateLimitRemaining?: number;
  requiresKey?: boolean;
}

export interface Citation {
  title: string;
  uri: string;
  snippet?: string;
  sourceName?: string;
  retrievalTimestamp?: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductCardData {
  id: string;
  productName: string;
  brand?: string;
  currentPrice: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewsCount?: number;
  imageUrl?: string;
  specifications: ProductSpecification[];
  availability: 'in_stock' | 'out_of_stock' | 'limited' | 'unverified';
  merchantName: string;
  verifiedTimestamp: string;
  externalLink: string;
}

export interface MediaCardData {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'anime' | 'kdrama' | 'music' | 'podcast' | 'documentary';
  posterUrl?: string;
  releaseYear?: number;
  genre: string[];
  synopsis: string;
  creators?: string[];
  cast?: string[];
  runtime?: string;
  language?: string;
  ratingScore?: string;
  streamingProviders: {
    name: string;
    type: 'subscription' | 'free' | 'rent' | 'buy';
    directUrl?: string;
  }[];
  checkedTimestamp: string;
  officialLink?: string;
  trailerUrl?: string;
}

export interface LocalPlaceData {
  id: string;
  name: string;
  category: string;
  address: string;
  distanceKm?: number;
  isOpen?: boolean;
  openingHours?: string;
  rating?: number;
  phone?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  mapsUrl?: string;
  priceLevel?: string;
  verifiedTimestamp: string;
}

export interface StudyBlockData {
  subject: string;
  topic: string;
  complexity: 'Simple' | 'Detailed' | 'Exam-focused' | 'Advanced';
  workedSteps?: { stepNumber: number; title: string; explanation: string; mathFormula?: string }[];
  formulas?: { name: string; latex: string; explanation: string }[];
  practiceQuestions?: { question: string; hint?: string; answer?: string }[];
}

export type ExamCategory =
  | 'civil_services'
  | 'mbbs_neet'
  | 'law_clat'
  | 'architecture_nata'
  | 'pre_board'
  | 'engineering_jee'
  | 'general_competitive';

export interface ExamTriageCardData {
  id: string;
  examCategory: ExamCategory;
  title: string;
  targetExam: string;
  stressLevel: 'high' | 'critical' | 'moderate';
  triage80_20: {
    mustDo: string[];
    canSkipIfUnderPressure: string[];
  };
  rapidFormulasOrKeywords: string[];
  pitfallsToAvoid: string[];
  timeAttackStrategy: string;
  reassuranceSnippet: string;
  verifiedSyllabusWeightage?: string;
}

export interface PressureReliefCardData {
  id: string;
  situation: string;
  breathingGuidance: {
    inhaleSeconds: number;
    holdSeconds: number;
    exhaleSeconds: number;
    restSeconds: number;
  };
  mindsetShift: string;
  immediateAction: string;
  encouragement: string;
  quickChecklist: string[];
}

export interface AttachmentItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  base64Data?: string;
  objectUrl?: string;
  encryptedHash?: string;
  uploadedAt: string;
}

export interface ToolExecutionState {
  toolName: string;
  status: 'running' | 'completed' | 'failed';
  statusMessage: string;
  timestamp: string;
}

export interface MessageBlock {
  type: 'text' | 'markdown' | 'code' | 'formula' | 'table' | 'product' | 'media' | 'local' | 'study' | 'citations' | 'actionRow' | 'error' | 'examTriage' | 'pressureRelief';
  content?: string;
  language?: string; // for code blocks
  productData?: ProductCardData;
  mediaData?: MediaCardData;
  localData?: LocalPlaceData;
  studyData?: StudyBlockData;
  examTriageData?: ExamTriageCardData;
  pressureReliefData?: PressureReliefCardData;
  citations?: Citation[];
  actions?: { id: string; label: string; actionType: string; payload?: string }[];
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  blocks: MessageBlock[];
  attachments?: AttachmentItem[];
  toolStates?: ToolExecutionState[];
  isStreaming?: boolean;
  isEncrypted?: boolean;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  lastMessageSnippet?: string;
  topicCategory?: 'general' | 'study' | 'commerce' | 'food' | 'media' | 'search';
  messageCount: number;
  isPinned?: boolean;
  isEncrypted?: boolean;
}

export interface ActivityRecord {
  id: string;
  type: 'conversation' | 'search' | 'study' | 'saved_item' | 'commerce';
  title: string;
  subtitle: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
  conversationId?: string;
  bookmarked?: boolean;
}

export interface DownloadItem {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  source: string;
  sha256Hash: string;
  encrypted: boolean;
  blobUrl?: string;
  contentSnippet?: string;
  fullContent?: string;
  fileType?: 'pdf' | 'ppt' | 'notes' | 'doc' | 'code' | 'other';
  slides?: Array<{ title: string; bullets: string[]; takeaway?: string; codeSnippet?: string }>;
}

export interface DocumentViewData {
  title: string;
  filename: string;
  fileType: 'pdf' | 'ppt' | 'notes' | 'doc' | 'code';
  mimeType: string;
  content: string;
  slides?: Array<{ title: string; bullets: string[]; takeaway?: string; codeSnippet?: string }>;
  source?: string;
  sha256Hash?: string;
}

export interface UserMemoryItem {
  id: string;
  category: 'goal' | 'exam' | 'personality' | 'interest' | 'learning_language' | 'preference';
  fact: string;
  detectedAt: string;
  confidence: number;
}

export interface LanguageVocabCard {
  id: string;
  wordOrPhrase: string;
  meaning: string;
  phoneticOrTransliteration: string;
  exampleSentence: string;
  exampleTranslation: string;
  audioText: string;
  audioLangCode: string;
}

export interface LanguageQuizQuestion {
  id: string;
  prompt: string;
  targetLang: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  details: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}

export interface PeerUser {
  id: string;
  displayName: string;
  cohort: 'minor' | 'adult';
  avatarSeed: string;
  publicKeyFingerprint: string;
  lastActive: string;
  isBlocked?: boolean;
}

export interface ConnectPeerMessage {
  id: string;
  peerId: string;
  senderId: string;
  encryptedPayload: string;
  iv: string;
  authTag: string;
  decryptedContent?: string;
  timestamp: string;
  deliveryStatus: 'sent' | 'delivered' | 'read';
  fingerprintVerified: boolean;
}

export type ThemePreset = 'royal-ivory-coral' | 'mystic-plum-slate' | 'sage-meadow' | 'desert-amber';

export interface ThemeConfig {
  preset: ThemePreset;
  isDark: boolean;
  accentColor: string;
  secondaryAccent: string;
  bgBase: string;
  surfaceBase: string;
  textBase: string;
  textMuted: string;
  borderBase: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isEnglish: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  isGuest: boolean;
  ageCohort: 'adult' | 'minor';
  selectedLanguages: string[]; // max 5 (English + up to 4 Indian languages)
  themePreset: ThemePreset;
  isDarkMode: boolean;
  onboardingCompleted: boolean;
  e2ePublicKey?: string;
  e2eKeyFingerprint?: string;
  biometricLockEnabled?: boolean;
  biometricPasscode?: string;
  memories?: UserMemoryItem[];
}
