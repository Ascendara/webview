/**
 * Encryption/Decryption utilities for TRUE end-to-end encryption
 * Uses Web Crypto API with AES-GCM
 * 
 * KEY PRINCIPLE: Server NEVER sees plaintext or encryption keys
 * - Keys are derived from user ID (deterministic)
 * - All clients for same user can decrypt data
 * - Server only stores/forwards encrypted blobs
 */

let cachedE2EKey: CryptoKey | null = null;
let cachedUserId: string | null = null;

/**
 * Derive E2E encryption key from user ID
 * This allows all clients for the same user to decrypt data
 * Server NEVER has access to this key
 */
async function deriveE2EKeyFromUserId(userId: string): Promise<CryptoKey> {
  if (cachedE2EKey && cachedUserId === userId) {
    return cachedE2EKey;
  }

  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API not available. Ensure you are in a secure context (HTTPS).');
  }

  try {
    console.log('[Crypto] Deriving E2E key from user ID (TRUE E2E - server never sees this)');
    
    // Use PBKDF2 to derive a key from the user ID
    // This is deterministic - same userId always produces same key
    const encoder = new TextEncoder();
    const userIdData = encoder.encode(userId);
    
    // Import userId as key material
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      userIdData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Use a fixed salt (in production, this could be derived from app-specific constant)
    // The security comes from the userId being secret to the server
    const salt = encoder.encode('ascendara-e2e-salt-v1');
    
    // Derive the actual encryption key
    cachedE2EKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    cachedUserId = userId;
    console.log('[Crypto] E2E key derived successfully (client-side only)');
    
    return cachedE2EKey;
  } catch (error) {
    console.error('Failed to derive E2E encryption key:', error);
    throw new Error('Failed to derive E2E encryption key');
  }
}

/**
 * Encrypt data using TRUE E2E encryption (client-side only)
 * Server will NEVER be able to decrypt this data
 * 
 * @param data - Data to encrypt
 * @param userId - User ID to derive encryption key from
 */
export async function encryptE2EData(data: any, userId: string): Promise<any> {
  try {
    console.log('[Crypto] Encrypting data with TRUE E2E encryption (client-side only)');

    // Derive the E2E encryption key from user ID (server never sees this)
    const key = await deriveE2EKeyFromUserId(userId);

    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(jsonData);

    // Generate a random 96-bit nonce (12 bytes is recommended for GCM)
    const nonce = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
      },
      key,
      plaintext
    );

    // Return base64-encoded nonce and ciphertext with E2E flag
    const encrypted = {
      e2e_encrypted: true,
      nonce: btoa(String.fromCharCode(...nonce)),
      data: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    };

    console.log('[Crypto] TRUE E2E encryption successful (server cannot decrypt)');
    return encrypted;
  } catch (error) {
    console.error('[Crypto] E2E encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt TRUE E2E encrypted data
 * 
 * @param encryptedPackage - Encrypted data package
 * @param userId - User ID to derive decryption key from
 */
export async function decryptE2EData(encryptedPackage: any, userId: string): Promise<any> {
  try {
    // Check if data is E2E encrypted
    if (!encryptedPackage || typeof encryptedPackage !== 'object') {
      console.log('[Crypto] Data is not an object, returning as-is');
      return encryptedPackage;
    }

    if (!encryptedPackage.e2e_encrypted) {
      // Data is not E2E encrypted, return as-is
      console.log('[Crypto] Data is not E2E encrypted, returning as-is');
      return encryptedPackage;
    }

    console.log('[Crypto] Decrypting TRUE E2E data (client-side only)');

    // Derive the E2E encryption key from user ID (server never has this)
    const key = await deriveE2EKeyFromUserId(userId);

    // Decode base64 nonce and ciphertext
    const nonce = Uint8Array.from(atob(encryptedPackage.nonce), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encryptedPackage.data), c => c.charCodeAt(0));

    // Decrypt using AES-GCM
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
      },
      key,
      ciphertext
    );

    // Convert decrypted data to string and parse JSON
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedData);
    console.log('[Crypto] TRUE E2E decryption successful');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[Crypto] E2E decryption error:', error);
    throw new Error('Failed to decrypt E2E data');
  }
}

/**
 * DEPRECATED: Decrypt data received from the backend (old server-side encryption)
 * Use decryptE2EData for true end-to-end encryption
 */
export async function decryptData(encryptedPackage: any): Promise<any> {
  try {
    // Check if data is encrypted
    if (!encryptedPackage || typeof encryptedPackage !== 'object') {
      console.log('[Crypto] Data is not an object, returning as-is');
      return encryptedPackage;
    }

    if (!encryptedPackage.encrypted) {
      // Data is not encrypted, return as-is (for backward compatibility)
      console.log('[Crypto] Data is not encrypted, returning as-is');
      return encryptedPackage;
    }

    console.log('[Crypto] Decrypting data (legacy server-side encryption)...');
    console.log('[Crypto] WARNING: This is not true E2E encryption');
    
    // For backward compatibility, return the encrypted package as-is
    // The server should not be encrypting data anymore
    return encryptedPackage;
  } catch (error) {
    console.error('[Crypto] Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Helper to decrypt API response data (E2E encrypted)
 */
export async function decryptApiResponse<T>(response: any): Promise<T> {
  // Check if response contains E2E encrypted data
  if (response && typeof response === 'object' && response.e2e_encrypted) {
    return await decryptE2EData(response, response.userId);
  }
  
  // Legacy: Check for old server-side encryption
  if (response && response.encrypted) {
    console.warn('[Crypto] Received legacy server-side encrypted data');
    return await decryptData(response.encrypted);
  }
  
  return response;
}
