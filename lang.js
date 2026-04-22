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
      'notwork':       '...other stuff',
      'nav-me':        'me',
      'nav-work':      'Work',

      /* ── shared section labels ── */
      'lbl-brief':          'Brief',
      'lbl-problem':        'Problem',
      'lbl-insight':        'Insight',
      'lbl-solution':       'Solution',
      'lbl-solution-idea':  'Solution / Idea',
      'lbl-collaborators':  'Collaborators',

      /* ── project-1 (Twix) sidebar ── */
      'p1-ins1': 'We live in a culture where the best experiences are often singular. Theme parks are the pinnacle of this frustration: you wait in line for a long time&nbsp;&mdash; for a short thrill.',
      'p1-ins2': '',
      'p1-sol':  'Twix hijacks Groundhog Day to turn the &ldquo;unsharable&rdquo; nature of Twix into the most sharable experience in Orlando. A total theme park takeover where everything, from the rides to the prizes comes in pairs.',
      'p1-sol2': 'Because if one bar is never enough, neither is one ride.',

      /* ── project-2 (Tuborg / Fizz Cap) sidebar ── */
      'p2-ins': 'Gen Z is paralyzed by social &ldquo;correctness,&rdquo; suppressing even natural behaviors to fit in. We used the most &ldquo;incorrect&rdquo; human sound&mdash;a fart&mdash;as a literal metaphor for the mental pressure they bottle up.',
      'p2-sol': 'A re-engineered Tuborg cap with a built-in silicone nozzle. Upon opening, the bottle lets out a high-pitched &ldquo;fart&rdquo; sound, serving as a social icebreaker and a reminder to &ldquo;Release the pressure.&rdquo;',

      /* ── project-3 (Bones) sidebar ── */
      'p3-prb': '',
      'p3-ins': '',
      'p3-sol': '',

      /* ── project-4 (Le Ice) sidebar ── */
      'p4-ins': 'Even though ice cubes are simply frozen water, they always elevate the drinking experience just a little &mdash; turning a lukewarm bargain soda into an approximately cool bargain soda.',
      'p4-prb': 'The existing ice cube selection in stores does not reflect the true value of ice cubes.',
      'p4-sol': 'Le Ice is the first ice cube brand to finally give ice cubes the packaging and presence they deserve. Without resorting to velvet or gold leaves, Le Ice adorns its ice cube bags with design and functionality directly inspired by everyday recognisable luxury.',

      /* ── project-5 (Penguin) sidebar ── */
      'p5-brf': 'Many people avoid books, not because they lack interest, but because they lack literary confidence. They believe reading is for someone else. Someone smarter, more focused, more literary. This quiet self-doubt keeps people locked out of one of the most powerful experiences in the world.',
      'p5-ins': 'After reading something written in typoglycemia &mdash; the brain&rsquo;s ability to read words even when the middle letters are jumbled &mdash; you feel smart and confident.',
      'p5-sol': 'A campaign that turns jumbled words into an unexpected confidence boost. Readers will decode the scrambled text, and realize: if I can read this, I can read anything!',

      /* ── project-6 (Mex&Co) sidebar ── */
      'p6-ins': '<p>Mex &amp; Co.&rsquo;s habanero salsa comes with a precision nozzle, engineered for surgical accurate dosing. But we noticed an untapped potential, exceeding mere handiness.</p>',
      'p6-con': '<p>Everyone knows the rule: don&rsquo;t play with your food. We swapped &ldquo;don&rsquo;t&rdquo; with do. By branding dot-to-dot patterns directly into the surface of the tortillas, we created a canvas for the salsa to draw on. It&rsquo;s for the kids who finally have a reason to play, and for the adults who have waited long enough for permission.</p>',
      'p6-tgt': '<p>Nostalgic, creative souls, grown ups and kids alike, those who celebrate the weekends with film nights, gather their friends and turn on the projector to indulge in universes they never get tired of.</p>',
      'p6-exe': '<p>Three special editions: Star Wars, Lord of the Rings, and Harry Potter. Each wrapped in its own universe and accompanied by OOH posters with taglines like &ldquo;May the salsa be with you&rdquo;, &ldquo;One salsa to rule them all&rdquo;, and &ldquo;You&rsquo;re a wizard, Salsa&rdquo;.</p>',
      'p6-col': '<p>Sofus Kragelund Joensen</p>',
      'p1-col': '<p>William Hastrup &amp; Sofus Kragelund Joensen</p>',
      'p2-col': '<p>William Hastrup &amp; Sofus Kragelund Joensen</p>',
      'p5-col': '<p>William Hastrup &amp; Sofus Kragelund Joensen</p>',

      /* ── about ── */
      'h-about':    'About Me',
      'h-about-me': 'About Me',

      /* ── nav shortcuts ── */
      'nav-home':    'home',
      'nav-contact': 'Contact',

      /* ── other-stuff nav links ── */
      'os-link1': 'don\'t know what to do after your gap year?',
      'os-link2': 'words that sound like names',
      'os-link3': 'iphone notes',
      'os-link4': 'Food Pictures',
      'os-link5': 'Fossils',
      'os-link6': 'AI',
      'os-link7': 'my favorite emoji',
      'fav-emoji-title': 'this one',

      /* ── sabbataar / ord-som-navne ── */
      'sabbataar-h': 'Gap Year',
      'osn-h':       'Words that sound like names',

      /* ── work ticker ── */
      'ticker-text': "Welcome to Anders\u2019 hard drive, where the sky is a perfect, cloudless blue and a warm breeze is carrying the scent of salt air. It\u2019s a beautiful 28\u00b0C outside, tailored for a day of absolutely zero worries and total relaxation. We\u2019ve arrived at a place where the pace slows down and the sun stays high. So prepare to step out into pure, carefree ease.  ",
    },

    da: {
      /* ── index ── */
      'notwork':  '...other stuff',
      'nav-me':   'mig',
      'nav-work': 'Arbejde',

      /* ── shared section labels ── */
      'lbl-brief':          'Brief',
      'lbl-problem':        'Problem',
      'lbl-insight':        'Indsigt',
      'lbl-solution':       'Løsning',
      'lbl-solution-idea':  'Løsning / Ide',
      'lbl-collaborators':  'Samarbejdere',

      /* ── project-1 (Twix) sidebar ── */
      'p1-ins1': 'Vi lever i en kultur, hvor de bedste oplevelser ofte er kortvarige. Forlystelsesparker er toppen af denne frustration: man st&aring;r i k&oslash; i lang tid&nbsp;&mdash; for en kort fryd.',
      'p1-ins2': '',
      'p1-sol':  'Twix kaprer Groundhog Day for at g&oslash;re den &ldquo;usdelelige&rdquo; natur ved Twix til den mest delelige oplevelse i Orlando. En total overtagelse af forlystelsesparken, hvor alt &mdash; fra turene til pr&aelig;mierne &mdash; kommer i par.',
      'p1-sol2': 'For hvis &eacute;t stykke aldrig er nok, er &eacute;n tur det heller ikke.',

      /* ── project-2 (Tuborg / Fizz Cap) sidebar ── */
      'p2-ins': 'Generation Z er lam af social &ldquo;korrekthed&rdquo; og undertrykker selv naturlig adf&aelig;rd for at passe ind. Vi brugte den mest &ldquo;ukorrekte&rdquo; menneskelige lyd&mdash;en prut&mdash;som en bogstavelig metafor for det mentale pres, de holder inde med.',
      'p2-sol': 'En nyudviklet Tuborg-kapsel med et indbygget siliconemundst&oslash;kke. N&aring;r flasken &aring;bnes, afgiver den en skinger &ldquo;prut&rdquo;-lyd, der fungerer som en social isbryder og en p&aring;mindelse om at &ldquo;slippe presset.&rdquo;',

      /* ── project-3 (Bones) sidebar ── */
      'p3-prb': '<p>Jensens B&oslash;fhus har drejet n&oslash;glen om og umiddelbart lyder det som en gevinst for Bones, den st&oslash;rste konkurrent er sat ud af spillet. Men Jensens fald er ikke en sejr, det er en advarsel. De to brands er n&aelig;sten identiske: samme koncept, samme m&aring;lgruppe, samme udtryk og samme forgaengelighed som skubbede Jensens i afgrunden.</p><p>Den selvsamme afgrund har Bones un&aelig;gteligt kurs mod.</p>',
      'p3-ins': '<p>I K&oslash;benhavn er en ny kultur opst&aring;et, kitsch, r&aring; og tilsyneladende grim, men med en magnetisk tiltr&aelig;kningskraft blandt unge, der dyrker den som deres eget udtryk. Den tr&aelig;kker tydelige paralleller til provinsens naturlige og ubevidste visuelle kultur.</p>',
      'p3-sol': '<p>Bones&rsquo; rebranding tager udgangspunkt i en &aelig;stetik der aldrig fik lov at v&aelig;re cool, hvide ridsede plastikstole, grafisk forkasteligt WordArt og tynde brillestel som typisk bliver b&aring;ret af Anja fra N&oslash;rrum Sn&oslash;rums forsamlingshus&rsquo; &aring;rlige sommerfest &mdash; der alt fandt sit helle i provinsen mens resten af Danmark vendte det ryggen.</p><p>Nu er det tilbage, men denne gang i en forklædning af post-ironisk-k&oslash;benhavner-kitsch, kun forst&aring;elig for det segment som kender ham den ene (og nej?? alts&aring; ikke ham den anden) fra APHACA og l&aelig;ser en uddannelse p&aring; Holmen som er den sikreste vej til &oslash;konomisk afh&aelig;ngighed.</p><p>Det er dem der forsikrer dig om at det er meningen at det skal v&aelig;re grimt og du nok bare ikke forst&aring;r det endnu.</p><p>Udtrykket fors&oslash;ger ikke at behage alle, men ender med at g&oslash;re det alligevel. De sejeste* K&oslash;benhavnere ser det som en gylden mulighed for at v&aelig;re first mover og provinsen &aelig;nser intet andet end at der skal fyldes op p&aring; spareribs for enden af buffeten.</p><p style="opacity:0.55;font-size:0.85em">*med mangel p&aring; bedre frontl&oslash;ber-adjektiv</p>',

      /* ── project-4 (Le Ice) sidebar ── */
      'p4-ins': 'Selvom isterninger blot er frosset vand, l&oslash;fter de altid oplevelsen af drikkelse en lille smule og g&oslash;r en lunken sodavand k&oslash;bt p&aring; tilbud til en tiln&aelig;rmelsesvis k&oslash;lig sodavand k&oslash;bt p&aring; tilbud.',
      'p4-prb': 'Det eksisterende isterningeudvalg i butikkerne afspejler ikke isterningers sande v&aelig;rdi.',
      'p4-sol': 'Le Ice er det f&oslash;rste isterningebrand som endelig giver isterninger den indpakning og udstr&aring;ling de fortjener. Uden at g&oslash;re brug af hverken velour eller bladguld pryder Le Ice sine isterningeposer med design og funktionalitet, direkte inspireret fra hverdagsgenkendelig luksus.',

      /* ── project-5 (Penguin) sidebar ── */
      'p5-brf': 'Mange mennesker undg&aring;r b&oslash;ger &mdash; ikke fordi de mangler interesse, men fordi de mangler litter&aelig;r selvtillid. De tror, at l&aelig;sning er for en anden. En mere intelligent, fokuseret, litter&aelig;r person. Denne stille selvtvivl holder folk ude fra en af verdens mest kraftfulde oplevelser.',
      'p5-ins': 'N&aring;r man l&aelig;ser noget skrevet med typoglykemi &mdash; hjernens evne til at l&aelig;se ord, selv n&aring;r bogstaverne i midten er rodet rundt &mdash; f&oslash;ler man sig klog og selvsikker.',
      'p5-sol': 'En kampagne, der forvandler rodet tekst til et uventet skub til selvtilliden. L&aelig;serne afkoder den sammenblandede tekst og indser: hvis jeg kan l&aelig;se dette, kan jeg l&aelig;se alt!',

      /* ── project-6 (Mex&Co) sidebar ── */
      'p6-ins': '<p>Mex &amp; Co.&rsquo;s habanero salsa leveres med en pr&aelig;cisionsdyse, konstrueret til kirurgisk n&oslash;jagtig dosering. Men vi opdagede et uudnyttet potentiale, der langt overstiger ren bekvemmelighed.</p>',
      'p6-con': '<p>Alle kender reglen: man leger ikke med maden. Vi skiftede &ldquo;ikke&rdquo; ud med bare g&oslash;r det. Ved at br&aelig;nde prik-til-prik m&oslash;nstre direkte ind i tortillaernes overflade skabte vi et l&aelig;rred, som salsaen kan tegne p&aring;. Det er for b&oslash;rnene, der endelig har en grund til at lege, og for de voksne, der har ventet l&aelig;nge nok p&aring; tilladelse.</p>',
      'p6-tgt': '<p>Nostalgiske, kreative sj&aelig;le &mdash; store som sm&aring; &mdash; dem der fejrer weekenden med filmaftener, samler vennerne og t&aelig;nder projektoren for at fordybe sig i universer, de aldrig bliver tr&aelig;tte af.</p>',
      'p6-exe': '<p>Tre specialudgaver: Star Wars, Ringenes Herre og Harry Potter. Hver pakket ind i sit eget univers og ledsaget af OOH-plakater med slogans som &ldquo;May the salsa be with you&rdquo;, &ldquo;One salsa to rule them all&rdquo; og &ldquo;You&rsquo;re a wizard, Salsa&rdquo;.</p>',
      'p6-col': '<p>Sofus Kragelund Joensen</p>',
      'p1-col': '<p>William Hastrup &amp; Sofus Kragelund Joensen</p>',
      'p2-col': '<p>William Hastrup &amp; Sofus Kragelund Joensen</p>',
      'p5-col': '<p>William Hastrup &amp; Sofus Kragelund Joensen</p>',

      /* ── about ── */
      'h-about':    'Om Mig',
      'h-about-me': 'Om Mig',

      /* ── nav shortcuts ── */
      'nav-home':    'hjem',
      'nav-contact': 'Kontakt',

      /* ── other-stuff nav links ── */
      'os-link1': 'i tvivl om hvad du skal efter dit sabbat&aring;r?',
      'os-link2': 'ord som lyder som navne',
      'os-link3': 'iphone noter',
      'os-link4': 'Madbilleder',
      'os-link5': 'Fossiler',
      'os-link6': 'AI',
      'os-link7': 'min yndlingsemoji',
      'fav-emoji-title': 'den her',

      /* ── sabbataar / ord-som-navne ── */
      'sabbataar-h': 'Sabbat&aring;r',
      'osn-h':       'Ord som lyder som navne',

      /* ── work ticker ── */
      'ticker-text': "Velkommen til Anders\u2019 harddisk, hvor himlen er skyfri og en varm brise b\u00e6rer duften af salt luft. Det er en dejlig 28\u00b0C udenfor, en perfekt dag med absolut nul bekymringer og med total afslapning. Vi er ankommet et sted, hvor tempoet er langsomt og solen altid st\u00e5r h\u00f8jt. S\u00e5 g\u00f8r dig klar til at tr\u00e6de ud i ren, bekymringsfri chillhed.  ",
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
    if (typeof window.__tickerReset === 'function') window.__tickerReset();
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
      ? '<a class="nav-shortcut pong-neon" href="pong.html">GAME ON</a>'
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
