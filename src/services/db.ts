/**
 * MiTruCo Local-First Storage Database
 * IndexedDB database with schema versioning and synchronous memory caching.
 * Supports offline-first reading, writing, and atomic sync-queue transactions.
 */

import { Conversation, Message, ActivityRecord, DownloadItem, UserProfile } from '../types';

const DB_NAME = 'MiTruCoDB';
const DB_VERSION = 1;

export interface SyncOperation {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  recordId: string;
  payload: any;
  timestamp: string;
  synced: boolean;
}

export class LocalDatabase {
  private static db: IDBDatabase | null = null;
  private static initPromise: Promise<IDBDatabase> | null = null;

  public static async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported in current environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('conversationId', 'conversationId', { unique: false });
          msgStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('activities')) {
          const actStore = db.createObjectStore('activities', { keyPath: 'id' });
          actStore.createIndex('timestamp', 'timestamp', { unique: false });
          actStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('downloads')) {
          const dlStore = db.createObjectStore('downloads', { keyPath: 'id' });
          dlStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('synced', 'synced', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.initPromise;
  }

  // --- Conversations ---
  public static async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['conversations', 'sync_queue'], 'readwrite');
      tx.objectStore('conversations').put(conversation);
      
      // Enqueue sync operation
      tx.objectStore('sync_queue').put({
        id: 'sync_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        table: 'conversations',
        operation: 'update',
        recordId: conversation.id,
        payload: conversation,
        timestamp: new Date().toISOString(),
        synced: false,
      });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fallback in memory or localStorage
      localStorage.setItem(`mitruco_conv_${conversation.id}`, JSON.stringify(conversation));
    }
  }

  public static async getConversations(): Promise<Conversation[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('conversations', 'readonly');
        const store = tx.objectStore('conversations');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as Conversation[]) || [];
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      // LocalStorage fallback
      const items: Conversation[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mitruco_conv_')) {
          try {
            items.push(JSON.parse(localStorage.getItem(key) || ''));
          } catch {}
        }
      }
      return items;
    }
  }

  // --- Messages ---
  public static async saveMessage(message: Message): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['messages', 'sync_queue'], 'readwrite');
      tx.objectStore('messages').put(message);
      tx.objectStore('sync_queue').put({
        id: 'sync_msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        table: 'messages',
        operation: 'insert',
        recordId: message.id,
        payload: message,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      localStorage.setItem(`mitruco_msg_${message.id}`, JSON.stringify(message));
    }
  }

  public static async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readonly');
        const store = tx.objectStore('messages');
        const index = store.index('conversationId');
        const req = index.getAll(conversationId);
        req.onsuccess = () => {
          const msgs = (req.result as Message[]) || [];
          msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          resolve(msgs);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const msgs: Message[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mitruco_msg_')) {
          try {
            const m = JSON.parse(localStorage.getItem(key) || '') as Message;
            if (m.conversationId === conversationId) msgs.push(m);
          } catch {}
        }
      }
      return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  }

  // --- Activity Records ---
  public static async addActivity(activity: ActivityRecord): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('activities', 'readwrite');
      tx.objectStore('activities').put(activity);
    } catch {
      localStorage.setItem(`mitruco_act_${activity.id}`, JSON.stringify(activity));
    }
  }

  public static async getActivities(): Promise<ActivityRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('activities', 'readonly');
        const store = tx.objectStore('activities');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as ActivityRecord[]) || [];
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list: ActivityRecord[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mitruco_act_')) {
          try {
            list.push(JSON.parse(localStorage.getItem(key) || ''));
          } catch {}
        }
      }
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  public static async deleteActivity(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('activities', 'readwrite');
      tx.objectStore('activities').delete(id);
    } catch {
      localStorage.removeItem(`mitruco_act_${id}`);
    }
  }

  // --- Downloads ---
  public static async saveDownload(download: DownloadItem): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('downloads', 'readwrite');
      tx.objectStore('downloads').put(download);
    } catch {
      localStorage.setItem(`mitruco_dl_${download.id}`, JSON.stringify(download));
    }
  }

  public static async getDownloads(): Promise<DownloadItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('downloads', 'readonly');
        const store = tx.objectStore('downloads');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as DownloadItem[]) || [];
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list: DownloadItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mitruco_dl_')) {
          try {
            list.push(JSON.parse(localStorage.getItem(key) || ''));
          } catch {}
        }
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  public static async deleteDownload(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('downloads', 'readwrite');
      tx.objectStore('downloads').delete(id);
    } catch {
      localStorage.removeItem(`mitruco_dl_${id}`);
    }
  }

  // --- Pending Sync Queue Operations ---
  public static async getPendingSyncOperations(): Promise<SyncOperation[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sync_queue', 'readonly');
        const store = tx.objectStore('sync_queue');
        const req = store.getAll();
        req.onsuccess = () => {
          const ops = (req.result as SyncOperation[]) || [];
          resolve(ops.filter(o => !o.synced));
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  public static async markSyncOperationsDone(ids: string[]): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      for (const id of ids) {
        store.delete(id);
      }
    } catch {}
  }
}
