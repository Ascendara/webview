/**
 * Encryption/Decryption utilities for secure data transmission
 * Uses Web Crypto API with AES-GCM
 */

// This key must match the one used on the backend
// In production, this should be securely distributed or derived
const ENCRYPTION_KEY_BASE64 = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || '';

let cachedKey: CryptoKey | null = null;

/**
 * Get or import the encryption key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) {
    return cachedKey;
  }

  if (!ENCRYPTION_KEY_BASE64) {
    throw new Error('Encryption key not configured. Set NEXT_PUBLIC_ENCRYPTION_KEY environment variable.');
  }

  try {
    // Decode base64 key
    const keyData = Uint8Array.from(atob(ENCRYPTION_KEY_BASE64), c => c.charCodeAt(0));

    // Import the key for AES-GCM
    cachedKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    return cachedKey;
  } catch (error) {
    console.error('Failed to import encryption key:', error);
    throw new Error('Failed to initialize encryption key');
  }
}

/**
 * Decrypt data received from the backend
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

    console.log('[Crypto] Decrypting data...');
    console.log('[Crypto] Nonce length:', encryptedPackage.nonce?.length);
    console.log('[Crypto] Data length:', encryptedPackage.data?.length);

    // Get the encryption key
    const key = await getEncryptionKey();
    console.log('[Crypto] Encryption key loaded');

    // Decode base64 nonce and ciphertext
    const nonce = Uint8Array.from(atob(encryptedPackage.nonce), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encryptedPackage.data), c => c.charCodeAt(0));

    console.log('[Crypto] Nonce bytes:', nonce.length);
    console.log('[Crypto] Ciphertext bytes:', ciphertext.length);

    // Decrypt using AES-GCM
    const decryptedData = await crypto.subtle.decrypt(
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
    console.log('[Crypto] Decryption successful');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('[Crypto] Decryption error:', error);
    console.error('[Crypto] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Helper to decrypt API response data
 */
export async function decryptApiResponse<T>(response: any): Promise<T> {
  if (response.success && response.encrypted) {
    return await decryptData(response.encrypted);
  }
  return response;
}
