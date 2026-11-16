// Realtime park players via a free Cloudflare Durable Object WebSocket.
export const NET_URL = 'wss://cb-park.coffeebreaks.workers.dev';

export function connectPark({ name, look, getState, onHello, onJoin, onMove, onLook, onLeave, onStatus }) {
  let ws = null, timer = 0, closed = false, myId = null, tries = 0;
  function connect() {
    if (closed) return;
    try { ws = new WebSocket(NET_URL); }
    catch (e) { if (onStatus) onStatus('offline'); return; }
    ws.onopen = () => {
      tries = 0;
      if (onStatus) onStatus('online');
      const st = getState() || {};
      ws.send(JSON.stringify({ t: 'join', name, look, x: st.x, y: st.y, z: st.z, r: st.r, a: st.a }));
    };
    ws.onmessage = ev => {
      let m;
      try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.t === 'hello') { myId = m.id; if (onHello) onHello(m); }
      else if (m.t === 'join') { if (onJoin) onJoin(m); }
      else if (m.t === 'm') { if (onMove) onMove(m); }
      else if (m.t === 'look') { if (onLook) onLook(m); }
      else if (m.t === 'leave') { if (onLeave) onLeave(m); }
      else if (m.t === 'full') { if (onStatus) onStatus('full'); }
    };
    ws.onclose = () => {
      if (onStatus) onStatus('offline');
      if (closed) return;
      tries += 1;
      setTimeout(connect, Math.min(8000, 1000 * tries));
    };
    ws.onerror = () => {};
  }
  connect();
  timer = setInterval(() => {
    if (!ws || ws.readyState !== 1) return;
    const st = getState() || {};
    ws.send(JSON.stringify({ t: 'm', x: st.x, y: st.y, z: st.z, r: st.r, a: st.a }));
  }, 100);
  return {
    get id() { return myId; },
    updateLook(nextLook, nextName) {
      if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'look', look: nextLook, name: nextName }));
    },
    close() {
      closed = true;
      clearInterval(timer);
      try { if (ws) ws.close(); } catch (e) {}
    },
  };
}
