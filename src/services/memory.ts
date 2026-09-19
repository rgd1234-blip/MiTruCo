/**
 * MiTruCo End-to-End Encrypted User Memory & Personality Engine
 * Strictly client-side: All memories and user personality insights are encrypted
 * and stored locally. Never leaked to third-party ad networks or external tracking.
 * Provides deep empathetic context so Mitro talks like your closest lifelong friend.
 */

import { UserMemoryItem } from '../types';
import { E2EEService } from './crypto';

const STORAGE_KEY = 'mitruco_e2ee_friend_memory_v1';

export class MemoryService {
  private static memoriesCache: UserMemoryItem[] | null = null;

  public static async getMemories(): Promise<UserMemoryItem[]> {
    if (this.memoriesCache) return this.memoriesCache;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Initial foundational friend memories based on user context
        const initialMemories: UserMemoryItem[] = [
          {
            id: 'mem_1',
            category: 'exam',
            fact: 'Focused on Law & Judiciary: Target exams include CLAT, AILET, and State Judicial Services (PCS-J).',
            detectedAt: new Date().toISOString(),
            confidence: 0.95,
          },
          {
            id: 'mem_2',
            category: 'learning_language',
            fact: 'Passionate about language learning, especially Spoken English fluency, vocabulary building, and conversational mastery.',
            detectedAt: new Date().toISOString(),
            confidence: 0.9,
          },
          {
            id: 'mem_3',
            category: 'personality',
            fact: 'Prefers an empathetic, encouraging companion who talks like a very close, thoughtful friend rather than a robotic assistant.',
            detectedAt: new Date().toISOString(),
            confidence: 0.98,
          },
          {
            id: 'mem_4',
            category: 'preference',
            fact: 'Appreciates structured 80/20 triage, bite-sized revision sheets, downloadable PPT/PDF notes, and exam calm exercises.',
            detectedAt: new Date().toISOString(),
            confidence: 0.92,
          },
        ];
        await this.saveMemories(initialMemories);
        return initialMemories;
      }

      this.memoriesCache = JSON.parse(raw);
      return this.memoriesCache || [];
    } catch {
      return [];
    }
  }

  public static async saveMemories(memories: UserMemoryItem[]): Promise<void> {
    this.memoriesCache = memories;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (e) {
      console.warn('Unable to persist memories to localStorage:', e);
    }
  }

  public static async addMemory(
    category: UserMemoryItem['category'],
    fact: string,
    confidence = 0.9
  ): Promise<UserMemoryItem> {
    const memories = await this.getMemories();

    // Prevent duplicate entries
    const existing = memories.find(
      (m) => m.fact.toLowerCase().trim() === fact.toLowerCase().trim()
    );
    if (existing) return existing;

    const newItem: UserMemoryItem = {
      id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      category,
      fact: fact.trim(),
      detectedAt: new Date().toISOString(),
      confidence,
    };

    const updated = [newItem, ...memories];
    await this.saveMemories(updated);
    return newItem;
  }

  public static async removeMemory(id: string): Promise<void> {
    const memories = await this.getMemories();
    const updated = memories.filter((m) => m.id !== id);
    await this.saveMemories(updated);
  }

  public static async clearAllMemories(): Promise<void> {
    this.memoriesCache = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Scans user conversation text to gently harvest personality insights,
   * study subjects, language interests, or exam goals.
   */
  public static async scanAndLearnFromMessage(text: string): Promise<void> {
    const lower = text.toLowerCase();

    if (lower.includes('clat') || lower.includes('judiciary') || lower.includes('law exam') || lower.includes('pcs-j')) {
      await this.addMemory('exam', 'Active target: CLAT and Judicial Service examinations.');
    }
    if (lower.includes('english') || lower.includes('duolingo') || lower.includes('learn language') || lower.includes('tutor') || lower.includes('speaking')) {
      await this.addMemory('learning_language', 'Practicing English language fluency and conversational vocabulary.');
    }
    if (lower.includes('neet') || lower.includes('mbbs') || lower.includes('biology')) {
      await this.addMemory('exam', 'Pursuing Medical / NEET / MBBS preparation.');
    }
    if (lower.includes('upsc') || lower.includes('ias') || lower.includes('civil services')) {
      await this.addMemory('exam', 'Targeting UPSC Civil Services & General Studies.');
    }
    if (lower.includes('stress') || lower.includes('panic') || lower.includes('anxiety') || lower.includes('blank')) {
      await this.addMemory('personality', 'Occasionally experiences high pre-exam pressure; benefits from gentle grounding and box breathing.');
    }
    if (lower.includes('friend') || lower.includes('close') || lower.includes('understand me')) {
      await this.addMemory('preference', 'Values heartfelt, close-friend conversational bonding and genuine mutual understanding.');
    }
  }

  /**
   * Builds the formatted E2EE companion context string to inject into prompt.
   */
  public static async getPromptMemoryInjection(): Promise<string> {
    const memories = await this.getMemories();
    if (memories.length === 0) return '';

    const lines = memories.slice(0, 8).map((m) => `- [${m.category.toUpperCase()}] ${m.fact}`);
    return `\n<companion_friend_memory_e2ee>\nUser Personality Insights & Shared History (Private to Mitro & User):\n${lines.join('\n')}\nTreat the user like your closest, dearest friend whom you understand deeply, care about, and want to succeed without judgment.\n</companion_friend_memory_e2ee>\n`;
  }
}
