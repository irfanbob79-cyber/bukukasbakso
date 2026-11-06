// Utilities for Indonesian Rupiah formatting and Date helpers

export const formatRupiah = (number, withPrefix = true) => {
  const cleanNumber = Math.round(Number(number) || 0);
  const formatted = cleanNumber.toLocaleString('id-ID');
  return withPrefix ? `Rp ${formatted}` : formatted;
};

export const parseRupiahInput = (str) => {
  if (typeof str === 'number') return isNaN(str) ? 0 : str;
  if (!str) return 0;
  // Strip non-digits
  const clean = str.toString().replace(/[^\d]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateIndonesian = (dateString, withDayName = true) => {
  if (!dateString || typeof dateString !== 'string') return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length < 3) return String(dateString);
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return String(dateString);
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(withDayName ? { weekday: 'long' } : {})
    };
    return date.toLocaleDateString('id-ID', options);
  } catch (e) {
    return String(dateString);
  }
};

export const formatShortDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return '-';
  try {
    const parts = dateString.split('-');
    if (parts.length < 3) return String(dateString);
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch (e) {
    return String(dateString);
  }
};

export const calculateDaysBetween = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') {
    return 0;
  }
  try {
    const startParts = startDateStr.split('-');
    const endParts = endDateStr.split('-');
    if (startParts.length < 3 || endParts.length < 3) return 0;
    const [sy, sm, sd] = startParts.map(Number);
    const [ey, em, ed] = endParts.map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
