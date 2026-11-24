/* Coffeebreak Park Builder: Suno playlist player. Songs from suno.com/@coffeebreakkobs. */
(function () {
  var SONGS = [
    { id: 'c35b53e2-855e-48d3-b023-cb76d94d8e82', title: 'Rodeo x kiss me please me squeeze… x Broken Wings (Mashup)' },
    { id: '067f7c5f-b65e-4577-9b96-2939e1df663a', title: 'gumballtrending' },
    { id: '315455fb-f1a0-435a-83e0-91d642a9ab31', title: 'Pink moondust on my dashboard (Remix)' },
    { id: '5ebc4f6c-fed4-46cf-8a1b-0fce59897474', title: 'I dont understand (Remix)' },
    { id: 'ba1b115d-4f3a-468c-92f1-d4a0ac345527', title: 'Toffee Apple Drip' },
    { id: 'ffbf2534-5fd8-4d01-a6d1-2d358e61b3a6', title: 'Bunny Boop' },
    { id: '23146689-8e9a-4ac3-85fa-13ea3efba8ff', title: 'Turn That Bedroom Into A Rodeo' },
    { id: 'd9293d64-f8ec-48ff-a8e6-66da0f5936b3', title: 'FIRE-PINL' },
    { id: '04c941f4-ec79-44a7-971e-9123d7254a6f', title: "Breakin' the Illusion" },
    { id: '96d80fdd-8f99-4235-9e7d-fbb1a78a8ea5', title: 'Worn Slap Out' },
    { id: '8e20f1f5-af62-415f-b717-aeb3347dfd6c', title: 'Home Sweet Home' },
    { id: 'da7e16d6-12ab-4d78-8d0a-4913ced472b4', title: 'Scared' },
    { id: '4d21c206-1156-4a36-868e-a5fab42fef64', title: 'CoffeeBreak with the King' },
    { id: 'e9bd0636-6021-4ee5-99fd-2c9d528c6b6d', title: 'Fantasies of Control' },
    { id: '6d76c3bf-2b21-4776-b6f6-c36c2522b2f5', title: 'Manifest That Cash' },
    { id: '1936ddef-692d-4579-ab88-73ea5721e5fe', title: 'Fire in a Cup' },
    { id: '8f48250c-620e-4637-8eb7-30bb22ae5866', title: 'Finish Line' },
    { id: '1a1ee040-d018-4a81-ac00-c76370a42b62', title: 'Angry Liver Sugar' },
    { id: '6f0b2ff7-aed4-4557-8a02-7972735d951d', title: 'Mean' }
  ];

  var idx = 0;
  var audio = null;
  var fromGame = false;

  function $(id) { return document.getElementById(id); }

  function songUrl(id) {
    return 'https://cdn1.suno.ai/' + id + '.mp3';
  }

  function song() {
    return SONGS[idx] || SONGS[0];
  }

  function closeOtherPanels() {
    document.querySelectorAll('.panel.show').forEach(function (p) {
      if (p.id !== 'suno') p.classList.remove('show');
    });
  }

  function paint() {
    var s = song();
    var title = $('sunoTitle');
    var toggle = $('sunoToggle');
    var now = $('now');
    var status = $('sunoStatus');
    if (title) title.textContent = s ? s.title : '';
    var isOn = audio && !audio.paused && !audio.ended;
    if (toggle) {
      toggle.textContent = isOn ? 'Pause' : 'Play';
      toggle.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    }
    if (now && isOn && s) {
      now.style.display = '';
      now.textContent = 'Playing ' + s.title;
    }
    if (status && isOn) status.textContent = '';
  }

  function ensure() {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.addEventListener('ended', function () { next(); });
    audio.addEventListener('error', function () {
      var status = $('sunoStatus');
      if (status) {
        status.textContent = 'This song could not be loaded from Suno\'s public audio link.';
      }
      paint();
    });
    audio.addEventListener('play', paint);
    audio.addEventListener('pause', paint);
    return audio;
  }

  function load(i) {
    idx = (i + SONGS.length) % SONGS.length;
    var s = song();
    var a = ensure();
    a.src = songUrl(s.id);
    a.load();
    paint();
  }

  function playAt(i) {
    fromGame = false;
    if (window.__game && typeof window.__game.stopMusic === 'function') {
      window.__game.stopMusic();
    }
    load(i);
    var pending = ensure().play();
    if (pending && pending.catch) pending.catch(function () { paint(); });
    paint();
  }

  function playPause() {
    var a = ensure();
    if (!a.src) {
      playAt(idx);
      return;
    }
    if (a.paused) {
      fromGame = false;
      if (window.__game && typeof window.__game.stopMusic === 'function') {
        window.__game.stopMusic();
      }
      var pending = a.play();
      if (pending && pending.catch) pending.catch(function () { paint(); });
    } else {
      a.pause();
    }
    paint();
  }

  function next() {
    playAt(idx + 1);
  }

  function back() {
    playAt(idx - 1);
  }

  function pauseForGame() {
    fromGame = true;
    if (audio && !audio.paused) audio.pause();
  }

  function openPanel() {
    var panel = $('suno');
    if (!panel) return;
    var was = panel.classList.contains('show');
    closeOtherPanels();
    if (was) panel.classList.remove('show');
    else panel.classList.add('show');
  }

  function boot() {
    var list = $('sunoList');
    if (list) {
      SONGS.forEach(function (s, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'suno-track';
        b.textContent = s.title;
        b.addEventListener('click', function () { playAt(i); });
        list.appendChild(b);
      });
    }
    var playBtn = $('sunoToggle');
    var skipBtn = $('sunoSkip');
    var backBtn = $('sunoBack');
    var openBtn = $('bSuno');
    if (playBtn) playBtn.addEventListener('click', playPause);
    if (skipBtn) skipBtn.addEventListener('click', next);
    if (backBtn) backBtn.addEventListener('click', back);
    if (openBtn) openBtn.addEventListener('click', openPanel);
    load(0);
  }

  window.__sunoPlayer = {
    songs: SONGS,
    playPause: playPause,
    next: next,
    back: back,
    pauseForGame: pauseForGame,
    open: openPanel
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
