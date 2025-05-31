const CryptoJS = require('crypto-js');

<<<<<<< HEAD
require('dotenv').config({ path: './.env' });
=======
require('dotenv').config({ path: './config.env' });
>>>>>>> 4f318936bc4036cc549beaaadfa0a624c639d73c

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
