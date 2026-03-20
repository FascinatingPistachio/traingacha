import { SAVE_KEY, START_TICKETS } from '../constants.js';

export async function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function writeSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not write save:', e);
  }
}

export async function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

export function makeFreshSave(username) {
  return {
    username,
    tickets: START_TICKETS,
    collection: {},          // title → { card data, count, addedAt }
    totalPulls: 0,
    pity: 0,
    dailyClaimedDate: null,
    joinDate: new Date().toISOString().split('T')[0],
  };
}

// Cross-device transfer: encode full save as a base64 string
export function exportCode(save) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(save))));
}

export function importCode(code) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  } catch {
    return null;
  }
}
