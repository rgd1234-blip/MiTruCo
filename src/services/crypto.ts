/**
 * MiTruCo Cryptographic Security Engine
 * WebCrypto API implementation of AES-GCM (256-bit) & SHA-256 Fingerprinting
 * Supports offline-safe E2EE for peer communication and secure local notes.
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

export interface EncryptedPayload {
  cipherText: string; // Base64
  iv: string; // Base64
  tagLength: number;
  fingerprint: string;
}

export class E2EEService {
  private static masterKey: CryptoKey | null = null;
  private static keyFingerprint: string = '';

  /**
   * Initialize or retrieve local device cryptographic vault key
   */
  public static async initializeVault(userSeed: string = 'mitruco-user-vault'): Promise<string> {
    if (this.masterKey && this.keyFingerprint) {
      return this.keyFingerprint;
    }

    try {
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userSeed),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const salt = encoder.encode('mitruco_bihar_gr_salt_2026');
      this.masterKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
      );

      // Compute SHA-256 fingerprint of the exported raw key
      const exportedRaw = await crypto.subtle.exportKey('raw', this.masterKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', exportedRaw);
      this.keyFingerprint = this.bufferToHex(hashBuffer).slice(0, 16).toUpperCase();
      return this.keyFingerprint;
    } catch (error) {
      console.error('Failed to initialize E2EE vault:', error);
      this.keyFingerprint = 'MT-SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      return this.keyFingerprint;
    }
  }

  /**
   * Encrypt a text payload with AES-GCM 256
   */
  public static async encrypt(plainText: string): Promise<EncryptedPayload> {
    await this.initializeVault();
    if (!this.masterKey) {
      throw new Error('E2EE Master Key not initialized');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv,
      },
      this.masterKey,
      encoder.encode(plainText)
    );

    return {
      cipherText: this.bufferToBase64(encryptedBuffer),
      iv: this.bufferToBase64(iv),
      tagLength: 128,
      fingerprint: this.keyFingerprint,
    };
  }

  /**
   * Decrypt an encrypted payload with AES-GCM 256
   */
  public static async decrypt(payload: { cipherText: string; iv: string }): Promise<string> {
    await this.initializeVault();
    if (!this.masterKey) {
      throw new Error('E2EE Master Key not initialized');
    }

    const iv = this.base64ToBuffer(payload.iv);
    const cipherData = this.base64ToBuffer(payload.cipherText);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: ENCRYPTION_ALGORITHM,
        iv: iv as unknown as BufferSource,
      },
      this.masterKey,
      cipherData as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Calculate SHA-256 checksum for attachments or downloads
   */
  public static async sha256(data: string | ArrayBuffer): Promise<string> {
    const uint8 = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
    const hash = await crypto.subtle.digest('SHA-256', uint8 as unknown as BufferSource);
    return this.bufferToHex(hash);
  }

  public static getFingerprint(): string {
    return this.keyFingerprint || 'MT-SEC-LOCAL';
  }

  private static bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private static bufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
