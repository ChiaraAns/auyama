/* ==========================================================================
   Auyama Freising – Seitenlogik (Vanilla JS, kein Framework)

   Datenquellen (alle im Hauptverzeichnis, ohne Programmierkenntnisse pflegbar):
     restaurant.json – Telefon, Adresse, Instagram, Öffnungszeiten
     menu.json       – Monatskarte
     events.json     – Termine
     lexikon.json    – ABC der venezolanischen Küche
     texts.json      – alle Texte auf Deutsch und Englisch
   ========================================================================== */
(function () {
  'use strict';

  var TZ = 'Europe/Berlin';
  var DAY_KEYS = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
  var SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var LANG_KEY = 'auyama-lang';

  var state = { lang: 'de', texts: null, restaurant: null, menu: null, events: null, lexikon: null, filter: 'alle' };

  /* ---------- Hilfsfunktionen ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'className') node.className = v;
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function icon(id, cls) {
    return '<svg class="' + (cls || 'icon') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  function loadJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ': ' + r.status);
      return r.json();
    });
  }

  /** Text aus texts.json, z. B. t('status.openDetail', {zeit: '16:00'}) */
  function t(path, vars) {
    var value = lookup(state.lang, path);
    if (value === undefined) value = lookup('de', path);
    if (value === undefined) return '';
    if (typeof value === 'string' && vars) {
      value = value.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
    }
    return value;
  }
  function lookup(lang, path) {
    if (!state.texts || !state.texts[lang]) return undefined;
    return path.split('.').reduce(function (o, k) { return o && o[k] !== undefined ? o[k] : undefined; }, state.texts[lang]);
  }

  /** Mehrsprachiges Feld {"de": "...", "en": "..."} oder einfacher Text */
  function loc(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    return field[state.lang] || field.de || '';
  }

  function storageGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function storageSet(key, v) { try { window.localStorage.setItem(key, v); } catch (e) { /* privater Modus */ } }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- Zeit in Europe/Berlin ---------- */

  /** Wochentag (0 = Montag), Minuten seit Mitternacht und Datum (JJJJ-MM-TT) in Berliner Zeit */
  function berlinNow() {
    var parts = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday),
      minutes: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10),
      date: parts.year + '-' + parts.month + '-' + parts.day
    };
  }

  function toMinutes(hhmm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim());
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : null;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fromMinutes(min) { return pad(Math.floor(min / 60) % 24) + ':' + pad(min % 60); }

  /** "12:00-16:00" -> {start: 720, end: 960} */
  function parseRanges(list) {
    return (list || []).map(function (s) {
      var bits = String(s).split(/\s*[-–]\s*/);
      var start = toMinutes(bits[0]);
      var end = toMinutes(bits[1]);
      return start === null || end === null ? null : { start: start, end: end };
    }).filter(Boolean).sort(function (a, b) { return a.start - b.start; });
  }

  function weekHours() {
    var oz = (state.restaurant && state.restaurant.oeffnungszeiten) || {};
    return DAY_KEYS.map(function (k) { return parseRanges(oz[k]); });
  }

  /* ---------- Live-Status ---------- */

  function computeStatus() {
    var week = weekHours();
    var now = berlinNow();
    var today = week[now.day];
    var i;

    for (i = 0; i < today.length; i++) {
      var r = today[i];
      if (now.minutes >= r.start && now.minutes < r.end) {
        var soon = r.end - now.minutes <= 60;
        return {
          state: soon ? 'soon' : 'open',
          title: t(soon ? 'status.soonTitle' : 'status.openTitle'),
          detail: t(soon ? 'status.soonDetail' : 'status.openDetail', { zeit: fromMinutes(r.end) })
        };
      }
    }
    for (i = 0; i < today.length; i++) {
      if (today[i].start > now.minutes) {
        return { state: 'closed', title: t('status.closedTitle'), detail: t('status.opensToday', { zeit: fromMinutes(today[i].start) }) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var idx = (now.day + d) % 7;
      if (week[idx].length) {
        var zeit = fromMinutes(week[idx][0].start);
        var detail = d === 1 ? t('status.opensTomorrow', { zeit: zeit }) : t('status.opensOn', { tag: t('days')[idx], zeit: zeit });
        return { state: 'closed', title: t('status.closedTitle'), detail: detail };
      }
    }
    return { state: 'closed', title: t('status.closedTitle'), detail: t('status.closedLong') };
  }

  function renderStatus() {
    if (!state.restaurant || !state.texts) return;
    var s = computeStatus();
    var tile = $('[data-status-tile]');
    if (tile) {
      tile.setAttribute('data-state', s.state);
      $('[data-status-title]', tile).textContent = s.title;
      $('[data-status-detail]', tile).textContent = s.detail;
    }
    var pill = $('[data-status-pill]');
    if (pill) {
      pill.hidden = false;
      pill.setAttribute('data-state', s.state);
      $('[data-status-pill-text]', pill).textContent = s.title + ' · ' + s.detail;
    }
  }

  /* ---------- Öffnungszeiten ---------- */

  function renderHours() {
    var body = $('[data-hours]');
    if (!body || !state.restaurant) return;
    var week = weekHours();
    var today = berlinNow().day;
    var days = t('days');
    body.innerHTML = '';
    week.forEach(function (ranges, i) {
      var isToday = i === today;
      var th = el('th', { scope: 'row' }, [days[i] || DAY_KEYS[i]]);
      if (isToday) th.appendChild(el('span', { className: 'today-tag', text: t('visit.today') }));
      var times = ranges.length
        ? ranges.map(function (r) { return fromMinutes(r.start) + ' – ' + fromMinutes(r.end); }).join(', ')
        : t('visit.closed');
      body.appendChild(el('tr', {
        className: (isToday ? 'is-today ' : '') + (ranges.length ? '' : 'is-closed'),
        'aria-current': isToday ? 'date' : null
      }, [th, el('td', { text: times })]));
    });

    var note = $('[data-hours-note]');
    var text = loc(state.restaurant.sonderhinweis);
    note.hidden = !text;
    note.textContent = text;

    renderHoursShort(week);
  }

  /** Kurzfassung für die Fußzeile: aufeinanderfolgende Tage mit gleichen Zeiten werden zusammengefasst */
  function renderHoursShort(week) {
    var target = $('[data-hours-short]');
    if (!target) return;
    var de = state.lang === 'de';
    var short = de ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var hour = function (min) {
      var h = Math.floor(min / 60), m = min % 60;
      if (de) return h + (m ? ':' + pad(m) : '');
      var h12 = h % 12 || 12;
      return h12 + (m ? ':' + pad(m) : '') + (h < 12 ? ' am' : ' pm');
    };
    var key = function (r) { return r.map(function (x) { return x.start + '-' + x.end; }).join(','); };
    var groups = [];
    week.forEach(function (ranges, i) {
      if (!ranges.length) return;
      var last = groups[groups.length - 1];
      if (last && last.to === i - 1 && last.key === key(ranges)) last.to = i;
      else groups.push({ from: i, to: i, key: key(ranges), ranges: ranges });
    });
    var join = de ? ' bis ' : ' to ';
    var lines = groups.map(function (g) {
      var dayPart = g.from === g.to ? short[g.from]
        : (g.to === g.from + 1 ? short[g.from] + (de ? ' und ' : ' and ') + short[g.to] : short[g.from] + join + short[g.to]);
      var timePart = g.ranges.map(function (r) { return hour(r.start) + join + hour(r.end) + (de ? ' Uhr' : ''); }).join(', ');
      return dayPart + ' ' + timePart;
    });
    target.innerHTML = '';
    lines.forEach(function (line, i) {
      if (i) target.appendChild(el('br'));
      target.appendChild(document.createTextNode(line));
    });
  }

  /* ---------- Kontaktdaten ---------- */

  function renderContact() {
    var r = state.restaurant;
    if (!r) return;
    var a = r.adresse || {};
    var addressLine = a.strasse + ', ' + a.plz + ' ' + a.ort;
    var routeUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addressLine);
    $$('[data-tel]').forEach(function (n) { n.href = 'tel:' + r.telefonLink; });
    $$('[data-tel-text]').forEach(function (n) { n.textContent = r.telefon; });
    $$('[data-route]').forEach(function (n) { n.href = routeUrl; });
    $$('[data-street]').forEach(function (n) { n.textContent = a.strasse; });
    $$('[data-city]').forEach(function (n) { n.textContent = a.plz + ' ' + a.ort; });
    $$('[data-instagram]').forEach(function (n) { n.href = 'https://instagram.com/' + r.instagram; });
  }

  /** schema.org-Daten mit restaurant.json abgleichen */
  function syncStructuredData() {
    var script = $('#ld-restaurant');
    var r = state.restaurant;
    if (!script || !r) return;
    try {
      var data = JSON.parse(script.textContent);
      var groups = {};
      weekHours().forEach(function (ranges, i) {
        ranges.forEach(function (rg) {
          var k = fromMinutes(rg.start) + '-' + fromMinutes(rg.end);
          (groups[k] = groups[k] || []).push(SCHEMA_DAYS[i]);
        });
      });
      data.openingHoursSpecification = Object.keys(groups).map(function (k) {
        var p = k.split('-');
        return { '@type': 'OpeningHoursSpecification', dayOfWeek: groups[k], opens: p[0], closes: p[1] };
      });
      data.telephone = r.telefonLink;
      data.address.streetAddress = r.adresse.strasse;
      data.address.postalCode = r.adresse.plz;
      data.address.addressLocality = r.adresse.ort;
      script.textContent = JSON.stringify(data, null, 2);
    } catch (e) { /* bleibt unverändert */ }
  }

  /* ---------- ABC (lexikon.json) ---------- */

  function terms() { return (state.lexikon && state.lexikon.begriffe) || []; }

  function renderAbc() {
    var root = $('[data-abc-root]');
    if (!root) return;
    root.innerHTML = '';
    terms().forEach(function (b) {
      var word = loc(b.wort);
      var btn = el('button', { type: 'button', className: 'abc-btn', 'aria-pressed': 'false', id: 'abc-' + b.id }, [
        el('span', { className: 'abc-face abc-front' }, [
          el('span', { className: 'abc-word', text: word }),
          el('span', { html: icon('i-turn', 'abc-turn') })
        ]),
        el('span', { className: 'abc-face abc-back' }, [
          el('span', { className: 'abc-word', 'aria-hidden': 'true', text: word }),
          el('span', { className: 'abc-text', text: loc(b.text) })
        ])
      ]);
      btn.setAttribute('aria-label', word + ': ' + t('abc.flip'));
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', on ? word + ': ' + loc(b.text) : word + ': ' + t('abc.flip'));
      });
      root.appendChild(el('li', { className: 'abc-tile' }, [btn]));
    });
  }

  /** Begriffe aus dem ABC in einem Text der Speisekarte antippbar machen */
  var termRegexCache = null;
  function termMatcher() {
    if (termRegexCache) return termRegexCache;
    var list = [];
    terms().forEach(function (b) {
      (b.suchwoerter || []).forEach(function (w) { list.push({ word: w, id: b.id }); });
    });
    list.sort(function (a, b) { return b.word.length - a.word.length; });
    var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
    var source = '(' + list.map(function (x) { return esc(x.word); }).join('|') + ')';
    var re;
    try { re = new RegExp('(?<![\\p{L}])' + source, 'giu'); } catch (e) { re = new RegExp(source, 'gi'); }
    termRegexCache = { re: re, list: list };
    return termRegexCache;
  }

  function withTerms(text) {
    var frag = document.createDocumentFragment();
    if (!terms().length || !text) { frag.appendChild(document.createTextNode(text || '')); return frag; }
    var m = termMatcher();
    var last = 0;
    var match;
    m.re.lastIndex = 0;
    while ((match = m.re.exec(text)) !== null) {
      var found = match[1] || match[0];
      var start = match.index + (match[0].length - found.length);
      var entry = m.list.filter(function (x) { return x.word.toLowerCase() === found.toLowerCase(); })[0];
      if (!entry) continue;
      frag.appendChild(document.createTextNode(text.slice(last, start)));
      var b = el('button', { type: 'button', className: 'term', 'data-term': entry.id, 'aria-expanded': 'false', 'aria-controls': 'term-pop' }, [found]);
      frag.appendChild(b);
      last = start + found.length;
    }
    frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  var openTerm = null;
  function showTerm(btn) {
    var pop = $('#term-pop');
    var entry = terms().filter(function (b) { return b.id === btn.getAttribute('data-term'); })[0];
    if (!pop || !entry) return;
    if (openTerm === btn) { hideTerm(true); return; }
    hideTerm(false);
    $('.term-pop-title', pop).textContent = loc(entry.wort);
    $('.term-pop-text', pop).textContent = loc(entry.text);
    pop.hidden = false;
    var host = pop.offsetParent || document.body;
    var hostRect = host.getBoundingClientRect();
    var r = btn.getBoundingClientRect();
    var w = pop.offsetWidth;
    var left = Math.min(Math.max(r.left, 16), window.innerWidth - w - 16) - hostRect.left;
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom - hostRect.top + 10) + 'px';
    btn.setAttribute('aria-expanded', 'true');
    openTerm = btn;
    $('.term-pop-close', pop).focus({ preventScroll: true });
  }
  function hideTerm(restoreFocus) {
    var pop = $('#term-pop');
    if (pop) pop.hidden = true;
    if (openTerm) {
      openTerm.setAttribute('aria-expanded', 'false');
      if (restoreFocus) openTerm.focus({ preventScroll: true });
    }
    openTerm = null;
  }
  function setupTerms() {
    document.addEventListener('click', function (e) {
      var term = e.target.closest && e.target.closest('.term');
      if (term) { e.preventDefault(); showTerm(term); return; }
      if (e.target.closest && e.target.closest('[data-term-close]')) { hideTerm(true); return; }
      if (openTerm && !(e.target.closest && e.target.closest('#term-pop'))) hideTerm(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openTerm) hideTerm(true); });
    window.addEventListener('resize', function () { if (openTerm) hideTerm(false); });
  }

  /* ---------- Monatskarte ---------- */

  function formatPrice(p) {
    var n = typeof p === 'number' ? p : parseFloat(String(p).replace(/\s|€/g, '').replace(',', '.'));
    if (isNaN(n)) return String(p);
    return new Intl.NumberFormat(state.lang === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(n);
  }

  function renderMenu() {
    var root = $('[data-menu-root]');
    var tabs = $('[data-menu-tabs]');
    var m = state.menu;
    if (!root || !m) return;
    hideTerm(false);

    var monthLabel = loc(m.monat) + ' ' + (m.jahr || '');
    $$('[data-menu-month]').forEach(function (n) { n.textContent = monthLabel; });
    var heroMenu = $('[data-hero-menu]');
    if (heroMenu) heroMenu.textContent = t('hero.menuTitle', { monat: monthLabel });

    root.innerHTML = '';
    tabs.innerHTML = '';

    (m.kategorien || []).forEach(function (cat, ci) {
      var id = 'kat-' + (cat.id || ci);
      var headingId = id + '-titel';
      tabs.appendChild(el('li', { 'data-tab-for': id }, [el('a', { href: '#' + id, text: loc(cat.name) })]));

      var items = el('ul', { className: 'menu-items', role: 'list' });
      (cat.gerichte || []).forEach(function (g) {
        /*
         * Labels "vegetarisch" / "vegan" (Feld "label" in menu.json) nur dort, wo es
         * eindeutig aus der Beschreibung hervorgeht.
         * Bitte beim Inhaber bestätigen – vor allem bei den als "vegan" markierten
         * Gerichten (Dressings, Dips, Brühen sind aus der Beschreibung nicht ersichtlich).
         */
        var label = g.label === 'vegan' || g.label === 'vegetarisch' ? g.label : '';
        var nameNode = el('span', { className: 'menu-item-name' });
        nameNode.appendChild(withTerms(loc(g.name)));
        var detailsNode = null;
        if (g.menge || g.details) {
          detailsNode = el('p', { className: 'menu-item-details' }, [
            g.menge ? el('span', { className: 'menu-item-size', text: g.menge }) : null,
            g.menge && g.details ? ' · ' : null
          ]);
          if (g.details) detailsNode.appendChild(withTerms(loc(g.details)));
        }
        items.appendChild(el('li', { className: 'menu-item', 'data-diet': label || null }, [
          el('div', { className: 'menu-item-head' }, [nameNode, el('span', { className: 'menu-item-price', text: formatPrice(g.preis) })]),
          detailsNode,
          label ? el('span', { className: 'diet diet--' + label, html: icon('i-leaf', '') + '<span>' + t('menu.' + label) + '</span>' }) : null
        ]));
      });

      root.appendChild(el('section', { className: 'menu-cat', id: id, 'aria-labelledby': headingId }, [
        cat.bild ? el('div', { className: 'menu-cat-img' }, [
          el('img', { src: cat.bild, alt: loc(cat.bildAlt), loading: 'lazy', decoding: 'async', width: '828', height: '414' })
        ]) : null,
        el('h3', { id: headingId, text: loc(cat.name) }),
        items
      ]));
    });

    var foot = $('[data-menu-footnote]');
    if (foot && m.fussnote) foot.textContent = loc(m.fussnote);

    applyFilter(false);
    setupScrollSpy();
  }

  function renderMenuError() {
    var root = $('[data-menu-root]');
    if (!root) return;
    var tel = (state.restaurant && state.restaurant.telefon) || '0170 2321409';
    root.innerHTML = '';
    root.appendChild(el('p', { className: 'notice', text: t('menu.error', { telefon: tel }) || ('Die Karte lädt gerade nicht. Telefon: ' + tel) }));
  }

  function applyFilter(announce) {
    var f = state.filter;
    var count = 0;
    $$('.menu-cat').forEach(function (cat) {
      var any = false;
      $$('.menu-item', cat).forEach(function (item) {
        var diet = item.getAttribute('data-diet');
        var show = f === 'alle' || (f === 'vegan' && diet === 'vegan') || (f === 'vegetarisch' && (diet === 'vegetarisch' || diet === 'vegan'));
        item.hidden = !show;
        if (show) { any = true; count++; }
      });
      cat.hidden = !any;
      var tab = $('[data-tab-for="' + cat.id + '"]');
      if (tab) tab.hidden = !any;
    });
    $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f)); });
    if (announce) {
      var live = $('[data-menu-announce]');
      if (live) live.textContent = f === 'alle' ? t('menu.countAll') : t('menu.countFiltered', { anzahl: count });
    }
  }

  var spy = null;
  function setupScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('[data-menu-tabs] a').forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          if (active) {
            var ul = a.parentNode.parentNode;
            if (ul.scrollTo) ul.scrollTo({ left: a.parentNode.offsetLeft - 16, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    $$('.menu-cat').forEach(function (c) { spy.observe(c); });
  }

  /* ---------- Events ---------- */

  var EVENT_ICONS = { salsa: 'i-music', film: 'i-film', other: 'i-cal' };

  function upcomingEvents() {
    var today = berlinNow().date;
    return ((state.events && state.events.termine) || [])
      .filter(function (e) { return /^\d{4}-\d{2}-\d{2}$/.test(e.datum) && e.datum >= today; }) // Vergangenes ausblenden
      .sort(function (a, b) { return (a.datum + (a.beginn || '')).localeCompare(b.datum + (b.beginn || '')); });
  }

  function dateParts(iso) {
    var p = iso.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12));
    var locale = state.lang === 'de' ? 'de-DE' : 'en-GB';
    var f = function (opts) { opts.timeZone = 'UTC'; return new Intl.DateTimeFormat(locale, opts).format(d); };
    return {
      day: String(p[2]),
      month: f({ month: 'short' }).replace('.', ''),
      weekday: f({ weekday: 'short' }).replace('.', ''),
      long: f({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  }

  function renderEvents() {
    var root = $('[data-events-root]');
    if (!root) return;
    root.innerHTML = '';
    var events = state.events ? upcomingEvents() : [];
    $('[data-events-empty]').hidden = events.length > 0 || !state.texts;

    events.forEach(function (ev) {
      var type = EVENT_ICONS[ev.typ] ? ev.typ : 'other';
      var dp = dateParts(ev.datum);
      var time = ev.beginn
        ? (ev.ende ? t('events.timeRange', { beginn: ev.beginn, ende: ev.ende }) : t('events.time', { zeit: ev.beginn }))
        : '';
      var btn = el('button', { type: 'button', className: 'btn btn--small btn-cal', html: icon('i-cal') + '<span>' + t('events.addToCalendar') + '</span>' });
      btn.addEventListener('click', function () { downloadICS(ev); });
      var metaText = t('events.' + type) + ' · ' + dp.long + (time ? ' · ' + time.replace(/ /g, '\u00a0') : '');

      root.appendChild(el('li', { className: 'event event--' + type }, [
        el('div', { className: 'event-date', 'aria-hidden': 'true' }, [
          el('span', { className: 'event-date-wd', text: dp.weekday }),
          el('span', { className: 'event-date-day', text: dp.day }),
          el('span', { className: 'event-date-month', text: dp.month })
        ]),
        el('div', { className: 'event-body' }, [
          el('h3', { text: loc(ev.titel) }),
          el('p', { className: 'event-meta' }, [el('span', { html: icon(EVENT_ICONS[type], 'event-type-icon') }), metaText]),
          ev.beschreibung ? el('p', { className: 'event-desc', text: loc(ev.beschreibung) }) : null,
          btn
        ])
      ]));
    });
  }

  /* ---------- .ics-Kalenderdatei ---------- */

  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  /** Zeilen nach RFC 5545 auf max. 75 Byte umbrechen */
  function icsFold(line) {
    var out = [], cur = '', bytes = 0;
    var enc = window.TextEncoder ? new TextEncoder() : null;
    Array.from(line).forEach(function (ch) {
      var len = enc ? enc.encode(ch).length : 1;
      if (bytes + len > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
      cur += ch; bytes += len;
    });
    out.push(cur);
    return out.join('\r\n ');
  }
  function icsDate(iso, hhmm) { return iso.replace(/-/g, '') + 'T' + (hhmm || '00:00').replace(':', '') + '00'; }

  function downloadICS(ev) {
    var r = state.restaurant || { adresse: { strasse: 'Obere Hauptstr. 41', plz: '85354', ort: 'Freising' } };
    var place = 'Auyama, ' + r.adresse.strasse + ', ' + r.adresse.plz + ' ' + r.adresse.ort;
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Auyama Freising//Website//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Berlin',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:' + ev.datum + '-' + (ev.beginn || '0000').replace(':', '') + '-' + (ev.typ || 'event') + '@auyama-freising',
      'DTSTAMP:' + stamp
    ];
    if (ev.beginn) {
      lines.push('DTSTART;TZID=Europe/Berlin:' + icsDate(ev.datum, ev.beginn));
      if (ev.ende) lines.push('DTEND;TZID=Europe/Berlin:' + icsDate(ev.datum, ev.ende));
    } else {
      lines.push('DTSTART;VALUE=DATE:' + ev.datum.replace(/-/g, ''));
    }
    var title = loc(ev.titel);
    var typeLabel = t('events.' + (EVENT_ICONS[ev.typ] ? ev.typ : 'other'));
    if (typeLabel && title.toLowerCase().indexOf(typeLabel.toLowerCase()) === -1) title = typeLabel + ': ' + title;
    lines.push('SUMMARY:' + icsEscape(title));
    if (ev.beschreibung) lines.push('DESCRIPTION:' + icsEscape(loc(ev.beschreibung)));
    lines.push('LOCATION:' + icsEscape(place));
    if (/^https?:/.test(window.location.href)) lines.push('URL:' + window.location.href.split('#')[0]);
    lines.push('END:VEVENT', 'END:VCALENDAR');

    var blob = new Blob([lines.map(icsFold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: 'auyama-' + ev.datum + '.ics' });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  /* ---------- Sprache ---------- */

  function detectLang() {
    var saved = storageGet(LANG_KEY);
    if (saved === 'de' || saved === 'en') return saved;
    var langs = navigator.languages || [navigator.language || 'de'];
    return /^de\b/i.test(langs[0] || 'de') ? 'de' : 'en';
  }

  function applyTexts() {
    if (!state.texts) return;
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(function (n) { var v = t(n.getAttribute('data-i18n')); if (v) n.textContent = v; });
    $$('[data-i18n-html]').forEach(function (n) { var v = t(n.getAttribute('data-i18n-html')); if (v) n.innerHTML = v; });
    $$('[data-i18n-attr]').forEach(function (n) {
      n.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        var v = t(p[1]);
        if (v) n.setAttribute(p[0].trim(), v);
      });
    });
    document.title = t('meta.title') || document.title;
    var desc = $('meta[name="description"]');
    if (desc && t('meta.description')) desc.setAttribute('content', t('meta.description'));
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === state.lang)); });
    updateNavToggleLabel();
  }

  function setLang(lang, persist) {
    state.lang = lang;
    if (persist) storageSet(LANG_KEY, lang);
    applyTexts();
    renderAll();
  }

  function renderAll() {
    renderContact();
    renderStatus();
    renderHours();
    renderAbc();
    if (state.menu) renderMenu();
    renderEvents();
  }

  /* ---------- Navigation ---------- */

  function updateNavToggleLabel() {
    var btn = $('.nav-toggle');
    if (!btn) return;
    var label = $('.visually-hidden', btn);
    var v = t(btn.getAttribute('aria-expanded') === 'true' ? 'nav.close' : 'nav.toggle');
    if (label && v) label.textContent = v;
  }

  function setupNav() {
    var btn = $('.nav-toggle');
    var nav = $('#main-nav');
    if (!btn || !nav) return;
    function close() {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      updateNavToggleLabel();
    }
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      updateNavToggleLabel();
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); btn.focus(); }
    });
  }

  /* ---------- Galerie ---------- */

  function setupLightbox() {
    var dialog = $('[data-lightbox-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var frame = $('[data-lightbox-frame]', dialog);
    var img = el('img', { alt: '' });
    frame.appendChild(img);
    var opener = null;
    $$('[data-lightbox]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var thumb = $('img', btn);
        img.src = btn.getAttribute('data-lightbox');
        img.alt = thumb ? thumb.alt : '';
        opener = btn;
        dialog.showModal();
      });
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------- Google Maps (lädt erst nach Klick, Datenschutz) ---------- */

  function setupMap() {
    var wrap = $('[data-map]');
    var btn = $('[data-map-load]');
    if (!wrap || !btn) return;
    btn.addEventListener('click', function () {
      var a = (state.restaurant && state.restaurant.adresse) || { strasse: 'Obere Hauptstr. 41', plz: '85354', ort: 'Freising' };
      var q = encodeURIComponent('Auyama, ' + a.strasse + ', ' + a.plz + ' ' + a.ort);
      var iframe = el('iframe', {
        src: 'https://maps.google.com/maps?q=' + q + '&z=17&output=embed&hl=' + state.lang,
        title: t('map.iframeTitle') || 'Karte', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', allowfullscreen: true
      });
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
      iframe.focus();
    });
  }

  /* ---------- Start ---------- */

  function init() {
    state.lang = detectLang();
    setupNav();
    setupLightbox();
    setupMap();
    setupTerms();

    var year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
    });
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () { state.filter = b.getAttribute('data-filter'); applyFilter(true); });
    });

    var load = function (url, key) {
      return loadJSON(url).then(function (data) { state[key] = data; }, function (err) {
        if (window.console) console.warn('Konnte ' + url + ' nicht laden:', err);
      });
    };

    Promise.all([
      load('texts.json', 'texts'),
      load('restaurant.json', 'restaurant'),
      load('menu.json', 'menu'),
      load('events.json', 'events'),
      load('lexikon.json', 'lexikon')
    ]).then(function () {
      applyTexts();
      renderAll();
      syncStructuredData();
      if (!state.menu) renderMenuError();
      setInterval(function () { renderStatus(); renderHours(); }, 60 * 1000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
