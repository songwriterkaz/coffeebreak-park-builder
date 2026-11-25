// Shared park rules for the browser and the worker. Real sessions only.

export const PUBLIC_ROOM = 'park';

const BAD = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'cunt', 'pussy', 'cock',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'slut', 'whore',
];

export function roomName(input) {
  const clean = String(input || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  return clean || PUBLIC_ROOM;
}

export function roomFromUrl(href) {
  try {
    const url = new URL(href, 'https://songwriterkaz.github.io/coffeebreak-park-builder/');
    const raw = url.searchParams.get('room');
    if (raw == null || raw === '') return '';
    return roomName(raw);
  } catch (e) {
    return '';
  }
}

export function inviteLink(href, room) {
  const url = new URL(href, 'https://songwriterkaz.github.io/coffeebreak-park-builder/');
  const hash = url.hash;
  url.search = '';
  url.hash = '';
  url.searchParams.set('room', roomName(room));
  url.hash = hash;
  return url.toString();
}

export function playerName(n) {
  if (typeof n !== 'string') return '';
  n = n.replace(/\s+/g, ' ').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 '\-]{0,15}$/.test(n)) return '';
  return n.slice(0, 16);
}

export function validDevice(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function visitorDay(date) {
  const when = date instanceof Date ? date : new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(when);
}

export function visitDelta(existing, device, day) {
  if (!validDevice(device)) return { action: 'reject' };
  if (!existing) return { action: 'insert', first_day: day, last_day: day };
  if (existing.last_day !== day) return { action: 'update', last_day: day };
  return { action: 'same' };
}

export function tallyFrom(rows, day) {
  const list = Array.isArray(rows) ? rows : [];
  return {
    total: list.length,
    today: list.filter((row) => row && row.last_day === day).length,
    day,
  };
}

function foldWord(word) {
  return String(word || '').toLowerCase()
    .replace(/[@4]/g, 'a')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/\$/g, 's')
    .replace(/[^a-z]/g, '');
}

function hiddenWord(word) {
  const folded = foldWord(word);
  if (!folded) return false;
  return BAD.some((bad) => folded === bad || folded.startsWith(bad) || folded.endsWith(bad));
}

export function filterChat(text) {
  let raw = String(text || '').replace(/[\u0000-\u001f]/g, '').trim();
  if (raw.length > 140) raw = raw.slice(0, 140);
  if (!raw) return '';
  return raw.split(/(\s+)/).map((part) => {
    if (/^\s+$/.test(part)) return part;
    return hiddenWord(part) ? '****' : part;
  }).join('').trim();
}

export function tallyOk(data) {
  if (!data || typeof data !== 'object') return false;
  const total = Number(data.total);
  const today = Number(data.today);
  return Number.isFinite(total) && total >= 0 && Number.isFinite(today) && today >= 0 && today <= total;
}

export function rosterOk(data) {
  if (!data || typeof data !== 'object') return false;
  const count = Number(data.count);
  if (!Number.isFinite(count) || count < 0 || !Array.isArray(data.names)) return false;
  if (data.names.length !== count) return false;
  return data.names.every((person) => person && typeof person.id === 'string' && person.id && typeof person.name === 'string' && person.name);
}
