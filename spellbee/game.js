'use strict';

// ── Language config ──────────────────────────────────────────
const LANGS = {
  da: {
    dictUrl:  'https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/da/index.dic',
    cacheKey: 'stavebien-words-da-v3',
    regex:    /^[a-zæøå]{4,}$/,
    ui: {
      loading:        'Henter dansk ordbog…',
      generating:     'Genererer puslespil…',
      foundLabel:     'Fundne ord',
      foundOf:        (f, t) => `<b>${f}</b> af <b>${t}</b> ord fundet`,
      scoreText:      s => `<b>${s}</b> point`,
      btnDelete:      '← Slet',
      btnShuffle:     '↺ Bland',
      btnEnter:       'Indtast →',
      btnNew:         'Nyt puslespil',
      msgTooShort:    'Mindst 4 bogstaver',
      msgNeedsCenter: c => `Skal indeholde "${c.toUpperCase()}"`,
      msgAlready:     'Allerede fundet!',
      msgNotInDict:   'Ikke i ordbogen',
      msgPangram:     pts => `🎉 Pangram! +${pts}`,
      msgGood:        pts => `✓ +${pts} point`,
      msgAllFound:    '🏆 Alle ord fundet!',
      msgNoPuzzle:    'Kunne ikke generere puslespil',
      errLoad:        msg => `Fejl: ${msg}. Genindlæs siden.`,
    },
  },
  en: {
    dictUrl:  'https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/en/index.dic',
    cacheKey: 'stavebien-words-en-v1',
    regex:    /^[a-z]{4,}$/,
    ui: {
      loading:        'Loading English dictionary…',
      generating:     'Generating puzzle…',
      foundLabel:     'Found words',
      foundOf:        (f, t) => `<b>${f}</b> of <b>${t}</b> words found`,
      scoreText:      s => `<b>${s}</b> points`,
      btnDelete:      '← Delete',
      btnShuffle:     '↺ Shuffle',
      btnEnter:       'Enter →',
      btnNew:         'New puzzle',
      msgTooShort:    'At least 4 letters',
      msgNeedsCenter: c => `Must contain "${c.toUpperCase()}"`,
      msgAlready:     'Already found!',
      msgNotInDict:   'Not in dictionary',
      msgPangram:     pts => `🎉 Pangram! +${pts}`,
      msgGood:        pts => `✓ +${pts} points`,
      msgAllFound:    '🏆 All words found!',
      msgNoPuzzle:    'Could not generate puzzle',
      errLoad:        msg => `Error: ${msg}. Reload the page.`,
    },
  },
};

// ── Config ──────────────────────────────────────────────────
const MIN_LEN   = 4;
const MIN_VALID = 20;
const MAX_VALID = 150;
const MAX_TRIES = 600;

// ── SVG geometry ────────────────────────────────────────────
// Pointy-top hexagons: circumradius R, center-to-center GAP
const R   = 46;
const GAP = 82;
const CX  = 150;
const CY  = 145;

// [0] = center hex, [1..6] = ring clockwise from top
const CENTERS = (() => {
  const pts = [[CX, CY]];
  for (const deg of [90, 30, -30, -90, -150, 150]) {
    const rad = (deg * Math.PI) / 180;
    pts.push([CX + GAP * Math.cos(rad), CY - GAP * Math.sin(rad)]);
  }
  return pts;
})();

// ── State ───────────────────────────────────────────────────
const S = {
  lang:       'da',
  wordCache:  { da: null, en: null },
  wordList:   [],
  puzzle:     null,
  input:      '',
  found:      [],
  score:      0,
  outerOrder: [],
};

// ── Persistence (localStorage) ────────────────────────────
const DB = {
  K: {
    users:  'stavebien-users',
    active: 'stavebien-active',
    save:   u => `stavebien-save-${u}`,
    hist:   u => `stavebien-hist-${u}`,
  },
  read(key, def) {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? def; } catch { return def; }
  },
  write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },

  getUsers()      { return this.read(this.K.users, []); },
  getActive()     { return this.read(this.K.active, null); },
  setActive(name) {
    if (name === null) localStorage.removeItem(this.K.active);
    else this.write(this.K.active, name);
  },
  addUser(name) {
    const list = this.getUsers();
    if (list.find(u => u.name === name)) return false;
    list.push({ name, createdAt: new Date().toISOString() });
    this.write(this.K.users, list);
    return true;
  },
  removeUser(name) {
    this.write(this.K.users, this.getUsers().filter(u => u.name !== name));
    localStorage.removeItem(this.K.save(name));
    localStorage.removeItem(this.K.hist(name));
    if (this.getActive() === name) this.setActive(null);
  },
  getSave(user)        { return user ? this.read(this.K.save(user), null) : null; },
  setSave(user, data)  { if (user) this.write(this.K.save(user), data); },
  clearSave(user)      { if (user) localStorage.removeItem(this.K.save(user)); },
  getHistory(user)     { return user ? this.read(this.K.hist(user), []) : []; },
  pushHistory(user, r) {
    if (!user) return;
    const h = this.getHistory(user);
    h.unshift(r);
    if (h.length > 50) h.length = 50;
    this.write(this.K.hist(user), h);
  },
};

function autoSave() {
  const user = DB.getActive();
  if (!user || !S.puzzle) return;
  DB.setSave(user, {
    lang:    S.lang,
    letters: S.puzzle.letters,
    center:  S.puzzle.center,
    valid:   [...S.puzzle.validWords],
    found:   S.found,
    score:   S.score,
    savedAt: new Date().toISOString(),
  });
}

function recordHistory(completed) {
  const user = DB.getActive();
  if (!user || !S.puzzle || S.found.length === 0) return;
  DB.pushHistory(user, {
    date:     new Date().toISOString(),
    lang:     S.lang,
    letters:  S.puzzle.letters,
    center:   S.puzzle.center,
    score:    S.score,
    maxScore: S.puzzle.maxScore,
    found:    S.found.length,
    total:    S.puzzle.validWords.size,
    completed,
  });
}

function resumeSave(save) {
  S.lang       = save.lang;
  S.puzzle     = {
    letters:    save.letters,
    center:     save.center,
    validWords: new Set(save.valid),
    maxScore:   save.valid.reduce((s, w) => s + scoreWord(w, save.letters), 0),
  };
  S.found      = save.found;
  S.score      = save.score;
  S.input      = '';
  S.outerOrder = save.letters.filter(l => l !== save.center);
  document.getElementById('btn-lang-da').classList.toggle('active', S.lang === 'da');
  document.getElementById('btn-lang-en').classList.toggle('active', S.lang === 'en');
  renderHive();
  renderInput();
  renderFound();
  updateUIText();
}

// ── Word list loading ────────────────────────────────────────
async function loadWords(lang) {
  if (S.wordCache[lang]) return S.wordCache[lang];

  const { dictUrl, cacheKey, regex } = LANGS[lang];
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      S.wordCache[lang] = JSON.parse(cached);
      return S.wordCache[lang];
    }
  } catch (_) {}

  const res = await fetch(dictUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const raw = await res.text();

  const seen = new Set();
  const lines = raw.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const w = lines[i].split('/')[0].trim().toLowerCase();
    if (regex.test(w)) seen.add(w);
  }

  const words = [...seen];
  try { localStorage.setItem(cacheKey, JSON.stringify(words)); } catch (_) {}
  S.wordCache[lang] = words;
  return words;
}

// ── Scoring ──────────────────────────────────────────────────
function scoreWord(w, letters) {
  const base = w.length === 4 ? 1 : w.length;
  return letters.every(l => w.includes(l)) ? base + 7 : base; // pangram bonus
}

// ── Puzzle generation ────────────────────────────────────────
function makePuzzle(wordList) {
  // Seed candidates: words that use exactly 7 unique letters (guaranteed pangrams)
  const seeds = wordList.filter(w => new Set(w).size === 7);
  if (!seeds.length) return null;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const seed    = seeds[Math.floor(Math.random() * seeds.length)];
    const letters = [...new Set(seed)]; // exactly 7 unique letters

    // All words in the list that only use these 7 letters
    const pool = wordList.filter(w => [...w].every(c => letters.includes(c)));

    let best = null;
    for (const center of letters) {
      const valid = pool.filter(w => w.includes(center));
      if (valid.length >= MIN_VALID && valid.length <= MAX_VALID &&
          (!best || valid.length > best.count)) {
        best = { center, valid, count: valid.length };
      }
    }

    if (best) {
      const maxScore = best.valid.reduce((s, w) => s + scoreWord(w, letters), 0);
      return {
        letters,
        center:     best.center,
        validWords: new Set(best.valid),
        maxScore,
      };
    }
  }
  return null;
}

// ── SVG helpers ──────────────────────────────────────────────
function hexPoints(cx, cy) {
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 2 - (Math.PI / 3) * k; // pointy-top vertex angles
    pts.push(`${(cx + R * Math.cos(a)).toFixed(1)},${(cy - R * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function renderHive() {
  const letters = [S.puzzle.center, ...S.outerOrder];
  const svg = document.getElementById('hive-svg');
  svg.innerHTML = '';

  letters.forEach((letter, i) => {
    const [cx, cy] = CENTERS[i];
    const isCenter  = i === 0;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'hex-cell');
    g.setAttribute('role', 'button');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `Bogstavet ${letter.toUpperCase()}`);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', hexPoints(cx, cy));
    poly.setAttribute('class', isCenter ? 'hex-center' : 'hex-outer');

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', cx);
    txt.setAttribute('y', cy);
    txt.setAttribute('class', 'hex-label');
    txt.textContent = letter.toUpperCase();

    g.appendChild(poly);
    g.appendChild(txt);

    g.addEventListener('click', () => addLetter(letter));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addLetter(letter); }
    });

    svg.appendChild(g);
  });
}

// ── UI text ──────────────────────────────────────────────────
function updateUIText() {
  const ui = LANGS[S.lang].ui;
  document.getElementById('btn-delete').textContent  = ui.btnDelete;
  document.getElementById('btn-shuffle').textContent = ui.btnShuffle;
  document.getElementById('btn-enter').textContent   = ui.btnEnter;
  document.getElementById('btn-new').textContent     = ui.btnNew;
  document.getElementById('found-label').textContent = ui.foundLabel;
  document.getElementById('btn-lang-da').classList.toggle('active', S.lang === 'da');
  document.getElementById('btn-lang-en').classList.toggle('active', S.lang === 'en');
}

// ── User modal ───────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function updateUserBadge() {
  const active = DB.getActive();
  const btn = document.getElementById('btn-user');
  if (active) {
    btn.textContent = active[0].toUpperCase();
    btn.classList.add('has-user');
  } else {
    btn.textContent = '\u{1F464}';
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
  const active = DB.getActive();
  const users  = DB.getUsers();
  const isDa   = S.lang === 'da';
  const el     = document.getElementById('modal-body');

  if (!active) {
    el.innerHTML = `
      <h2 class="modal-title">${isDa ? 'Profil' : 'Profile'}</h2>
      <p class="modal-hint">${isDa
        ? 'Opret en profil for at gemme dine resultater og forts\u00e6tte spil.'
        : 'Create a profile to save your results and resume games.'}</p>
      <form id="create-form" autocomplete="off">
        <input id="uname-input" type="text" maxlength="20"
          placeholder="${isDa ? 'Dit navn\u2026' : 'Your name\u2026'}"
          autocomplete="off" spellcheck="false">
        <button type="submit" class="mbtn primary">${isDa ? 'Opret' : 'Create'}</button>
      </form>
      ${users.length ? `
        <div class="mdivider"></div>
        <p class="mlabel">${isDa ? 'Eksisterende profiler' : 'Existing profiles'}</p>
        <ul class="user-list">
          ${users.map(u => `<li>
            <button class="uswitch-btn" data-name="${escHtml(u.name)}">${escHtml(u.name)}</button>
          </li>`).join('')}
        </ul>` : ''}`;

    el.querySelector('#create-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = el.querySelector('#uname-input').value.trim();
      if (!name) return;
      DB.addUser(name);
      DB.setActive(name);
      updateUserBadge();
      renderModalContent();
    });
    el.querySelectorAll('.uswitch-btn').forEach(btn =>
      btn.addEventListener('click', () => {
        DB.setActive(btn.dataset.name);
        updateUserBadge();
        renderModalContent();
      }));
    return;
  }

  const hist  = DB.getHistory(active);
  const save  = DB.getSave(active);
  const total = hist.reduce((s, r) => s + r.score, 0);
  const best  = hist.length ? Math.max(...hist.map(r => r.score)) : 0;

  el.innerHTML = `
    <div class="mprofile-head">
      <div class="mavatar">${escHtml(active[0].toUpperCase())}</div>
      <div>
        <div class="musername">${escHtml(active)}</div>
        <div class="modal-hint">${hist.length} ${isDa ? 'spil spillet' : 'games played'}</div>
      </div>
    </div>
    <div class="mstats">
      <div class="mstat"><div class="mstat-val">${hist.length}</div><div class="mstat-lbl">${isDa ? 'Spil' : 'Games'}</div></div>
      <div class="mstat"><div class="mstat-val">${best}</div><div class="mstat-lbl">${isDa ? 'Bedste' : 'Best'}</div></div>
      <div class="mstat"><div class="mstat-val">${total}</div><div class="mstat-lbl">Total</div></div>
    </div>
    ${save ? `
    <div class="msection">
      <div class="mlabel">${isDa ? 'Gemt spil' : 'Saved game'}</div>
      <div class="msave-card">
        <div>
          <div class="msave-letters">${save.letters.map(l =>
            l === save.center ? `<b>${l.toUpperCase()}</b>` : l.toUpperCase()).join(' ')}</div>
          <div class="msave-meta">${save.found.length}/${save.valid.length} ${isDa ? 'ord' : 'words'} &middot; ${save.score} ${isDa ? 'point' : 'pts'}</div>
        </div>
        <button class="mbtn primary" id="btn-resume">${isDa ? 'Forts\u00e6t' : 'Resume'}</button>
      </div>
    </div>` : ''}
    ${hist.length ? `
    <div class="msection">
      <div class="mlabel">${isDa ? 'Historik' : 'History'}</div>
      <ul class="mhist">
        ${hist.slice(0, 10).map(r => {
          const d   = new Date(r.date);
          const ds  = d.toLocaleDateString(isDa ? 'da-DK' : 'en-GB', { day: 'numeric', month: 'short' });
          const pct = Math.round((r.found / r.total) * 100);
          return `<li class="mhist-item">
            <span class="mhist-letters">${r.letters.map(l =>
              l === r.center ? `<b>${l.toUpperCase()}</b>` : l.toUpperCase()).join('')}</span>
            <span class="mhist-info">${ds} \u00b7 ${r.lang.toUpperCase()} \u00b7 ${r.score}p \u00b7 ${r.found}/${r.total} ${r.completed ? '\u2713' : ''}</span>
          </li>`;
        }).join('')}
      </ul>
    </div>` : ''}
    <div class="mdivider"></div>
    <div class="mfooter">
      <button class="mbtn small" id="btn-switch">${isDa ? 'Skift bruger' : 'Switch user'}</button>
      <button class="mbtn small danger" id="btn-del">${isDa ? 'Slet profil' : 'Delete'}</button>
    </div>`;

  if (save) {
    el.querySelector('#btn-resume').addEventListener('click', () => {
      if (S.puzzle && S.found.length > 0) recordHistory(false);
      DB.clearSave(active);
      closeUserModal();
      resumeSave(save);
      if (S.wordCache[S.lang]) S.wordList = S.wordCache[S.lang];
    });
  }
  el.querySelector('#btn-switch').addEventListener('click', () => {
    DB.setActive(null);
    updateUserBadge();
    renderModalContent();
  });
  el.querySelector('#btn-del').addEventListener('click', () => {
    const msg = isDa
      ? `Slet profilen "${active}"? Kan ikke fortrydes.`
      : `Delete profile "${active}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    DB.removeUser(active);
    updateUserBadge();
    renderModalContent();
  });
}

// ── Render helpers ───────────────────────────────────────────
function renderInput() {
  const el = document.getElementById('word-display');
  if (!S.input) {
    el.innerHTML = '<span class="ph">…</span>';
    return;
  }
  el.innerHTML = [...S.input]
    .map(ch => ch === S.puzzle.center
      ? `<span class="ctr">${ch.toUpperCase()}</span>`
      : ch.toUpperCase())
    .join('');
}

function renderProgress() {
  const ui    = LANGS[S.lang].ui;
  const total = S.puzzle.validWords.size;
  const found = S.found.length;
  const pct   = total ? (found / total) * 100 : 0;

  document.getElementById('prog-found-text').innerHTML = ui.foundOf(found, total);
  document.getElementById('prog-score-text').innerHTML = ui.scoreText(S.score);

  const fill = document.getElementById('prog-fill');
  fill.style.width = `${pct}%`;
  document.getElementById('prog-track').setAttribute('aria-valuenow', Math.round(pct));
  document.getElementById('prog-card').classList.toggle('all-found', found === total && total > 0);
}

function renderFound() {
  const sorted = [...S.found].sort();
  document.getElementById('found-list').innerHTML = sorted.map(w => {
    const isPangram = S.puzzle.letters.every(l => w.includes(l));
    return `<span class="chip${isPangram ? ' pangram' : ''}">${w}</span>`;
  }).join('');
  renderProgress();
}

let msgTimer = null;
function showMsg(text, type) {
  const el = document.getElementById('message');
  el.textContent = text;
  el.className   = `msg-${type}`;
  el.classList.add('vis');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.classList.remove('vis'), 1700);
}

function shakeInput() {
  const el = document.getElementById('word-display');
  el.classList.remove('shake');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('shake');
}

// ── Input ────────────────────────────────────────────────────
function addLetter(ch) {
  S.input += ch;
  renderInput();
}

function doDelete() {
  if (!S.input) return;
  S.input = S.input.slice(0, -1);
  renderInput();
}

function doShuffle() {
  const arr = [...S.outerOrder];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  S.outerOrder = arr;
  renderHive();
}

function doEnter() {
  const ui   = LANGS[S.lang].ui;
  const word = S.input.toLowerCase();
  S.input = '';
  renderInput();

  if (word.length < MIN_LEN) {
    showMsg(ui.msgTooShort, 'bad'); shakeInput(); return;
  }
  if (!word.includes(S.puzzle.center)) {
    showMsg(ui.msgNeedsCenter(S.puzzle.center), 'bad'); shakeInput(); return;
  }
  if (S.found.includes(word)) {
    showMsg(ui.msgAlready, 'warn'); shakeInput(); return;
  }
  if (!S.puzzle.validWords.has(word)) {
    showMsg(ui.msgNotInDict, 'bad'); shakeInput(); return;
  }

  S.found.push(word);
  const pts       = scoreWord(word, S.puzzle.letters);
  S.score        += pts;
  const isPangram = S.puzzle.letters.every(l => word.includes(l));

  showMsg(isPangram ? ui.msgPangram(pts) : ui.msgGood(pts), 'ok');
  renderFound();
  autoSave();

  if (S.found.length === S.puzzle.validWords.size) {
    recordHistory(true);
    DB.clearSave(DB.getActive());
    setTimeout(() => showMsg(ui.msgAllFound, 'ok'), 500);
  }
}

function onKey(e) {
  if (!S.puzzle || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter')     { doEnter(); }
  else if (e.key === 'Backspace') { e.preventDefault(); doDelete(); }
  else if (e.key.length === 1) {
    const ch = e.key.toLowerCase();
    if (S.puzzle.letters.includes(ch)) addLetter(ch);
  }
}

// ── Game lifecycle ────────────────────────────────────────────
function startGame(puzzle) {
  S.puzzle     = puzzle;
  S.found      = [];
  S.score      = 0;
  S.input      = '';
  S.outerOrder = puzzle.letters.filter(l => l !== puzzle.center);
  renderHive();
  renderInput();
  renderFound();
  updateUIText();
  autoSave();
}

function newPuzzle() {
  if (!S.wordList.length) return;
  if (S.puzzle && S.found.length > 0) {
    recordHistory(false);
    DB.clearSave(DB.getActive());
  }
  const p = makePuzzle(S.wordList);
  if (!p) { showMsg(LANGS[S.lang].ui.msgNoPuzzle, 'bad'); return; }
  startGame(p);
}

async function loadAndStart(lang, { resume = true } = {}) {
  const loadEl  = document.getElementById('loading');
  const loadTxt = document.getElementById('loading-text');
  const gameEl  = document.getElementById('game');
  const ui      = LANGS[lang].ui;

  loadEl.classList.remove('hidden');
  gameEl.classList.add('hidden');

  try {
    loadTxt.textContent = ui.loading;
    const words = await loadWords(lang);
    S.wordList  = words;

    if (resume) {
      const save = DB.getSave(DB.getActive());
      if (save && save.lang === lang) {
        loadEl.classList.add('hidden');
        gameEl.classList.remove('hidden');
        resumeSave(save);
        return;
      }
    }

    loadTxt.textContent = ui.generating;
    const puzzle = makePuzzle(words);
    if (!puzzle) throw new Error(ui.msgNoPuzzle);

    loadEl.classList.add('hidden');
    gameEl.classList.remove('hidden');
    startGame(puzzle);

  } catch (err) {
    loadTxt.textContent = LANGS[lang].ui.errLoad(err.message);
  }
}

async function switchLang(lang) {
  if (lang === S.lang) return;
  if (S.puzzle && S.found.length > 0) recordHistory(false);
  S.lang = lang;
  await loadAndStart(lang, { resume: false });
}

// ── Bootstrap ─────────────────────────────────────────────────
window.addEventListener('beforeunload', e => {
  if (S.found.length > 0) {
    e.preventDefault();
    e.returnValue = ''; // required for Chrome to show the dialog
  }
});

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', onKey);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') autoSave();
  });
  document.getElementById('btn-delete').addEventListener('click', doDelete);
  document.getElementById('btn-shuffle').addEventListener('click', doShuffle);
  document.getElementById('btn-enter').addEventListener('click', doEnter);
  document.getElementById('btn-new').addEventListener('click', newPuzzle);
  document.getElementById('btn-lang-da').addEventListener('click', () => switchLang('da'));
  document.getElementById('btn-lang-en').addEventListener('click', () => switchLang('en'));
  document.getElementById('btn-user').addEventListener('click', openUserModal);
  document.getElementById('modal-close').addEventListener('click', closeUserModal);
  document.getElementById('user-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeUserModal();
  });
  updateUserBadge();
  loadAndStart('da');
});
