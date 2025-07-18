import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

/**
 * Derives encryption key from mnemonic
 */
export const deriveEncryptionKeyFromMnemonic = (mnemonic: string): string => {
  try {
    const wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
    return CryptoJS.SHA256(wallet.privateKey).toString();
  } catch (error) {
    console.error('Error deriving key from mnemonic:', error);
    return CryptoJS.SHA256(mnemonic).toString();
  }
};

/**
 * Convert CryptoJS WordArray to Uint8Array
 */
export const convertWordArrayToUint8Array = (
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

/**
 * Decrypt file data into a Blob for display or download
 */
export const decryptFileToBlob = (
  encryptedData: string,
  encryptionKey: string,
  contentType: string
): Blob => {
  // Decrypt the data
  const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey);

  // Convert WordArray to Uint8Array
  const typedArray = convertWordArrayToUint8Array(decrypted);
  const arrayBuffer =
    typedArray.buffer instanceof ArrayBuffer
      ? typedArray.buffer
      : new ArrayBuffer(typedArray.length);
  const compatibleTypedArray = new Uint8Array(arrayBuffer);
  // Create blob with explicit MIME type
  return new Blob([compatibleTypedArray], {
    type: contentType || 'application/octet-stream',
  });
};

/**
 * Determines if a file is an image type
 */
export const isImageType = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Determines file type from filename
 */
export const guessFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'application/octet-stream';

  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    txt: 'text/plain',
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

// Cache of decrypted files to avoid repeated decryption
const decryptedFileCache = new Map<string, string>();

/**
 * Fetch and decrypt file for display
 * @param cid The IPFS CID of the encrypted file
 * @param mnemonic User's mnemonic phrase for decryption
 * @param originalName Original file name (for guessing content type)
 * @param originalType Original file type if known
 * @returns URL to display the decrypted file
 */
export const fetchAndDecryptFile = async (
  cid: string,
  mnemonic: string,
  originalName: string,
  originalType?: string
): Promise<string> => {
  try {
    // Explicitly determine content type from filename or use provided type
    const contentType = originalType || guessFileType(originalName);
    console.log('Decrypting file:', { originalName, contentType, cid });

    // 1. Fetch the encrypted file
    const response = await fetch(
      `https://cooperative-salmon-galliform.myfilebase.com/ipfs/${cid}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch encrypted file');
    }

    // 2. Get the encrypted content
    const encryptedText = await response.text();

    // 3. Derive encryption key from mnemonic
    const encryptionKey = deriveEncryptionKeyFromMnemonic(mnemonic);

    // 4. Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedText, encryptionKey);

    // 5. Convert to appropriate format for a Blob
    const typedArray = convertWordArrayToUint8Array(decrypted);
    const arrayBuffer =
      typedArray.buffer instanceof ArrayBuffer
        ? typedArray.buffer
        : new ArrayBuffer(typedArray.length);
    const compatibleTypedArray = new Uint8Array(arrayBuffer);
    // 6. Create Blob with EXPLICIT content type
    const blob = new Blob([compatibleTypedArray], { type: contentType });

    // 7. Create and return object URL
    const objectURL = URL.createObjectURL(blob);
    console.log('Created decrypted URL with type:', contentType);

    return objectURL;
  } catch (error) {
    console.error('Error decrypting file for display:', error);
    throw error;
  }
};
