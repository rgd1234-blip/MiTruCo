/**
 * MiTruCo Client API Service
 * Handles SSE streaming with AbortController, provider health, Connect messaging, and sync.
 */

import {
  ProviderHealth,
  Citation,
  ProductCardData,
  MediaCardData,
  LocalPlaceData,
  StudyBlockData,
  ExamTriageCardData,
  PressureReliefCardData,
  ToolExecutionState,
} from '../types';

export interface StreamEventCallbacks {
  onChunk: (text: string) => void;
  onToolState?: (toolState: ToolExecutionState) => void;
  onCitations?: (citations: Citation[]) => void;
  onProductCard?: (card: ProductCardData) => void;
  onMediaCard?: (card: MediaCardData) => void;
  onLocalCard?: (card: LocalPlaceData) => void;
  onStudyCard?: (card: StudyBlockData) => void;
  onExamTriageCard?: (card: ExamTriageCardData) => void;
  onPressureReliefCard?: (card: PressureReliefCardData) => void;
  onError?: (errorMessage: string) => void;
  onComplete?: () => void;
}

export class ApiService {
  /**
   * Stream a prompt response via Server-Sent Events with cancellation
   */
  public static streamChat(
    prompt: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[],
    language: string,
    callbacks: StreamEventCallbacks,
    abortSignal?: AbortSignal,
    memoryContext?: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            conversationHistory,
            language,
            memoryContext,
          }),
          signal: abortSignal,
        });

        if (!response.ok) {
          const errText = await response.text();
          callbacks.onError?.(errText || `Server responded with status ${response.status}`);
          reject(new Error(errText));
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported on this device');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEvent = 'message';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.substring(7).trim();
            } else if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.substring(6).trim();
              try {
                const parsed = JSON.parse(dataStr);
                switch (currentEvent) {
                  case 'chunk':
                    callbacks.onChunk(parsed.text);
                    break;
                  case 'tool_state':
                    callbacks.onToolState?.(parsed);
                    break;
                  case 'citations':
                    callbacks.onCitations?.(parsed.citations);
                    break;
                  case 'product_card':
                    callbacks.onProductCard?.(parsed);
                    break;
                  case 'media_card':
                    callbacks.onMediaCard?.(parsed);
                    break;
                  case 'local_card':
                    callbacks.onLocalCard?.(parsed);
                    break;
                  case 'study_card':
                    callbacks.onStudyCard?.(parsed);
                    break;
                  case 'exam_triage_card':
                    callbacks.onExamTriageCard?.(parsed);
                    break;
                  case 'pressure_relief_card':
                    callbacks.onPressureReliefCard?.(parsed);
                    break;
                  case 'error':
                    callbacks.onError?.(parsed.message);
                    break;
                  case 'complete':
                    callbacks.onComplete?.();
                    break;
                }
              } catch (e) {
                console.warn('Could not parse SSE payload:', dataStr);
              }
            }
          }
        }

        callbacks.onComplete?.();
        resolve();
      } catch (err: any) {
        if (err.name === 'AbortError') {
          callbacks.onToolState?.({
            toolName: 'generation_engine',
            status: 'completed',
            statusMessage: 'Response cancelled by user.',
            timestamp: new Date().toISOString(),
          });
          resolve();
        } else {
          callbacks.onError?.(err.message || 'Connection lost');
          reject(err);
        }
      }
    });
  }

  /**
   * Fetch real-time provider statuses
   */
  public static async getProvidersStatus(): Promise<ProviderHealth[]> {
    try {
      const res = await fetch('/api/providers/status');
      if (!res.ok) throw new Error('Failed to fetch provider status');
      const data = await res.json();
      return data.providers || [];
    } catch {
      return [];
    }
  }

  /**
   * Safe Connect: Fetch Eligible Peers in Cohort
   */
  public static async getConnectPeers(cohort: string, userId: string) {
    const res = await fetch(`/api/connect/peers?cohort=${cohort}&userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch peers');
    return res.json();
  }

  /**
   * Safe Connect: Post Encrypted Peer Message
   */
  public static async sendConnectMessage(payload: any) {
    const res = await fetch('/api/connect/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  /**
   * Safe Connect: Report Peer / Safety Action
   */
  public static async reportPeer(payload: any) {
    const res = await fetch('/api/connect/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  /**
   * Admin / Moderation: Get pending safety reports
   */
  public static async getModerationReports() {
    const res = await fetch('/api/moderation/reports');
    return res.json();
  }
}
