'use strict';

// ─────────────────────────────────────────────────
//  Language configs
// ─────────────────────────────────────────────────
const LANGS = {
  da: {
    dictUrl:  'https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/da/index.dic',
    cacheKey: 'stavebien-wordle-words-da-v1',
    regex:    /^[a-zæøå]{5}$/,
    keyboard: [
      ['q','w','e','r','t','y','u','i','o','p','å'],
      ['a','s','d','f','g','h','j','k','l','æ','ø'],
      ['ENTER','z','x','c','v','b','n','m','DEL'],
    ],
    ui: {
      loading:   () => 'Henter danske ord…',
      newGame:   () => 'Nyt ord',
      notWord:   () => 'Ikke et gyldigt ord',
      notEnough: () => 'For få bogstaver',
      won:       n  => ['Fantastisk!','Flot klaret!','Imponerende!','Godt!','Pænt!','Phew…'][Math.min(n - 1, 5)],
      lost:      w  => `Ordet var "${w.toUpperCase()}"`,
    },
  },
  en: {
    dictUrl:  'https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/en/index.dic',
    cacheKey: 'stavebien-wordle-words-en-v1',
    regex:    /^[a-z]{5}$/,
    keyboard: [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['ENTER','z','x','c','v','b','n','m','DEL'],
    ],
    ui: {
      loading:   () => 'Loading English words…',
      newGame:   () => 'New word',
      notWord:   () => 'Not a valid word',
      notEnough: () => 'Too few letters',
      won:       n  => ['Genius!','Magnificent!','Impressive!','Splendid!','Great!','Phew…'][Math.min(n - 1, 5)],
      lost:      w  => `The word was "${w.toUpperCase()}"`,
    },
  },
};

// ─────────────────────────────────────────────────
//  DB – shares user/profile keys with spelling bee
// ─────────────────────────────────────────────────
const DB = {
  K: {
    users:  'stavebien-users',
    active: 'stavebien-active',
    stats:  u => `stavebien-wordle-stats-${u}`,
    save:   u => `stavebien-wordle-save-${u}`,
  },
  _g: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  _s: (k, v) => localStorage.setItem(k, JSON.stringify(v)),

  getUsers:   ()    => DB._g(DB.K.users) || [],
  getActive:  ()    => DB._g(DB.K.active) || null,
  setActive:  u     => DB._s(DB.K.active, u),
  addUser:    u     => { const us = DB.getUsers(); if (!us.includes(u)) { us.push(u); DB._s(DB.K.users, us); } },
  removeUser: u     => {
    DB._s(DB.K.users, DB.getUsers().filter(x => x !== u));
    if (DB.getActive() === u) DB._s(DB.K.active, null);
    // Remove all data for this user across both games
    [DB.K.stats(u), DB.K.save(u),
     `stavebien-save-${u}`, `stavebien-hist-${u}`].forEach(k => localStorage.removeItem(k));
  },

  getStats: u => {
    const d = DB._g(DB.K.stats(u));
    const blank = () => ({ played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0] });
    return d || { da: blank(), en: blank() };
  },
  setStats: (u, v) => DB._s(DB.K.stats(u), v),

  getSave:   u    => DB._g(DB.K.save(u)),
  setSave:   (u, v) => DB._s(DB.K.save(u), v),
  clearSave: u    => localStorage.removeItem(DB.K.save(u)),
};

// ─────────────────────────────────────────────────
//  Game state
// ─────────────────────────────────────────────────
const S = {
  lang:         'da',
  wordCache:    { da: null, en: null },
  answer:       '',
  guesses:      [],      // committed guess strings
  currentInput: '',      // letters typed for current row
  state:        'playing', // 'playing' | 'won' | 'lost'
  revealing:    false,   // block input during reveal animation
};

const WORD_LEN    = 5;
const MAX_GUESSES = 6;
const REVEAL_MS   = 290; // ms per tile during reveal

// ─────────────────────────────────────────────────
//  Word loading
// ─────────────────────────────────────────────────
async function loadWords(lang) {
  if (S.wordCache[lang]) return S.wordCache[lang];

  const cfg    = LANGS[lang];
  const cached = localStorage.getItem(cfg.cacheKey);
  if (cached) {
    const words = JSON.parse(cached);
    S.wordCache[lang] = words;
    return words;
  }

  const resp = await fetch(cfg.dictUrl);
  const text = await resp.text();
  const seen = new Set();
  const lines = text.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const w = lines[i].split('/')[0].trim().toLowerCase();
    if (cfg.regex.test(w)) seen.add(w);
  }
  const words = [...seen];
  localStorage.setItem(cfg.cacheKey, JSON.stringify(words));
  S.wordCache[lang] = words;
  return words;
}

// ─────────────────────────────────────────────────
//  Puzzle logic
// ─────────────────────────────────────────────────
function pickAnswer(words) {
  return words[Math.floor(Math.random() * words.length)];
}

// Returns array of 'correct' | 'present' | 'absent' for each position
function evaluateGuess(guess, answer) {
  const result    = Array(WORD_LEN).fill('absent');
  const remaining = answer.split('');

  // Pass 1: correct positions
  for (let i = 0; i < WORD_LEN; i++) {
    if (guess[i] === answer[i]) {
      result[i]    = 'correct';
      remaining[i] = null;
    }
  }
  // Pass 2: present (right letter, wrong place)
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === 'correct') continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      result[i]     = 'present';
      remaining[idx] = null;
    }
  }
  return result;
}

// Best state per letter for keyboard colouring
function getLetterStates() {
  const ORDER = { correct: 3, present: 2, absent: 1 };
  const states = {};
  for (const g of S.guesses) {
    const ev = evaluateGuess(g, S.answer);
    g.split('').forEach((ch, i) => {
      const s = ev[i];
      if (!states[ch] || ORDER[s] > ORDER[states[ch]]) states[ch] = s;
    });
  }
  return states;
}

// ─────────────────────────────────────────────────
//  Rendering
// ─────────────────────────────────────────────────
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    row.id = `row-${r}`;
    for (let c = 0; c < WORD_LEN; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }

  // Restore committed guesses (no animation on restore)
  S.guesses.forEach((g, r) => {
    const ev = evaluateGuess(g, S.answer);
    g.split('').forEach((ch, c) => {
      const tile = document.getElementById(`tile-${r}-${c}`);
      tile.textContent   = ch.toUpperCase();
      tile.dataset.state = ev[c];
    });
  });

  // Restore partial current input
  S.currentInput.split('').forEach((ch, c) => {
    const tile = document.getElementById(`tile-${S.guesses.length}-${c}`);
    if (tile) { tile.textContent = ch.toUpperCase(); tile.dataset.state = 'tbd'; }
  });
}

function renderKeyboard() {
  const kb  = document.getElementById('keyboard');
  const cfg = LANGS[S.lang];
  kb.innerHTML = '';

  for (const row of cfg.keyboard) {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row';
    for (const key of row) {
      const btn = document.createElement('button');
      btn.className  = 'kb-key';
      btn.type       = 'button';
      btn.dataset.key = key;
      if (key === 'ENTER' || key === 'DEL') btn.classList.add('wide');
      btn.textContent = key === 'DEL' ? '⌫' : key === 'ENTER' ? 'Enter' : key.toUpperCase();
      btn.addEventListener('click', () => handleKey(key));
      rowEl.appendChild(btn);
    }
    kb.appendChild(rowEl);
  }
  updateKeyboardStates();
}

function updateKeyboardStates() {
  const states = getLetterStates();
  document.querySelectorAll('.kb-key').forEach(btn => {
    const k = btn.dataset.key.toLowerCase();
    if (states[k]) btn.dataset.state = states[k];
    else            delete btn.dataset.state;
  });
}

async function revealRow(rowIdx, evaluations) {
  S.revealing = true;
  for (let c = 0; c < WORD_LEN; c++) {
    const tile = document.getElementById(`tile-${rowIdx}-${c}`);
    await delay(c === 0 ? 0 : REVEAL_MS);
    tile.classList.add('reveal');
    // Apply colour at the halfway point of the animation
    setTimeout(() => { tile.dataset.state = evaluations[c]; }, REVEAL_MS * 0.5);
    tile.addEventListener('animationend', () => tile.classList.remove('reveal'), { once: true });
  }
  await delay(REVEAL_MS + 120); // wait for last tile to finish
  S.revealing = false;
}

function bounceRow(rowIdx) {
  for (let c = 0; c < WORD_LEN; c++) {
    const tile = document.getElementById(`tile-${rowIdx}-${c}`);
    setTimeout(() => {
      tile.classList.add('bounce');
      tile.addEventListener('animationend', () => tile.classList.remove('bounce'), { once: true });
    }, 75 * c);
  }
}

function shakeRow(rowIdx) {
  const row = document.getElementById(`row-${rowIdx}`);
  if (!row) return;
  row.classList.remove('row-shake');
  void row.offsetWidth; // force reflow
  row.classList.add('row-shake');
  row.addEventListener('animationend', () => row.classList.remove('row-shake'), { once: true });
}

function showMessage(text, type = 'ok', dur = 2400) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className   = `vis msg-${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, dur);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────────
//  Input handling
// ─────────────────────────────────────────────────
async function handleKey(key) {
  if (S.state !== 'playing' || S.revealing) return;
  const k   = String(key).toLowerCase();
  const cfg = LANGS[S.lang];

  if (k === 'enter') {
    await submitGuess();
    return;
  }

  if (k === 'del' || k === 'backspace') {
    if (S.currentInput.length > 0) {
      const len = S.currentInput.length;
      S.currentInput = S.currentInput.slice(0, -1);
      const tile = document.getElementById(`tile-${S.guesses.length}-${len - 1}`);
      if (tile) { tile.textContent = ''; delete tile.dataset.state; }
    }
    return;
  }

  // Only accept letters in this language's keyboard
  const validLetters = cfg.keyboard.flat().filter(x => x !== 'ENTER' && x !== 'DEL');
  if (!validLetters.includes(k)) return;

  if (S.currentInput.length < WORD_LEN) {
    S.currentInput += k;
    const c    = S.currentInput.length - 1;
    const tile = document.getElementById(`tile-${S.guesses.length}-${c}`);
    if (tile) {
      tile.textContent   = k.toUpperCase();
      tile.dataset.state = 'tbd';
      tile.classList.remove('pop');
      void tile.offsetWidth;
      tile.classList.add('pop');
      tile.addEventListener('animationend', () => tile.classList.remove('pop'), { once: true });
    }
  }
}

async function submitGuess() {
  const cfg = LANGS[S.lang];

  if (S.currentInput.length < WORD_LEN) {
    showMessage(cfg.ui.notEnough(), 'warn', 1800);
    shakeRow(S.guesses.length);
    return;
  }

  const words = S.wordCache[S.lang];
  if (!words || !words.includes(S.currentInput)) {
    showMessage(cfg.ui.notWord(), 'bad', 1800);
    shakeRow(S.guesses.length);
    return;
  }

  const guess  = S.currentInput;
  const rowIdx = S.guesses.length;
  S.currentInput = '';

  // Set letters in tiles (already set while typing, but ensure correct content)
  guess.split('').forEach((ch, c) => {
    const tile = document.getElementById(`tile-${rowIdx}-${c}`);
    if (tile) tile.textContent = ch.toUpperCase();
  });

  const ev = evaluateGuess(guess, S.answer);
  S.guesses.push(guess);

  await revealRow(rowIdx, ev);
  updateKeyboardStates();

  const won = ev.every(e => e === 'correct');

  if (won) {
    bounceRow(rowIdx);
    S.state = 'won';
    showMessage(cfg.ui.won(S.guesses.length), 'ok', 3500);
    recordStats(true, S.guesses.length);
    autoSave();
    setTimeout(showNewBtn, 2200);
  } else if (S.guesses.length >= MAX_GUESSES) {
    S.state = 'lost';
    showMessage(cfg.ui.lost(S.answer), 'bad', 4500);
    recordStats(false, MAX_GUESSES);
    autoSave();
    setTimeout(showNewBtn, 2800);
  } else {
    autoSave();
  }
}

function showNewBtn() {
  document.getElementById('btn-new-wordle').classList.remove('hidden');
}

// ─────────────────────────────────────────────────
//  Stats
// ─────────────────────────────────────────────────
function recordStats(won, guessCount) {
  const user = DB.getActive();
  if (!user) return;
  const stats = DB.getStats(user);
  const s = stats[S.lang];
  s.played++;
  if (won) {
    s.wins++;
    s.streak++;
    if (s.streak > s.maxStreak) s.maxStreak = s.streak;
    s.dist[guessCount - 1]++;
  } else {
    s.streak = 0;
  }
  DB.setStats(user, stats);
}

// ─────────────────────────────────────────────────
//  Save / resume
// ─────────────────────────────────────────────────
function autoSave() {
  const user = DB.getActive();
  if (!user) return;
  DB.setSave(user, {
    lang:    S.lang,
    answer:  S.answer,
    guesses: S.guesses,
    state:   S.state,
  });
}

function resumeSave(save) {
  S.lang         = save.lang;
  S.answer       = save.answer;
  S.guesses      = save.guesses || [];
  S.state        = save.state   || 'playing';
  S.currentInput = '';
}

// ─────────────────────────────────────────────────
//  Start / new game
// ─────────────────────────────────────────────────
function startGame(answer) {
  S.answer       = answer;
  S.guesses      = [];
  S.currentInput = '';
  S.state        = 'playing';
  S.revealing    = false;
  document.getElementById('btn-new-wordle').classList.add('hidden');
  document.getElementById('message').className = '';
  renderBoard();
  renderKeyboard();
  updateLangUI();
  autoSave();
}

async function loadAndStart(lang, { resume = true } = {}) {
  S.lang = lang;
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('game').classList.add('hidden');
  document.getElementById('loading-text').textContent = LANGS[lang].ui.loading();

  try {
    await loadWords(lang);
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');

    if (resume) {
      const user = DB.getActive();
      const save = user ? DB.getSave(user) : null;
      if (save && save.lang === lang && save.answer) {
        // Make sure saved answer is still in the word list (language may have been recached)
        resumeSave(save);
        renderBoard();
        renderKeyboard();
        updateLangUI();
        if (S.state !== 'playing') showNewBtn();
        return;
      }
    }

    startGame(pickAnswer(S.wordCache[lang]));
  } catch (err) {
    document.getElementById('loading-text').textContent = 'Fejl – prøv igen / Error – try again';
    console.error(err);
  }
}

function newGame() {
  const words = S.wordCache[S.lang];
  if (!words || !words.length) return;
  startGame(pickAnswer(words));
}

function switchLang(lang) {
  if (lang === S.lang) return;
  loadAndStart(lang, { resume: false });
}

// ─────────────────────────────────────────────────
//  Profile modal
// ─────────────────────────────────────────────────
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateUserBadge() {
  const btn = document.getElementById('btn-user');
  const u   = DB.getActive();
  if (u) {
    btn.textContent = u.charAt(0).toUpperCase();
    btn.classList.add('has-user');
  } else {
    btn.textContent = '👤';
    btn.classList.remove('has-user');
  }
}

function openUserModal() {
  renderModalContent();
  document.getElementById('user-modal').showModal();
}

function closeUserModal() {
  document.getElementById('user-modal').close();
}

function renderModalContent() {
  const body   = document.getElementById('modal-body');
  const active = DB.getActive();
  const users  = DB.getUsers();
  const L      = S.lang;

  if (!active) {
    // ── No active user: show create/pick screen ──
    body.innerHTML = `
      <div class="modal-title">${L === 'da' ? 'Vælg profil' : 'Choose profile'}</div>
      <div class="modal-hint">${L === 'da'
        ? 'Opret en profil for at gemme dine resultater.'
        : 'Create a profile to save your results.'}</div>
      <div class="mlabel">${L === 'da' ? 'Ny profil' : 'New profile'}</div>
      <div id="create-form">
        <input id="uname-input" type="text" maxlength="16"
               placeholder="${L === 'da' ? 'Dit navn…' : 'Your name…'}"
               autocomplete="off" spellcheck="false">
        <button class="mbtn primary" id="btn-create">${L === 'da' ? 'Opret' : 'Create'}</button>
      </div>
      ${users.length ? `
        <div class="mdivider"></div>
        <div class="mlabel">${L === 'da' ? 'Eksisterende profiler' : 'Existing profiles'}</div>
        <ul class="user-list">
          ${users.map(u => `<li><button class="uswitch-btn" data-u="${escHtml(u)}">${escHtml(u)}</button></li>`).join('')}
        </ul>` : ''}
    `;
    document.getElementById('btn-create').onclick = () => {
      const name = document.getElementById('uname-input').value.trim();
      if (!name) return;
      DB.addUser(name);
      DB.setActive(name);
      updateUserBadge();
      renderModalContent();
    };
    document.getElementById('uname-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('btn-create').click();
    });
    body.querySelectorAll('.uswitch-btn').forEach(btn => {
      btn.onclick = () => { DB.setActive(btn.dataset.u); updateUserBadge(); renderModalContent(); };
    });
    return;
  }

  // ── Active user: show stats ──────────────────────
  const stats   = DB.getStats(active);
  const s       = stats[L];
  const winPct  = s.played > 0 ? Math.round(s.wins / s.played * 100) : 0;
  const maxDist = Math.max(...s.dist, 1);

  const labels = L === 'da'
    ? ['Spillet', 'Vundet %', 'Stribe', 'Bedste']
    : ['Played',  'Win %',    'Streak', 'Best'];

  const distHtml = s.dist.map((v, i) => {
    const pct    = v > 0 ? Math.max(v / maxDist * 100, 8) : 0;
    const isBest = v > 0 && v === Math.max(...s.dist);
    return `
      <div class="wdist-row">
        <span class="wdist-lbl">${i + 1}</span>
        <div class="wdist-bar-wrap">
          <div class="wdist-bar${isBest ? ' best' : ''}" style="width:${pct}%">${v > 0 ? v : ''}</div>
        </div>
      </div>`;
  }).join('');

  body.innerHTML = `
    <div class="mprofile-head">
      <div class="mavatar">${escHtml(active.charAt(0).toUpperCase())}</div>
      <div class="musername">${escHtml(active)}</div>
    </div>
    <div class="wstats-grid">
      <div class="wstat"><div class="wstat-val">${s.played}</div><div class="wstat-lbl">${labels[0]}</div></div>
      <div class="wstat"><div class="wstat-val">${winPct}</div><div class="wstat-lbl">${labels[1]}</div></div>
      <div class="wstat"><div class="wstat-val">${s.streak}</div><div class="wstat-lbl">${labels[2]}</div></div>
      <div class="wstat"><div class="wstat-val">${s.maxStreak}</div><div class="wstat-lbl">${labels[3]}</div></div>
    </div>
    <div class="mlabel">${L === 'da' ? 'Gæt-fordeling' : 'Guess distribution'}</div>
    <div class="wdist">${distHtml}</div>
    <div class="mdivider"></div>
    <a href="index.html" class="mbtn" style="display:block;text-align:center;text-decoration:none;margin-bottom:12px;">
      ${L === 'da' ? '🐝 Gå til Stavebien' : '🐝 Go to Stavebien'}
    </a>
    <div class="mfooter">
      <button class="mbtn small" id="btn-switch-user">${L === 'da' ? 'Skift profil' : 'Switch profile'}</button>
      <button class="mbtn small danger" id="btn-delete-user">${L === 'da' ? 'Slet profil' : 'Delete profile'}</button>
    </div>
  `;

  document.getElementById('btn-switch-user').onclick = () => {
    DB.setActive(null);
    updateUserBadge();
    renderModalContent();
  };
  document.getElementById('btn-delete-user').onclick = () => {
    const msg = L === 'da'
      ? `Slet profilen "${active}"? Dette kan ikke fortrydes.`
      : `Delete profile "${active}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    DB.removeUser(active);
    updateUserBadge();
    renderModalContent();
  };
}

// ─────────────────────────────────────────────────
//  Lang UI sync
// ─────────────────────────────────────────────────
function updateLangUI() {
  document.getElementById('btn-lang-da').classList.toggle('active', S.lang === 'da');
  document.getElementById('btn-lang-en').classList.toggle('active', S.lang === 'en');
  const newBtn = document.getElementById('btn-new-wordle');
  if (!newBtn.classList.contains('hidden')) newBtn.textContent = LANGS[S.lang].ui.newGame();
}

// ─────────────────────────────────────────────────
//  Bootstrap
// ─────────────────────────────────────────────────
document.getElementById('btn-lang-da').addEventListener('click', () => switchLang('da'));
document.getElementById('btn-lang-en').addEventListener('click', () => switchLang('en'));
document.getElementById('btn-user').addEventListener('click', openUserModal);
document.getElementById('modal-close').addEventListener('click', closeUserModal);
document.getElementById('btn-new-wordle').addEventListener('click', newGame);

// Close modal on backdrop click
document.getElementById('user-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('user-modal')) closeUserModal();
});

// Physical keyboard support
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (document.getElementById('user-modal').open) return;
  if (e.key === 'Enter')     { e.preventDefault(); handleKey('ENTER');     return; }
  if (e.key === 'Backspace') { e.preventDefault(); handleKey('DEL');       return; }
  if (e.key.length === 1)    { handleKey(e.key); }
});

// Auto-save on tab/window hide
document.addEventListener('visibilitychange', () => {
  if (document.hidden) autoSave();
});

updateUserBadge();
loadAndStart('da');
