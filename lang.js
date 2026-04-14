/* ─────────────────────────────────────────────────────────────────────────────
   lang.js  —  EN / DA toggle for aaannndddeeerrrsss.com
   Uses data-i18n="key" attributes on elements. Persists choice in localStorage.
───────────────────────────────────────────────────────────────────────────── */
(function () {

  const T = {
    en: {
      /* ── index ── */
      'notwork':       'A USB?',
      'nav-me':        'me',
      'nav-work':      'work',

      /* ── shared section labels ── */
      'lbl-brief':         'Brief',
      'lbl-problem':       'Problem',
      'lbl-insight':       'Insight',
      'lbl-solution':      'Solution',
      'lbl-solution-idea': 'Solution / Idea',

      /* ── project-1 (Twix) sidebar ── */
      'p1-ins1': 'We live in a culture where the best experiences are often singular. Theme parks are the pinnacle of this frustration: you wait in line for a long time&nbsp;&mdash; for a short thrill.',
      'p1-ins2': 'Twix has always been about the double joy and if one bar is never enough, one ride shouldn&rsquo;t be either.',
      'p1-sol':  'Twix hijacks Groundhog Day to turn the &ldquo;unsharable&rdquo; nature of Twix into the most sharable experience in Orlando. A total theme park takeover where everything, from the rides to the prizes comes in pairs.',

      /* ── project-4 (Le Ice) sidebar ── */
      'p4-brf': 'Create a brand identity and packaging for Le Ice &mdash; a new ice lolly brand launching exclusively in ALDI stores.',
      'p4-ins': 'Budget ice lollies are often perceived as cheap and generic. But the people buying them aren&rsquo;t &mdash; they&rsquo;re families and young adults who still want something that feels good to hold and be seen with.',
      'p4-sol': 'A bold, colour-coded identity built around the three flavours. Bright, confident packaging that punches well above its price point on the shelf.',

      /* ── about ── */
      'h-about':    'about me',
      'h-about-me': 'About Me',

      /* ── other-stuff nav links ── */
      'os-link1': 'Unsure what to do after your gap year?',
      'os-link2': 'words that sound like names',
      'os-link3': 'iphone notes',
      'os-link4': 'Food Pictures',
      'os-link5': 'Fossils',
      'os-link6': 'AI',

      /* ── sabbataar / ord-som-navne ── */
      'sabbataar-h': 'Gap Year',
      'osn-h':       'Words that sound like names',
    },

    da: {
      /* ── index ── */
      'notwork':  'A USB?',
      'nav-me':   'mig',
      'nav-work': 'arbejde',

      /* ── shared section labels ── */
      'lbl-brief':         'Brief',
      'lbl-problem':       'Problem',
      'lbl-insight':       'Indsigt',
      'lbl-solution':      'Løsning',
      'lbl-solution-idea': 'Løsning / Ide',

      /* ── project-1 (Twix) sidebar ── */
      'p1-ins1': 'Vi lever i en kultur, hvor de bedste oplevelser ofte er kortvarige. Forlystelsesparker er toppen af denne frustration: man st&aring;r i k&oslash; i lang tid&nbsp;&mdash; for en kort fryd.',
      'p1-ins2': 'Twix har altid handlet om den dobbelte gl&aelig;de, og hvis &eacute;t stykke aldrig er nok, burde &eacute;n tur heller ikke v&aelig;re det.',
      'p1-sol':  'Twix kaprer Groundhog Day for at g&oslash;re den &ldquo;usdelelige&rdquo; natur ved Twix til den mest delelige oplevelse i Orlando. En total overtagelse af forlystelsesparken, hvor alt &mdash; fra turene til pr&aelig;mierne &mdash; kommer i par.',

      /* ── project-4 (Le Ice) sidebar ── */
      'p4-brf': 'Skab en brandidentitet og emballage til Le Ice &mdash; et nyt ispinem&aelig;rke, der lanceres eksklusivt i ALDI-butikker.',
      'p4-ins': 'Billige ispinde opfattes ofte som billige og generiske. Men dem, der k&oslash;ber dem, er det ikke &mdash; det er familier og unge voksne, der stadig vil have noget, der f&oslash;les godt at holde og blive set med.',
      'p4-sol': 'En dristig, farvekoderet identitet bygget op om de tre smagsvarianter. Frisk, selvsikker emballage der sl&aring;r langt over sin prispunkt p&aring; hylden.',

      /* ── about ── */
      'h-about':    'om mig',
      'h-about-me': 'Om mig',

      /* ── other-stuff nav links ── */
      'os-link1': 'I tvivl om hvad du skal efter dit sabbat&aring;r?',
      'os-link2': 'ord som lyder som navne',
      'os-link3': 'iphone noter',
      'os-link4': 'Madbilleder',
      'os-link5': 'Fossiler',
      'os-link6': 'AI',

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
    var style = document.createElement('style');
    style.textContent = [
      '#lang-toggle{',
        'position:fixed;top:24px;right:24px;z-index:9999;',
        'display:flex;align-items:center;gap:2px;',
        'font-size:0.68rem;font-family:sans-serif;',
        'letter-spacing:0.1em;text-transform:uppercase;',
      '}',
      '#lang-toggle button{',
        'background:none;border:none;cursor:pointer;',
        'padding:3px 5px;font-size:inherit;font-family:inherit;',
        'letter-spacing:inherit;text-transform:inherit;',
        'color:inherit;opacity:0.35;transition:opacity 0.15s;',
      '}',
      '#lang-toggle button:hover{opacity:0.65;}',
      '#lang-toggle button.i18n-active{opacity:1;font-weight:700;}',
      '#lang-toggle .i18n-sep{opacity:0.25;font-size:0.6rem;line-height:1;}',
    ].join('');
    document.head.appendChild(style);

    var div = document.createElement('div');
    div.id = 'lang-toggle';
    div.innerHTML = '<button data-lang="en">EN</button>'
                  + '<span class="i18n-sep">/</span>'
                  + '<button data-lang="da">DA</button>';
    div.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () { apply(btn.dataset.lang); });
    });
    document.body.appendChild(div);

    apply(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
