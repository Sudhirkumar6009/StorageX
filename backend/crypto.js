const CryptoJS = require('crypto-js');

require('dotenv').config({ path: './.env' });

const SECRET_KEY = process.env.SECRET_KEY;

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('Decryption failed:', err);
    return '';
  }
};

module.exports = { encrypt, decrypt };
