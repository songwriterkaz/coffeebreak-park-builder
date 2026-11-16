// Free Workers Durable Object room for Coffeebreak Park Builder.
// Names and looks only. Nothing is stored after the session ends. No chat.

const MAX = 32;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });
    if (request.headers.get('Upgrade') === 'websocket') {
      const id = env.ROOM.idFromName('park');
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
  };
}

export class ParkRoom {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 426, headers: cors() });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    const id = crypto.randomUUID().slice(0, 10);
    server.serializeAttachment({ id, name: '', look: null, x: 0, y: 0, z: 46, r: 0, a: 'idle', joined: false });
    const others = [];
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === server) continue;
      const s = ws.deserializeAttachment() || {};
      if (s.joined) others.push({ id: s.id, name: s.name, look: s.look, x: s.x, y: s.y, z: s.z, r: s.r, a: s.a });
    }
    if (others.length >= MAX) {
      server.send(JSON.stringify({ t: 'full' }));
      try { server.close(1013, 'Park is full'); } catch (e) {}
    } else {
      server.send(JSON.stringify({ t: 'hello', id, players: others }));
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    let msg;
    try { msg = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw)); }
    catch (e) { return; }
    const s = ws.deserializeAttachment() || {};
    if (msg.t === 'join') {
      const name = sanitize(msg.name);
      const look = slimLook(msg.look);
      if (!name || !look) return;
      s.name = name;
      s.look = look;
      s.joined = true;
      if (typeof msg.x === 'number') {
        s.x = clamp(msg.x, -300, 300);
        s.y = clamp(msg.y || 0, 0, 40);
        s.z = clamp(msg.z, -300, 300);
        s.r = +msg.r || 0;
        s.a = msg.a === 'walk' || msg.a === 'jump' ? msg.a : 'idle';
      }
      ws.serializeAttachment(s);
      this.broadcast(ws, { t: 'join', id: s.id, name: s.name, look: s.look, x: s.x, y: s.y, z: s.z, r: s.r, a: s.a });
      return;
    }
    if (msg.t === 'm' && s.joined) {
      s.x = clamp(+msg.x, -300, 300);
      s.y = clamp(+msg.y || 0, 0, 40);
      s.z = clamp(+msg.z, -300, 300);
      s.r = +msg.r || 0;
      s.a = msg.a === 'walk' || msg.a === 'jump' ? msg.a : 'idle';
      ws.serializeAttachment(s);
      this.broadcast(ws, { t: 'm', id: s.id, x: s.x, y: s.y, z: s.z, r: s.r, a: s.a });
      return;
    }
    if (msg.t === 'look' && s.joined) {
      const look = slimLook(msg.look);
      if (!look) return;
      s.look = look;
      if (msg.name) s.name = sanitize(msg.name) || s.name;
      ws.serializeAttachment(s);
      this.broadcast(ws, { t: 'look', id: s.id, look: s.look, name: s.name });
    }
  }

  async webSocketClose(ws) {
    const s = ws.deserializeAttachment() || {};
    if (s.joined) this.broadcast(ws, { t: 'leave', id: s.id });
  }

  async webSocketError(ws) {
    return this.webSocketClose(ws);
  }

  broadcast(except, msg) {
    const data = JSON.stringify(msg);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(data); } catch (e) {}
    }
  }
}

function sanitize(n) {
  if (typeof n !== 'string') return '';
  n = n.replace(/\s+/g, ' ').trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 '\-]{0,15}$/.test(n)) return '';
  return n.slice(0, 16);
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
