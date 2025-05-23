// encryptedStorage.js
import { encryptState, decryptState } from './encryption';

const encryptedStorage = {
  getItem: (key) => {
    const encryptedState = localStorage.getItem(key);
    if (encryptedState === null) return null;
    return decryptState(encryptedState);
  },
  setItem: (key, state) => {
    const encryptedState = encryptState(state);
    localStorage.setItem(key, encryptedState);
  },
  removeItem: (key) => {
    localStorage.removeItem(key);
  }
};

export default encryptedStorage;
