// Realtime park players via the Cloudflare Durable Object WebSocket.
// Every person in the list is a live socket. This file never invents players.
import { filterChat, roomName, rosterOk, tallyOk, validDevice } from './social.js';

export const NET_HTTP = 'https://cb-park.coffeebreaks.workers.dev';
export const NET_URL = 'wss://cb-park.coffeebreaks.workers.dev';

export function socketUrl(room, base) {
  const http = String(base || NET_HTTP).replace(/\/$/, '');
  const ws = http.replace(/^http/i, 'ws');
  return ws + '/?room=' + encodeURIComponent(roomName(room));
}

export function deviceId(storage) {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  const key = 'cbpark-device-v1';
  try {
    let id = store ? store.getItem(key) : '';
    if (!validDevice(id)) {
      id = crypto.randomUUID();
      if (store) store.setItem(key, id);
    }
    return id;
  } catch (e) {
    return crypto.randomUUID();
  }
}

async function readJson(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('park');
  return res.json();
}

export async function fetchStats() {
  const data = await readJson(NET_HTTP + '/stats');
  if (!tallyOk(data)) throw new Error('tally');
  return { total: Number(data.total), today: Number(data.today), day: data.day || '' };
}

export async function postVisit(device) {
  const data = await readJson(NET_HTTP + '/visit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ device }),
  });
  if (!tallyOk(data)) throw new Error('tally');
  return { total: Number(data.total), today: Number(data.today), day: data.day || '' };
}

export async function fetchRoster(room) {
  const data = await readJson(NET_HTTP + '/roster?room=' + encodeURIComponent(roomName(room)));
  if (!rosterOk(data)) throw new Error('roster');
  return { count: Number(data.count), names: data.names.map((person) => ({ id: person.id, name: person.name })) };
}

function round(n) {
  n = +n;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export function connectPark({ name, look, room, getState, onHello, onReady, onJoin, onMove, onLook, onLeave, onChat, onReported, onRoster, onClear, onStatus }) {
  let ws = null, timer = 0, closed = false, myId = null, tries = 0, lastSent = '';
  const roomId = roomName(room);
  function sendJoin() {
    const st = getState() || {};
    ws.send(JSON.stringify({
      t: 'join', name, look, room: roomId,
      x: round(st.x), y: round(st.y), z: round(st.z), r: round(st.r), a: st.a || 'idle',
    }));
  }
  function connect() {
    if (closed) return;
    try { ws = new WebSocket(socketUrl(roomId)); }
    catch (e) { if (onStatus) onStatus('offline'); return; }
    ws.onopen = () => {
      tries = 0;
      lastSent = '';
      if (onStatus) onStatus('online');
      sendJoin();
    };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.t === 'hello') {
        myId = msg.id;
        if (onClear) onClear();
        if (onHello) onHello(msg);
      } else if (msg.t === 'ready') {
        myId = msg.id || myId;
        if (onReady) onReady(msg);
        if (msg.names && onRoster) onRoster(msg.names);
      } else if (msg.t === 'join') {
        if (onJoin) onJoin(msg);
        if (msg.names && onRoster) onRoster(msg.names);
      } else if (msg.t === 'm') {
        if (onMove) onMove(msg);
      } else if (msg.t === 'look') {
        if (onLook) onLook(msg);
      } else if (msg.t === 'leave') {
        if (onLeave) onLeave(msg);
        if (msg.names && onRoster) onRoster(msg.names);
      } else if (msg.t === 'c') {
        if (onChat) onChat(msg);
      } else if (msg.t === 'reported') {
        if (onReported) onReported(msg);
      } else if (msg.t === 'full') {
        closed = true;
        if (onStatus) onStatus('full');
        try { ws.close(); } catch (e) {}
      }
    };
    ws.onclose = () => {
      if (closed) return;
      if (onStatus) onStatus('offline');
      tries += 1;
      setTimeout(connect, Math.min(8000, 1000 * tries));
    };
    ws.onerror = () => {};
  }
  connect();
  timer = setInterval(() => {
    if (!ws || ws.readyState !== 1) return;
    if (ws.bufferedAmount > 48000) return;
    const st = getState() || {};
    const payload = JSON.stringify({
      t: 'm', x: round(st.x), y: round(st.y), z: round(st.z), r: round(st.r), a: st.a || 'idle',
    });
    if (payload === lastSent) return;
    lastSent = payload;
    try { ws.send(payload); } catch (e) {}
  }, 120);
  return {
    get id() { return myId; },
    get room() { return roomId; },
    updateLook(nextLook, nextName) {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'look', look: nextLook, name: nextName }));
    },
    chat(text) {
      const clean = filterChat(text);
      if (!clean) return { ok: false, reason: 'empty' };
      if (!ws || ws.readyState !== 1) return { ok: false, reason: 'offline' };
      try { ws.send(JSON.stringify({ t: 'c', text: clean })); }
      catch (e) { return { ok: false, reason: 'offline' }; }
      return { ok: true };
    },
    report(id) {
      if (!id || !ws || ws.readyState !== 1) return false;
      try { ws.send(JSON.stringify({ t: 'report', id })); }
      catch (e) { return false; }
      return true;
    },
    close() {
      closed = true;
      clearInterval(timer);
      try { if (ws) ws.close(); } catch (e) {}
    },
  };
}
