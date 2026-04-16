/* ─────────────────────────────────────────────────────────────────────────────
   lang.js  —  EN / DA toggle for aaannndddeeerrrsss.com
   Uses data-i18n="key" attributes on elements. Persists choice in localStorage.
───────────────────────────────────────────────────────────────────────────── */

/* ── Universal page-transition fade ── */
(function () {
  // Viewport-proportional rem scale: 16px at 1512px (MacBook 14" M1 reference).
  // This makes all rem-based values scale consistently on any screen width.
  // Font-smoothing unifies antialiasing between Safari and Chrome on macOS.
  var earlyStyle = document.createElement('style');
  earlyStyle.textContent =
    'html{font-size:max(10px,1.0583vw)}' +
    '*{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}';
  document.head.appendChild(earlyStyle);

  // Solid black overlay covers page until window.load fires, then fades out.
  // Prevents any flash of content or background colour during page transitions.
  var overlay = document.createElement('div');
  overlay.id = 'page-fade-overlay';
  overlay.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'width:100%', 'height:100%',
    'background:#000', 'z-index:99999', 'pointer-events:none',
    'opacity:1', 'transition:opacity 1.1s ease'
  ].join(';');
  document.body.appendChild(overlay);

  function startFade() {
    // Remove the per-page pre-load background style before revealing content.
    // It was body{background:#000!important} injected in each page's <head>
    // to prevent any white/coloured flash before this overlay activates.
    var pl = document.getElementById('page-load-bg');
    if (pl && pl.parentNode) pl.parentNode.removeChild(pl);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.opacity = '0';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 1200);
      });
    });
  }

  // Skip fade-in when navigating from work page to a project page
  if (sessionStorage.getItem('skip-fade-in') === '1') {
    sessionStorage.removeItem('skip-fade-in');
    var pl = document.getElementById('page-load-bg');
    if (pl && pl.parentNode) pl.parentNode.removeChild(pl);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  } else if (document.readyState === 'complete') {
    startFade();
  } else {
    window.addEventListener('load', startFade);
  }
})();

(function () {

  const T = {
    en: {
      /* ── index ── */
      'notwork':       'Random USB',
      'nav-me':        'me',
      'nav-work':      'Work',

      /* ── shared section labels ── */
      'lbl-brief':         'Brief',
      'lbl-problem':       'Problem',
      'lbl-insight':       'Insight',
      'lbl-solution':      'Solution',
      'lbl-solution-idea': 'Solution / Idea',

      /* ── project-1 (Twix) sidebar ── */
      'p1-ins1': 'We live in a culture where the best experiences are often singular. Theme parks are the pinnacle of this frustration: you wait in line for a long time&nbsp;&mdash; for a short thrill.',
      'p1-ins2': '',
      'p1-sol':  'Twix hijacks Groundhog Day to turn the &ldquo;unsharable&rdquo; nature of Twix into the most sharable experience in Orlando. A total theme park takeover where everything, from the rides to the prizes comes in pairs. Because if one bar is never enough, one ride shouldn&rsquo;t be either.',

      /* ── project-4 (Le Ice) sidebar ── */
      'p4-brf': 'Create a brand identity and packaging for Le Ice &mdash; a new ice lolly brand launching exclusively in ALDI stores.',
      'p4-ins': 'Budget ice lollies are often perceived as cheap and generic. But the people buying them aren&rsquo;t &mdash; they&rsquo;re families and young adults who still want something that feels good to hold and be seen with.',
      'p4-sol': 'A bold, colour-coded identity built around the three flavours. Bright, confident packaging that punches well above its price point on the shelf.',

      /* ── project-5 (Penguin) sidebar ── */
      'p5-brf': 'Many people avoid books, not because they lack interest, but because they lack literary confidence. They believe reading is for someone else. Someone smarter, more focused, more literary. This quiet self-doubt keeps people locked out of one of the most powerful experiences in the world.',
      'p5-ins': 'After reading something written in typoglycemia &mdash; the brain&rsquo;s ability to read words even when the middle letters are jumbled &mdash; you feel smart and confident.',
      'p5-sol': 'A campaign that turns jumbled words into an unexpected confidence boost. Readers will decode the scrambled text, and realize: if I can read this, I can read anything!',

      /* ── about ── */
      'h-about':    'About Me',
      'h-about-me': 'About Me',

      /* ── nav shortcuts ── */
      'nav-home':    'home',
      'nav-contact': 'Contact',

      /* ── other-stuff nav links ── */
      'os-link1': 'Unsure what to do after your gap year?',
      'os-link2': 'words that sound like names',
      'os-link3': 'iphone notes',
      'os-link4': 'Food Pictures',
      'os-link5': 'Fossils',
      'os-link6': 'AI',
      'os-link7': 'my favorite emoji',

      /* ── sabbataar / ord-som-navne ── */
      'sabbataar-h': 'Gap Year',
      'osn-h':       'Words that sound like names',
    },

    da: {
      /* ── index ── */
      'notwork':  'Random USB',
      'nav-me':   'mig',
      'nav-work': 'Arbejde',

      /* ── shared section labels ── */
      'lbl-brief':         'Brief',
      'lbl-problem':       'Problem',
      'lbl-insight':       'Indsigt',
      'lbl-solution':      'Løsning',
      'lbl-solution-idea': 'Løsning / Ide',

      /* ── project-1 (Twix) sidebar ── */
      'p1-ins1': 'Vi lever i en kultur, hvor de bedste oplevelser ofte er kortvarige. Forlystelsesparker er toppen af denne frustration: man st&aring;r i k&oslash; i lang tid&nbsp;&mdash; for en kort fryd.',
      'p1-ins2': '',
      'p1-sol':  'Twix kaprer Groundhog Day for at g&oslash;re den &ldquo;usdelelige&rdquo; natur ved Twix til den mest delelige oplevelse i Orlando. En total overtagelse af forlystelsesparken, hvor alt &mdash; fra turene til pr&aelig;mierne &mdash; kommer i par. For hvis &eacute;t stykke aldrig er nok, burde &eacute;n tur heller ikke v&aelig;re det.',

      /* ── project-4 (Le Ice) sidebar ── */
      'p4-brf': 'Skab en brandidentitet og emballage til Le Ice &mdash; et nyt ispinem&aelig;rke, der lanceres eksklusivt i ALDI-butikker.',
      'p4-ins': 'Billige ispinde opfattes ofte som billige og generiske. Men dem, der k&oslash;ber dem, er det ikke &mdash; det er familier og unge voksne, der stadig vil have noget, der f&oslash;les godt at holde og blive set med.',
      'p4-sol': 'En dristig, farvekoderet identitet bygget op om de tre smagsvarianter. Frisk, selvsikker emballage der sl&aring;r langt over sin prispunkt p&aring; hylden.',

      /* ── project-5 (Penguin) sidebar ── */
      'p5-brf': 'Mange mennesker undg&aring;r b&oslash;ger &mdash; ikke fordi de mangler interesse, men fordi de mangler litter&aelig;r selvtillid. De tror, at l&aelig;sning er for en anden. En mere intelligent, fokuseret, litter&aelig;r person. Denne stille selvtvivl holder folk ude fra en af verdens mest kraftfulde oplevelser.',
      'p5-ins': 'N&aring;r man l&aelig;ser noget skrevet med typoglykemi &mdash; hjernens evne til at l&aelig;se ord, selv n&aring;r bogstaverne i midten er rodet rundt &mdash; f&oslash;ler man sig klog og selvsikker.',
      'p5-sol': 'En kampagne, der forvandler rodet tekst til et uventet skub til selvtilliden. L&aelig;serne afkoder den sammenblandede tekst og indser: hvis jeg kan l&aelig;se dette, kan jeg l&aelig;se alt!',

      /* ── about ── */
      'h-about':    'Om Mig',
      'h-about-me': 'Om Mig',

      /* ── nav shortcuts ── */
      'nav-home':    'hjem',
      'nav-contact': 'Kontakt',

      /* ── other-stuff nav links ── */
      'os-link1': 'I tvivl om hvad du skal efter dit sabbat&aring;r?',
      'os-link2': 'ord som lyder som navne',
      'os-link3': 'iphone noter',
      'os-link4': 'Madbilleder',
      'os-link5': 'Fossiler',
      'os-link6': 'AI',
      'os-link7': 'min yndlingsemoji',

      /* ── sabbataar / ord-som-navne ── */
      'sabbataar-h': 'Sabbat&aring;r',
      'osn-h':       'Ord som lyder som navne',
    }
  };

  /* ── current language ── */
  var lang = localStorage.getItem('lang') || 'en';

  /* ── apply translations ── */
  function apply(l) {
    lang = l;
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = T[l][el.dataset.i18n];
      if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll('#lang-toggle [data-lang]').forEach(function (btn) {
      btn.classList.toggle('i18n-active', btn.dataset.lang === l);
    });
  }

  /* ── initialise: inject styles + toggle button, then apply lang ── */
  function init() {
    var path = location.pathname;
    var isIndex   = path === '/' || /index\.html$/.test(path);
    var isContact = /contact\.html$/.test(path);
    var isWork    = /work\.html$/.test(path);
    var hasShortcuts = !isIndex && !isContact;

    var style = document.createElement('style');
    style.textContent = [
      '#lang-toggle{',
        'position:fixed;top:24px;right:24px;z-index:9999;',
        'display:flex;align-items:center;gap:2px;',
        'font-size:0.75rem;font-family:sans-serif;',
        'letter-spacing:0.06em;text-transform:uppercase;font-weight:500;',
        'color:#fff;',
      '}',
      '#lang-toggle button{',
        'background:none;border:none;cursor:pointer;',
        'padding:3px 5px;font-size:inherit;font-family:inherit;',
        'letter-spacing:inherit;text-transform:inherit;font-weight:inherit;',
        'color:inherit;opacity:0.5;transition:opacity 0.15s;',
      '}',
      '#lang-toggle button:hover{opacity:0.85;font-weight:700;}',
      '#lang-toggle button.i18n-active{opacity:1;font-weight:700;}',
      '#lang-toggle .i18n-sep{opacity:0.3;font-size:0.6rem;line-height:1;}',
      '#lang-toggle a.nav-shortcut{',
        'color:inherit;text-decoration:none;',
        'padding:3px 5px;font-size:inherit;font-family:inherit;',
        'letter-spacing:inherit;text-transform:inherit;font-weight:inherit;',
        'opacity:0.5;transition:opacity 0.15s;',
      '}',
      '#lang-toggle a.nav-shortcut:hover{opacity:0.85;font-weight:700;}',
      '@keyframes neon-cycle{',
        '0%{color:#ff2d78;text-shadow:0 0 6px #ff2d78,0 0 18px #ff2d78}',
        '33%{color:#00fff2;text-shadow:0 0 6px #00fff2,0 0 18px #00fff2}',
        '66%{color:#39ff14;text-shadow:0 0 6px #39ff14,0 0 18px #39ff14}',
        '100%{color:#ff2d78;text-shadow:0 0 6px #ff2d78,0 0 18px #ff2d78}',
      '}',
      '#lang-toggle a.pong-neon{opacity:1;animation:neon-cycle 2.4s linear infinite;}',
      '#lang-toggle a.pong-neon:hover{opacity:1;font-weight:700;}',
      '@media(max-width:768px){#lang-toggle a.pong-neon,#lang-toggle a.pong-neon+.i18n-sep{display:none;}}',
      '#nav-shortcuts{',
        'position:fixed;top:24px;left:24px;z-index:9999;',
        'display:flex;align-items:center;gap:2px;',
        'font-size:0.75rem;font-family:sans-serif;',
        'letter-spacing:0.06em;text-transform:uppercase;font-weight:500;',
        'color:#fff;transition:left 0.35s ease;',
      '}',
      '#nav-shortcuts a{',
        'color:inherit;text-decoration:none;',
        'padding:3px 5px;opacity:0.5;transition:opacity 0.15s;',
      '}',
      '#nav-shortcuts a:hover{opacity:0.85;font-weight:700;}',
      '#nav-shortcuts .i18n-sep{opacity:0.3;font-size:0.6rem;line-height:1;}',
    ].join('');
    document.head.appendChild(style);

    /* ── lang toggle (right side) — contact shortcut + EN/DA ── */
    var div = document.createElement('div');
    div.id = 'lang-toggle';
    var contactLink = hasShortcuts
      ? '<a class="nav-shortcut" href="contact.html" data-i18n="nav-contact">contact</a>'
        + '<span class="i18n-sep" style="margin:0 4px;">|</span>'
      : '';
    var pongLink = isWork
      ? '<a class="nav-shortcut pong-neon" href="pong.html">TIME4FUN</a>'
        + '<span class="i18n-sep" style="margin:0 4px;">|</span>'
      : '';
    div.innerHTML = pongLink + contactLink
                  + '<button data-lang="en">EN</button>'
                  + '<span class="i18n-sep">/</span>'
                  + '<button data-lang="da">DA</button>';
    div.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () { apply(btn.dataset.lang); });
    });
    document.body.appendChild(div);

    /* ── home shortcut (left side) ── */
    if (!isIndex) {
      var navDiv = document.createElement('div');
      navDiv.id = 'nav-shortcuts';
      navDiv.innerHTML = '<a href="index.html" data-i18n="nav-home">home</a>';
      document.body.appendChild(navDiv);

      /* sidebar-aware left position */
      var sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        var sbWidth = sidebar.offsetWidth || 360;
        navDiv.style.left = (sbWidth + 24) + 'px';
        new MutationObserver(function () {
          var collapsed = document.body.classList.contains('sb-collapsed');
          navDiv.style.left = collapsed ? '24px' : (sbWidth + 24) + 'px';
        }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
      }
    }

    apply(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
