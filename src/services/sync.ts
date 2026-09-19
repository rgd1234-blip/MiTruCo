/**
 * MiTruCo Robust Offline Synchronization Engine
 * Manages delta synchronization between IndexedDB local queues and the backend.
 * Provides live connectivity monitoring, conflict avoidance, and visual status.
 */

import { LocalDatabase } from './db';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  pendingCount: number;
  isOnline: boolean;
}

export class SyncService {
  private static listeners: ((state: SyncState) => void)[] = [];
  private static currentState: SyncState = {
    status: navigator.onLine ? 'synced' : 'offline',
    lastSyncedAt: null,
    pendingCount: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
  private static syncInterval: any = null;

  public static initialize(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.currentState.isOnline = true;
      this.currentState.status = 'syncing';
      this.notify();
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.currentState.isOnline = false;
      this.currentState.status = 'offline';
      this.notify();
    });

    // Initial check of pending queue
    this.updatePendingCount();

    // Periodic sync poll every 30 seconds if online
    if (!this.syncInterval) {
      this.syncInterval = setInterval(() => {
        if (this.currentState.isOnline) {
          this.triggerSync();
        }
      }, 30000);
    }
  }

  public static async updatePendingCount(): Promise<number> {
    const pending = await LocalDatabase.getPendingSyncOperations();
    this.currentState.pendingCount = pending.length;
    if (this.currentState.isOnline && this.currentState.status !== 'syncing') {
      this.currentState.status = pending.length > 0 ? 'syncing' : 'synced';
    }
    this.notify();
    return pending.length;
  }

  public static async triggerSync(): Promise<void> {
    if (!navigator.onLine) {
      this.currentState.isOnline = false;
      this.currentState.status = 'offline';
      this.notify();
      return;
    }

    try {
      this.currentState.status = 'syncing';
      this.notify();

      const pendingOps = await LocalDatabase.getPendingSyncOperations();
      if (pendingOps.length === 0) {
        this.currentState.status = 'synced';
        this.currentState.lastSyncedAt = new Date().toISOString();
        this.notify();
        return;
      }

      // Send to server delta sync endpoint
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations: pendingOps }),
      });

      if (response.ok) {
        const result = await response.json();
        const processedIds = result.processedIds || pendingOps.map(op => op.id);
        await LocalDatabase.markSyncOperationsDone(processedIds);
        this.currentState.pendingCount = 0;
        this.currentState.status = 'synced';
        this.currentState.lastSyncedAt = new Date().toISOString();
      } else {
        this.currentState.status = 'error';
      }
    } catch (err) {
      console.warn('Sync attempt failed, staying in offline/cached mode:', err);
      this.currentState.status = navigator.onLine ? 'error' : 'offline';
    } finally {
      this.notify();
    }
  }

  public static subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(): void {
    for (const listener of this.listeners) {
      listener({ ...this.currentState });
    }
  }

  public static getState(): SyncState {
    return { ...this.currentState };
  }
}
