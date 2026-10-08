/* ==========================================================================
   Auyama Freising – Seitenlogik (Vanilla JS, kein Framework)

   Datenquellen (alle im Hauptverzeichnis, ohne Programmierkenntnisse pflegbar):
     restaurant.json – Telefon, Adresse, Instagram, Öffnungszeiten
     menu.json       – Monatskarte
     events.json     – Termine
     texts.json      – alle Texte auf Deutsch und Englisch
   ========================================================================== */
(function () {
  'use strict';

  var TZ = 'Europe/Berlin';
  var DAY_KEYS = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
  var SCHEMA_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var LANG_KEY = 'auyama-lang';

  var state = { lang: 'de', texts: null, restaurant: null, menu: null, events: null, filter: 'alle',
    crav: { hunger: 'egal', meat: 'ja', drink: true, dish: null, drinkPick: null, no: 42 } };

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

  /* ---------- Monatskarte (eigene Seite) ---------- */

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
    var monthLabel = renderMonth();

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
        var nameNode = el('span', { className: 'menu-item-name', text: loc(g.name) });
        var detailsNode = null;
        if (g.menge || g.details) {
          detailsNode = el('p', { className: 'menu-item-details' }, [
            g.menge ? el('span', { className: 'menu-item-size', text: g.menge }) : null,
            g.menge && g.details ? ' · ' : null
          ]);
          if (g.details) detailsNode.appendChild(document.createTextNode(loc(g.details)));
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

    if (document.body.classList.contains('page-menu')) {
      document.title = t('fullmenu.metaTitle', { monat: monthLabel });
      var d = $('meta[name="description"]');
      if (d && t('fullmenu.metaDescription')) d.setAttribute('content', t('fullmenu.metaDescription'));
    }

    var foot = $('[data-menu-footnote]');
    if (foot && m.fussnote) foot.textContent = loc(m.fussnote);

    applyFilter(false);
    setupScrollSpy();
  }

  /** Monat in Überschriften und Hero-Fliese */
  function renderMonth() {
    var m = state.menu;
    if (!m) return '';
    var monthLabel = loc(m.monat) + ' ' + (m.jahr || '');
    $$('[data-menu-month]').forEach(function (n) { n.textContent = monthLabel; });
    var heroMenu = $('[data-hero-menu]');
    if (heroMenu) heroMenu.textContent = t('hero.menuTitle', { monat: monthLabel });
    return monthLabel;
  }

  function priceValue(p) {
    var n = typeof p === 'number' ? p : parseFloat(String(p).replace(/\s|€/g, '').replace(',', '.'));
    return isNaN(n) ? null : n;
  }

  /* ---------- Startseite: Vorschau der Monatskarte ---------- */

  function renderPreview() {
    var root = $('[data-preview-root]');
    var cats = $('[data-preview-cats]');
    var m = state.menu;
    if (!root || !m) return;
    renderMonth();

    var picks = [];
    (m.kategorien || []).forEach(function (cat) {
      (cat.gerichte || []).forEach(function (g) { if (g.highlight) picks.push({ g: g, cat: cat }); });
    });
    // Mit Foto zuerst, damit die große Kachel immer ein Bild hat
    picks.sort(function (a, b) { return (b.g.bild ? 1 : 0) - (a.g.bild ? 1 : 0); });
    picks = picks.slice(0, 5);

    root.innerHTML = '';
    var colorIndex = 0;
    picks.forEach(function (p, i) {
      var g = p.g;
      var label = g.label === 'vegan' || g.label === 'vegetarisch' ? g.label : '';
      var plate = el('div', { className: 'dish-plate' }, [
        el('h3', { className: 'dish-name', text: loc(g.name) }),
        g.details ? el('p', { className: 'dish-details', text: loc(g.details) }) : null,
        label ? el('span', { className: 'diet diet--' + label, html: icon('i-leaf', '') + '<span>' + t('menu.' + label) + '</span>' }) : null
      ]);
      var cls = 'dish' + (i === 0 ? ' dish--lead' : '');
      if (g.bild) cls += ' dish--photo';
      else cls += ' dish--color ' + (colorIndex++ % 2 === 0 ? 'dish--auyama' : 'dish--terracota');
      root.appendChild(el('li', { className: cls }, [
        g.bild ? el('img', { className: 'dish-img', src: g.bild, alt: loc(g.bildAlt), loading: 'lazy', decoding: 'async', width: '828', height: '1000', style: g.bildFokus ? 'object-position: ' + g.bildFokus : null }) : null,
        el('span', { className: 'dish-price', text: formatPrice(g.preis) }),
        plate
      ]));
    });

    if (cats) {
      cats.innerHTML = '';
      (m.kategorien || []).forEach(function (cat, ci) {
        var min = null;
        (cat.gerichte || []).forEach(function (g) {
          var v = priceValue(g.preis);
          if (v !== null && (min === null || v < min)) min = v;
        });
        var a = el('a', { href: 'speisekarte.html#kat-' + (cat.id || ci) }, [loc(cat.name)]);
        if (min !== null) a.appendChild(el('span', { text: t('preview.from', { preis: formatPrice(min) }) }));
        cats.appendChild(el('li', null, [a]));
      });
    }
  }

  /* ---------- ¿Qué comemos hoy? Die Comanda ---------- */

  function cravingPool(kind) {
    var c = state.crav;
    var pool = [];
    ((state.menu && state.menu.kategorien) || []).forEach(function (cat) {
      var st = cat.stimmung || [];
      var isDrink = st.indexOf('trinken') !== -1;
      (cat.gerichte || []).forEach(function (g) {
        if (kind === 'drink') { if (isDrink) pool.push({ g: g, cat: cat }); return; }
        if (isDrink) return;
        if (c.hunger !== 'egal' && st.indexOf(c.hunger) === -1) return;
        if (c.meat === 'veggie' && g.label !== 'vegetarisch' && g.label !== 'vegan') return;
        if (c.meat === 'vegan' && g.label !== 'vegan') return;
        pool.push({ g: g, cat: cat });
      });
    });
    return pool;
  }

  function pickFrom(pool, prev) {
    if (!pool.length) return null;
    var options = pool.length > 1 ? pool.filter(function (p) { return !prev || p.g !== prev.g; }) : pool;
    return options[Math.floor(Math.random() * options.length)];
  }

  /** Neues Essen (und Getränk) würfeln */
  function rollCraving() {
    var c = state.crav;
    c.dish = pickFrom(cravingPool('food'), c.dish);
    c.drinkPick = c.drink ? pickFrom(cravingPool('drink'), c.drinkPick) : null;
    c.no = 1 + Math.floor(Math.random() * 199);
  }

  function slipLine(p) {
    var g = p.g;
    var label = g.label === 'vegan' || g.label === 'vegetarisch' ? g.label : '';
    var meta = el('span', { className: 'slip-meta' }, [[loc(p.cat.name), g.menge, loc(g.details)].filter(Boolean).join(' · ')]);
    if (label) meta.appendChild(el('span', { className: 'diet diet--' + label, html: icon('i-leaf', '') + '<span>' + t('menu.' + label) + '</span>' }));
    return el('li', { className: 'slip-line' }, [
      el('span', { className: 'slip-name', text: loc(g.name) }),
      el('span', { className: 'slip-price', text: formatPrice(g.preis) }),
      meta
    ]);
  }

  function renderSlip(animate) {
    var slip = $('[data-slip]');
    if (!slip || !state.menu) return;
    var c = state.crav;
    if (!c.dish && !c.rolled) { rollCraving(); c.rolled = true; }

    $$('[data-hunger]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-hunger') === c.hunger)); });
    $$('[data-meat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-meat') === c.meat)); });
    var drinkBox = $('[data-drink]');
    if (drinkBox) drinkBox.checked = c.drink;

    var lines = $('[data-slip-lines]');
    lines.innerHTML = '';
    $('[data-slip-none]').hidden = !!c.dish;
    $('[data-slip-no]').textContent = 'Nº ' + ('00' + c.no).slice(-3);
    var total = 0;
    [c.dish, c.drinkPick].forEach(function (p) {
      if (!p) return;
      lines.appendChild(slipLine(p));
      total += priceValue(p.g.preis) || 0;
    });
    var totalWrap = $('.slip-total', slip);
    totalWrap.hidden = !c.dish;
    $('[data-slip-total]').textContent = formatPrice(total);

    if (state.restaurant && state.texts) {
      var st = computeStatus();
      var status = $('[data-slip-status]');
      status.setAttribute('data-state', st.state);
      $('[data-slip-status-text]').textContent = st.title + ' · ' + st.detail;
    }

    var live = $('[data-slip-announce]');
    if (live && animate && c.dish) {
      var names = [c.dish, c.drinkPick].filter(Boolean).map(function (p) { return loc(p.g.name); }).join(' + ');
      live.textContent = t('craving.announce', { gericht: names, preis: formatPrice(total) });
    }
    if (animate && !prefersReducedMotion()) {
      slip.classList.remove('is-new');
      void slip.offsetWidth;
      slip.classList.add('is-new');
    }
  }

  function setupCraving() {
    if (!$('[data-slip]')) return;
    var c = state.crav;
    var update = function () { rollCraving(); renderSlip(true); };
    $$('[data-hunger]').forEach(function (b) {
      b.addEventListener('click', function () { c.hunger = b.getAttribute('data-hunger'); update(); });
    });
    $$('[data-meat]').forEach(function (b) {
      b.addEventListener('click', function () { c.meat = b.getAttribute('data-meat'); update(); });
    });
    var drinkBox = $('[data-drink]');
    if (drinkBox) drinkBox.addEventListener('change', function () {
      c.drink = drinkBox.checked;
      c.drinkPick = c.drink ? pickFrom(cravingPool('drink'), null) : null;
      renderSlip(true);
    });
    var again = $('[data-slip-again]');
    if (again) again.addEventListener('click', function () {
      var dice = $('.dice', again);
      if (dice && !prefersReducedMotion()) { dice.classList.remove('is-rolling'); void dice.getBoundingClientRect(); dice.classList.add('is-rolling'); }
      update();
    });
  }

  /* ---------- Laufband & Stempel ---------- */

  /**
   * Das Laufband wandert langsam von selbst und beim Scrollen etwas schneller.
   * Pause-Knopf, Anhalten beim Darüberfahren, ausgeblendet außerhalb des Bildschirms,
   * bei „Bewegung reduzieren“ steht es still.
   */
  function setupRibbon() {
    var track = $('[data-marquee]');
    var btn = $('[data-ribbon-pause]');
    if (!track || prefersReducedMotion()) return;
    var x = 0, last = null, lastScroll = window.scrollY, boost = 0, paused = false, hover = false, visible = true;
    var SPEED = 28; // Pixel pro Sekunde
    function frame(ts) {
      if (last === null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;
      var sy = window.scrollY;
      boost = Math.min(boost + Math.abs(sy - lastScroll) * 0.03, 6);
      lastScroll = sy;
      var half = track.scrollWidth / 2;
      if (!paused && !hover && visible && half) {
        x -= SPEED * dt + boost;
        if (x <= -half) x += half;
        track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
      boost *= 0.9;
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
    var ribbon = track.parentNode;
    ribbon.addEventListener('mouseenter', function () { hover = true; });
    ribbon.addEventListener('mouseleave', function () { hover = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(ribbon);
    }
    if (btn) {
      var label = $('.visually-hidden', btn);
      var sync = function () {
        btn.setAttribute('aria-pressed', String(paused));
        if (label) label.textContent = t(paused ? 'ribbon.play' : 'ribbon.pause') || label.textContent;
      };
      btn.addEventListener('click', function () { paused = !paused; sync(); });
      sync();
    }
  }

  function renderMarquee() {
    var track = $('[data-marquee]');
    if (track) {
      var items = t('marquee');
      if (Array.isArray(items) && items.length) {
        track.innerHTML = '';
        for (var r = 0; r < 4; r++) {
          items.forEach(function (w) { track.appendChild(el('span', { className: 'ribbon-item', text: w })); });
        }
      }
    }
    var stamp = $('[data-stamp-text]');
    if (stamp && t('about.stamp')) stamp.textContent = t('about.stamp');
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
    renderMarquee();
    if (state.menu) { renderMonth(); renderMenu(); renderPreview(); renderSlip(false); }
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
    setupCraving();
    setupRibbon();

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
      load('events.json', 'events')
    ]).then(function () {
      applyTexts();
      renderAll();
      syncStructuredData();
      if (!state.menu) renderMenuError();
      if (location.hash) {
        // Sprungmarken wie speisekarte.html#kat-arepas nach dem Rendern ansteuern
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView();
      }
      setInterval(function () { renderStatus(); renderHours(); renderSlip(false); }, 60 * 1000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
