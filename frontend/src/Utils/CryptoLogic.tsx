import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

/**
 * Derives a consistent encryption key from a mnemonic phrase
 */
export const deriveEncryptionKeyFromMnemonic = (mnemonic: string): string => {
  try {
    // Create a wallet from mnemonic to derive a consistent key
    const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());

    // Use the derived private key to generate a consistent encryption key
    // SHA-256 hash creates a consistent length encryption key
    return CryptoJS.SHA256(wallet.privateKey).toString();
  } catch (error) {
    console.error('Error deriving key from mnemonic:', error);
    // Return a fallback key derived directly from the mnemonic
    // This is less secure but prevents complete failure
    return CryptoJS.SHA256(mnemonic).toString();
  }
};

/**
 * Derives a consistent encryption key from a private key
 */
export const deriveEncryptionKey = (privateKey: string): string => {
  // Use SHA-256 of the private key as our symmetric encryption key
  return CryptoJS.SHA256(privateKey).toString();
};

/**
 * Encrypts file data using the provided encryption key
 */
export const encryptFile = async (
  file: File,
  encryptionKey: string
): Promise<{
  encrypted: string;
  originalName: string;
  originalType: string;
  originalSize: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

        // Encrypt the file contents
        const encrypted = CryptoJS.AES.encrypt(
          wordArray,
          encryptionKey
        ).toString();

        // Return encrypted data along with original file metadata
        resolve({
          encrypted,
          originalName: file.name,
          originalType: file.type,
          originalSize: file.size,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Decrypts file data using the provided encryption key
 */
export const decryptFile = (
  encryptedData: string,
  encryptionKey: string,
  originalType: string
): Blob => {
  // Decrypt the data
  const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);

  // Convert WordArray to Uint8Array
  const typedArray = convertWordArrayToUint8Array(decrypted);

  // Ensure typedArray is constructed from ArrayBuffer for Blob compatibility
  const arrayBuffer =
    typedArray.buffer instanceof ArrayBuffer
      ? typedArray.buffer
      : new ArrayBuffer(typedArray.length);
  const compatibleTypedArray = new Uint8Array(arrayBuffer);

  // Create a blob with the original MIME type
  return new Blob([compatibleTypedArray], { type: originalType });
};

/**
 * Helper function to convert CryptoJS WordArray to Uint8Array
 */
const convertWordArrayToUint8Array = (
  wordArray: CryptoJS.lib.WordArray
): Uint8Array => {
  const arrayOfWords = wordArray.words;
  const length = wordArray.sigBytes;
  const uint8Array = new Uint8Array(length);

  let offset = 0;
  for (let i = 0; i < arrayOfWords.length; i++) {
    const word = arrayOfWords[i];
    uint8Array[offset++] = (word >> 24) & 0xff;
    if (offset < length) uint8Array[offset++] = (word >> 16) & 0xff;
    if (offset < length) uint8Array[offset++] = (word >> 8) & 0xff;
    if (offset < length) uint8Array[offset++] = word & 0xff;
  }

  return uint8Array;
};
