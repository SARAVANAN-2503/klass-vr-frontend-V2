// encryption.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key'; // Replace with a strong secret key

export const encryptState = (state) => {
  return CryptoJS.AES.encrypt(JSON.stringify(state), SECRET_KEY).toString();
};

export const decryptState = (encryptedState) => {
  const bytes = CryptoJS.AES.decrypt(encryptedState, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
