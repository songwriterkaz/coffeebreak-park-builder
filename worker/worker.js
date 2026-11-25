// Realtime park for Coffeebreak Park Builder.
// WebSocket sessions are real browsers only. Visitor totals live in this object's SQLite.
// Names and looks only. No emails and no payment data.

import { filterChat, playerName, roomName, validDevice, visitDelta, visitorDay } from '../social.js';

const MAX = 32;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });
    const url = new URL(request.url);
    if (url.pathname === '/stats' || url.pathname === '/visit') {
      const id = env.ROOM.idFromName('visitor-stats');
      return env.ROOM.get(id).fetch(request);
    }
    if (url.pathname === '/roster' || request.headers.get('Upgrade') === 'websocket') {
      const room = roomName(url.searchParams.get('room'));
      const id = env.ROOM.idFromName('room:' + room);
      return env.ROOM.get(id).fetch(request);
    }
    return new Response('Coffeebreak Park', { headers: cors() });
  },
};

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
  };
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ 'content-type': 'application/json; charset=utf-8' }, cors()),
  });
}

export class ParkRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/stats') return this.statsResponse();
    if (url.pathname === '/visit') return this.visitResponse(request);
    if (url.pathname === '/roster') return json({ count: this.roster().length, names: this.roster() });
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 426, headers: cors() });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    if (this.ctx.getWebSockets().length > MAX) {
      try { server.send(JSON.stringify({ t: 'full' })); } catch (e) {}
      try { server.close(1013, 'full'); } catch (e) {}
      return new Response(null, { status: 101, webSocket: client });
    }
    const id = crypto.randomUUID().slice(0, 10);
    server.serializeAttachment({ id, name: '', look: null, x: 0, y: 0, z: 46, r: 0, a: 'idle', joined: false, lastMove: 0, lastChat: 0 });
    server.send(JSON.stringify({ t: 'hello', id, players: this.players() }));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
    if (!text || text.length > 4000) return;
    let msg;
    try { msg = JSON.parse(text); }
    catch (e) { return; }
    const state = ws.deserializeAttachment() || {};
    if (msg.t === 'join') {
      const name = playerName(msg.name);
      const look = slimLook(msg.look);
      if (!name || !look) return;
      state.name = name;
      state.look = look;
      state.joined = true;
      if (typeof msg.x === 'number') {
        state.x = clamp(msg.x, -300, 300);
        state.y = clamp(msg.y || 0, 0, 40);
        state.z = clamp(msg.z, -300, 300);
        state.r = round(msg.r);
        state.a = animOf(msg.a);
      }
      ws.serializeAttachment(state);
      const names = this.roster();
      const self = { t: 'ready', id: state.id, names, count: names.length };
      try { ws.send(JSON.stringify(self)); } catch (e) {}
      this.broadcast(ws, {
        t: 'join', id: state.id, name: state.name, look: state.look,
        x: state.x, y: state.y, z: state.z, r: state.r, a: state.a,
        names, count: names.length,
      });
      return;
    }
    if (msg.t === 'm' && state.joined) {
      const now = Date.now();
      if (now - (state.lastMove || 0) < 70) return;
      state.lastMove = now;
      state.x = clamp(+msg.x, -300, 300);
      state.y = clamp(+msg.y || 0, 0, 40);
      state.z = clamp(+msg.z, -300, 300);
      state.r = round(msg.r);
      state.a = animOf(msg.a);
      ws.serializeAttachment(state);
      this.broadcast(ws, { t: 'm', id: state.id, x: state.x, y: state.y, z: state.z, r: state.r, a: state.a });
      return;
    }
    if (msg.t === 'look' && state.joined) {
      const look = slimLook(msg.look);
      if (!look) return;
      state.look = look;
      if (msg.name) state.name = playerName(msg.name) || state.name;
      ws.serializeAttachment(state);
      this.broadcast(ws, { t: 'look', id: state.id, look: state.look, name: state.name });
      return;
    }
    if (msg.t === 'c' && state.joined) {
      const now = Date.now();
      if (now - (state.lastChat || 0) < 800) return;
      const said = filterChat(msg.text);
      if (!said) return;
      state.lastChat = now;
      ws.serializeAttachment(state);
      this.broadcast(null, { t: 'c', id: state.id, name: state.name, text: said });
      return;
    }
    if (msg.t === 'report' && state.joined) {
      const target = String(msg.id || '').slice(0, 16);
      if (!target || target === state.id) return;
      this.ensureReports();
      this.ctx.storage.sql.exec(
        'INSERT OR IGNORE INTO reports (reporter, target) VALUES (?, ?)',
        state.id,
        target,
      );
      try { ws.send(JSON.stringify({ t: 'reported', id: target })); } catch (e) {}
    }
  }

  async webSocketClose(ws) {
    const state = ws.deserializeAttachment() || {};
    if (!state.joined || state.left) return;
    state.left = true;
    state.joined = false;
    try { ws.serializeAttachment(state); } catch (e) {}
    const names = this.roster(ws);
    this.broadcast(ws, { t: 'leave', id: state.id, names, count: names.length });
  }

  async webSocketError(ws) {
    return this.webSocketClose(ws);
  }

  players(except) {
    const list = [];
    for (const sock of this.ctx.getWebSockets()) {
      if (sock === except) continue;
      const state = sock.deserializeAttachment() || {};
      if (!state.joined || !state.id || !state.name) continue;
      list.push({ id: state.id, name: state.name, look: state.look, x: state.x, y: state.y, z: state.z, r: state.r, a: state.a });
    }
    return list;
  }

  roster(except) {
    const names = this.players(except).map((person) => ({ id: person.id, name: person.name }));
    names.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : (a.id < b.id ? -1 : 1)));
    return names;
  }

  broadcast(except, msg) {
    const data = JSON.stringify(msg);
    for (const sock of this.ctx.getWebSockets()) {
      if (sock === except) continue;
      try { sock.send(data); } catch (e) {}
    }
  }

  ensureVisitors() {
    this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS visitors (
      id TEXT PRIMARY KEY,
      first_day TEXT NOT NULL,
      last_day TEXT NOT NULL
    )`);
  }

  ensureReports() {
    this.ctx.storage.sql.exec(`CREATE TABLE IF NOT EXISTS reports (
      reporter TEXT NOT NULL,
      target TEXT NOT NULL,
      PRIMARY KEY (reporter, target)
    )`);
  }

  counts(day) {
    this.ensureVisitors();
    const total = Number(this.ctx.storage.sql.exec('SELECT COUNT(*) AS n FROM visitors').toArray()[0].n);
    const today = Number(this.ctx.storage.sql.exec('SELECT COUNT(*) AS n FROM visitors WHERE last_day = ?', day).toArray()[0].n);
    return { total, today, day };
  }

  statsResponse() {
    try { return json(this.counts(visitorDay(new Date()))); }
    catch (e) { return json({ error: 'stats' }, 500); }
  }

  async visitResponse(request) {
    if (request.method !== 'POST') return json({ error: 'method' }, 405);
    let device = '';
    try {
      const raw = await request.text();
      if (raw.length > 200) return json({ error: 'device' }, 400);
      device = JSON.parse(raw).device;
    } catch (e) {
      return json({ error: 'device' }, 400);
    }
    if (!validDevice(device)) return json({ error: 'device' }, 400);
    try {
      this.ensureVisitors();
      const day = visitorDay(new Date());
      const existing = this.ctx.storage.sql.exec('SELECT first_day, last_day FROM visitors WHERE id = ?', device).toArray()[0] || null;
      const delta = visitDelta(existing, device, day);
      if (delta.action === 'insert') {
        this.ctx.storage.sql.exec('INSERT INTO visitors (id, first_day, last_day) VALUES (?, ?, ?)', device, delta.first_day, delta.last_day);
      } else if (delta.action === 'update') {
        this.ctx.storage.sql.exec('UPDATE visitors SET last_day = ? WHERE id = ?', delta.last_day, device);
      }
      return json(this.counts(day));
    } catch (e) {
      return json({ error: 'stats' }, 500);
    }
  }
}

function animOf(value) {
  return value === 'walk' || value === 'jump' ? value : 'idle';
}

function round(value) {
  const n = +value;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function clamp(v, a, b) {
  v = +v;
  if (!Number.isFinite(v)) return a;
  return Math.max(a, Math.min(b, v));
}

function slimLook(look) {
  if (!look || typeof look !== 'object') return null;
  const max = { b: 3, h: 2, s: 9, f: 4, e: 3, ec: 5, no: 4, mo: 3, hs: 13, hc: 9, fh: 5, t: 7, tc: 9, bo: 5, bc: 9, sh: 3, sc: 9, a: 8 };
  const out = {};
  for (const k in max) {
    let v = look[k] | 0;
    if (v < 0) v = 0;
    if (v > max[k]) v = max[k];
    out[k] = v;
  }
  return out;
}
