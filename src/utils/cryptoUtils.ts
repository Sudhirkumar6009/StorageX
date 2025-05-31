// utils/cryptoUtils.ts
import CryptoJS from 'crypto-js';

// ⚠️ IMPORTANT: Replace this key with a secure 32-character random key for production.
// For better security in React Native, inject via secure storage or backend.
const SECRET_KEY = 'Sudhir';

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (encryptedData: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};
