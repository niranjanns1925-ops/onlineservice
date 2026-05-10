/**
 * Simple E2EE utility using Web Crypto API (AES-GCM)
 */

const ALGORITHM = 'AES-GCM';

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptDocument(dataUrl: string, secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret, salt);
  
  const encoder = new TextEncoder();
  const encryptedContents = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(dataUrl)
  );

  const encryptedArray = new Uint8Array(encryptedContents);
  
  // Package salt + iv + encrypted data
  const result = new Uint8Array(salt.length + iv.length + encryptedArray.length);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(encryptedArray, salt.length + iv.length);
  
  return btoa(String.fromCharCode(...result));
}

export async function decryptDocument(encryptedBase64: string, secret: string): Promise<string> {
  const encryptedData = new Uint8Array(
    atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
  );
  
  const salt = encryptedData.slice(0, 16);
  const iv = encryptedData.slice(16, 28);
  const data = encryptedData.slice(28);
  
  const key = await deriveKey(secret, salt);
  
  const decryptedContents = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedContents);
}
