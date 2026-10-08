/* ==========================================================================
   Auyama Freising – Seitenlogik (Vanilla JS, kein Framework)

   Datenquellen (alle im Hauptverzeichnis, ohne Programmierkenntnisse pflegbar):
     restaurant.json – Telefon, E-Mail, Adresse, Öffnungszeiten
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

  var state = {
    lang: 'de',
    texts: null,
    restaurant: null,
    menu: null,
    events: null,
    filter: 'alle'
  };

  /* ---------- Hilfsfunktionen ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
        if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'className') node.className = attrs[k];
        else node.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function loadJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ': ' + r.status);
      return r.json();
    });
  }

  /** Text aus texts.json holen, z. B. t('status.open', {zeit: '16:00'}) */
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

  /** Mehrsprachiges Feld aus JSON: {"de": "...", "en": "..."} oder einfacher Text */
  function loc(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    return field[state.lang] || field.de || '';
  }

  function storageGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function storageSet(key, v) { try { window.localStorage.setItem(key, v); } catch (e) { /* privat-Modus */ } }

  /* ---------- Zeit in Europe/Berlin ---------- */

  /** Liefert Wochentag (0 = Montag), Minuten seit Mitternacht und Datum (JJJJ-MM-TT) in Berliner Zeit. */
  function berlinNow() {
    var parts = {};
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday);
    return {
      day: wd,
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
      if (start === null || end === null) return null;
      return { start: start, end: end };
    }).filter(Boolean).sort(function (a, b) { return a.start - b.start; });
  }

  function weekHours() {
    var oz = (state.restaurant && state.restaurant.oeffnungszeiten) || {};
    return DAY_KEYS.map(function (k) { return parseRanges(oz[k]); });
  }

  /* ---------- Live-Status "Jetzt geöffnet / Geschlossen" ---------- */

  function computeStatus() {
    var week = weekHours();
    var now = berlinNow();
    var today = week[now.day];

    for (var i = 0; i < today.length; i++) {
      var r = today[i];
      if (now.minutes >= r.start && now.minutes < r.end) {
        var soon = r.end - now.minutes <= 60;
        return { open: true, soon: soon, text: t(soon ? 'status.closingSoon' : 'status.open', { zeit: fromMinutes(r.end) }) };
      }
    }
    for (var j = 0; j < today.length; j++) {
      if (today[j].start > now.minutes) {
        return { open: false, text: t('status.opensToday', { zeit: fromMinutes(today[j].start) }) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var idx = (now.day + d) % 7;
      if (week[idx].length) {
        var zeit = fromMinutes(week[idx][0].start);
        if (d === 1) return { open: false, text: t('status.opensTomorrow', { zeit: zeit }) };
        return { open: false, text: t('status.opensOn', { tag: t('daysShort')[idx], zeit: zeit }) };
      }
    }
    return { open: false, text: t('status.closed') };
  }

  function renderStatus() {
    if (!state.restaurant || !state.texts) return;
    var s = computeStatus();
    $$('[data-status]').forEach(function (node) {
      node.hidden = false;
      node.classList.toggle('is-open', s.open && !s.soon);
      node.classList.toggle('is-soon', !!s.soon);
      $('[data-status-text]', node).textContent = s.text;
    });
  }

  /* ---------- Öffnungszeiten-Tabelle ---------- */

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
      var row = el('tr', {
        className: (isToday ? 'is-today ' : '') + (ranges.length ? '' : 'is-closed'),
        'aria-current': isToday ? 'date' : null
      }, [th, el('td', { text: times })]);
      body.appendChild(row);
    });

    var note = $('[data-hours-note]');
    var text = loc(state.restaurant.sonderhinweis);
    note.hidden = !text;
    note.textContent = text;
  }

  /* ---------- Kontaktdaten aus restaurant.json übernehmen ---------- */

  function renderContact() {
    var r = state.restaurant;
    if (!r) return;
    var a = r.adresse || {};
    var addressLine = a.strasse + ', ' + a.plz + ' ' + a.ort;
    var routeUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addressLine);

    $$('[data-tel]').forEach(function (n) { n.href = 'tel:' + r.telefonLink; });
    $$('[data-tel-text]').forEach(function (n) { n.textContent = r.telefon; });
    $$('[data-route]').forEach(function (n) { n.href = routeUrl; });
    $$('[data-address]').forEach(function (n) { n.textContent = addressLine; });
    $$('[data-street]').forEach(function (n) { n.textContent = a.strasse; });
    $$('[data-city]').forEach(function (n) { n.textContent = a.plz + ' ' + a.ort; });
    $$('[data-instagram]').forEach(function (n) { n.href = 'https://instagram.com/' + r.instagram; });
    $$('[data-email]').forEach(function (n) { n.href = 'mailto:' + r.email; });
    $$('[data-email-text]').forEach(function (n) { n.textContent = r.email; });

    // Catering-/Gruppenanfrage: mailto mit vorausgefülltem Betreff und Text
    $$('[data-mailto]').forEach(function (n) {
      n.href = 'mailto:' + r.email +
        '?subject=' + encodeURIComponent(t('mail.subject')) +
        '&body=' + encodeURIComponent(t('mail.body'));
    });
  }

  /** schema.org-Daten mit den aktuellen Öffnungszeiten aus restaurant.json abgleichen */
  function syncStructuredData() {
    var script = $('#ld-restaurant');
    var r = state.restaurant;
    if (!script || !r) return;
    try {
      var data = JSON.parse(script.textContent);
      var groups = {};
      weekHours().forEach(function (ranges, i) {
        ranges.forEach(function (rg) {
          var key = fromMinutes(rg.start) + '-' + fromMinutes(rg.end);
          (groups[key] = groups[key] || []).push(SCHEMA_DAYS[i]);
        });
      });
      data.openingHoursSpecification = Object.keys(groups).map(function (key) {
        var p = key.split('-');
        return { '@type': 'OpeningHoursSpecification', dayOfWeek: groups[key], opens: p[0], closes: p[1] };
      });
      data.telephone = r.telefonLink;
      data.address.streetAddress = r.adresse.strasse;
      data.address.postalCode = r.adresse.plz;
      data.address.addressLocality = r.adresse.ort;
      script.textContent = JSON.stringify(data, null, 2);
    } catch (e) { /* JSON-LD bleibt unverändert */ }
  }

  /* ---------- Monatskarte ---------- */

  function formatPrice(p) {
    var n = typeof p === 'number' ? p : parseFloat(String(p).replace(/\s|€/g, '').replace(',', '.'));
    if (isNaN(n)) return String(p);
    return new Intl.NumberFormat(state.lang === 'de' ? 'de-DE' : 'en-IE', { style: 'currency', currency: 'EUR' }).format(n);
  }

  var LEAF_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 4C9 4 4 9.5 4 16c0 1.4.3 2.7.8 4 1-3.6 3.6-7.4 8.2-9.5-3.6 2.8-5.6 6.2-6.4 9.5 1 .3 2 .5 3 .5C16 20.5 20 15 20 4z"/></svg>';

  function renderMenu() {
    var root = $('[data-menu-root]');
    var tabs = $('[data-menu-tabs]');
    var m = state.menu;
    if (!root || !m) return;

    var monthLabel = loc(m.monat) + ' ' + (m.jahr || '');
    $$('[data-menu-month]').forEach(function (n) { n.textContent = monthLabel; });

    var heroCard = $('[data-hero-card]');
    if (heroCard) {
      $('[data-hero-card-title]', heroCard).textContent = t('hero.cardTitle', { monat: monthLabel });
      heroCard.hidden = false;
    }

    root.innerHTML = '';
    tabs.innerHTML = '';

    (m.kategorien || []).forEach(function (cat, ci) {
      var id = 'kat-' + (cat.id || ci);
      var headingId = id + '-titel';

      tabs.appendChild(el('li', { 'data-tab-for': id }, [
        el('a', { href: '#' + id, text: loc(cat.name) })
      ]));

      var items = el('ul', { className: 'menu-items', role: 'list' });
      (cat.gerichte || []).forEach(function (g) {
        /*
         * Labels "vegetarisch" / "vegan" werden nur gesetzt, wo es eindeutig aus der
         * Beschreibung hervorgeht (Feld "label" in menu.json).
         * Bitte beim Inhaber bestätigen – vor allem bei den als "vegan" markierten
         * Gerichten (Dressings, Dips, Brühen sind aus der Beschreibung nicht ersichtlich).
         */
        var label = g.label === 'vegan' || g.label === 'vegetarisch' ? g.label : '';
        var nameNode = el('span', { className: 'menu-item-name' }, [loc(g.name)]);
        var detailsNode = null;
        if (g.menge || g.details) {
          detailsNode = el('p', { className: 'menu-item-details' }, [
            g.menge ? el('span', { className: 'menu-item-size', text: g.menge }) : null,
            g.menge && g.details ? ' · ' : null,
            g.details ? loc(g.details) : null
          ]);
        }

        var li = el('li', { className: 'menu-item', 'data-diet': label || null }, [
          el('div', { className: 'menu-item-head' }, [
            nameNode,
            el('span', { className: 'menu-item-price', text: formatPrice(g.preis) })
          ]),
          detailsNode,
          label ? el('span', { className: 'diet diet--' + label, html: LEAF_ICON + '<span>' + t('menu.' + label) + '</span>' }) : null
        ]);
        items.appendChild(li);
      });

      var section = el('section', { className: 'menu-cat', id: id, 'aria-labelledby': headingId }, [
        cat.bild ? el('div', { className: 'menu-cat-img' }, [
          el('img', { src: cat.bild, alt: loc(cat.bildAlt), loading: 'lazy', decoding: 'async', width: '828', height: '400' })
        ]) : null,
        el('h3', { id: headingId, text: loc(cat.name) }),
        items
      ]);
      root.appendChild(section);
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
    root.appendChild(el('p', { className: 'notice', text: t('menu.error', { telefon: tel }) || ('Die Speisekarte konnte nicht geladen werden. Telefon: ' + tel) }));
  }

  function applyFilter(announce) {
    var f = state.filter;
    var visibleCount = 0;
    $$('.menu-cat').forEach(function (cat) {
      var anyVisible = false;
      $$('.menu-item', cat).forEach(function (item) {
        var diet = item.getAttribute('data-diet');
        var show = f === 'alle' ||
          (f === 'vegan' && diet === 'vegan') ||
          (f === 'vegetarisch' && (diet === 'vegetarisch' || diet === 'vegan'));
        item.hidden = !show;
        if (show) { anyVisible = true; visibleCount++; }
      });
      cat.hidden = !anyVisible;
      var tab = $('[data-tab-for="' + cat.id + '"]');
      if (tab) tab.hidden = !anyVisible;
    });
    $$('[data-filter]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f));
    });
    if (announce) {
      var live = $('[data-menu-announce]');
      if (live) live.textContent = f === 'alle' ? t('menu.countAll') : t('menu.countFiltered', { anzahl: visibleCount });
    }
  }

  var spyObserver = null;
  function setupScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    if (spyObserver) spyObserver.disconnect();
    spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$('[data-menu-tabs] a').forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          if (active && a.parentNode.parentNode.scrollTo) {
            var ul = a.parentNode.parentNode;
            ul.scrollTo({ left: a.parentNode.offsetLeft - 16, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
          }
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    $$('.menu-cat').forEach(function (c) { spyObserver.observe(c); });
  }

  /* ---------- Events ---------- */

  var ICONS = {
    salsa: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 18.5V6.2l11-2.2v11.5a3 3 0 1 1-2-2.83V7.4l-7 1.4v9.7a3 3 0 1 1-2-2.83z"/></svg>',
    film: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v2h2V7zm0 4v2h2v-2zm0 4v2h2v-2zm12-8v2h2V7zm0 4v2h2v-2zm0 4v2h2v-2zM9 7v10h6V7z"/></svg>',
    other: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6L22 9.3l-5.4 4.8L18.2 21 12 17.3 5.8 21l1.6-6.9L2 9.3l7.1-.7z"/></svg>'
  };

  function upcomingEvents() {
    var today = berlinNow().date;
    var list = (state.events && state.events.termine) || [];
    return list
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
    $('[data-events-empty]').hidden = events.length > 0;

    events.forEach(function (ev) {
      var type = ICONS[ev.typ] ? ev.typ : 'other';
      var dp = dateParts(ev.datum);
      var time = ev.beginn
        ? (ev.ende ? t('events.timeRange', { beginn: ev.beginn, ende: ev.ende }) : t('events.time', { zeit: ev.beginn }))
        : '';
      var btn = el('button', { type: 'button', className: 'btn btn-small btn-mango' }, [t('events.addToCalendar')]);
      btn.addEventListener('click', function () { downloadICS(ev); });

      root.appendChild(el('li', { className: 'event-card event-card--' + type + (ev.beispiel ? ' event-card--example' : '') }, [
        ev.beispiel ? el('span', { className: 'event-badge', text: t('events.example') }) : null,
        el('div', { className: 'event-date', 'aria-hidden': 'true' }, [
          el('span', { className: 'event-date-wd', text: dp.weekday }),
          el('span', { className: 'event-date-day', text: dp.day }),
          el('span', { className: 'event-date-month', text: dp.month })
        ]),
        el('div', { className: 'event-body' }, [
          el('p', { className: 'event-type', html: ICONS[type] + '<span>' + t('events.' + type) + '</span>' }),
          el('h3', { text: loc(ev.titel) }),
          el('p', { className: 'event-meta', text: dp.long + (time ? ' · ' + time.replace(/ /g, '\u00a0') : '') }),
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
    var out = [];
    var cur = '';
    var bytes = 0;
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
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Auyama Freising//Website//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Berlin',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
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
    var typeLabel = t('events.' + (ICONS[ev.typ] ? ev.typ : 'other'));
    if (typeLabel && title.toLowerCase().indexOf(typeLabel.toLowerCase()) === -1) title = typeLabel + ': ' + title;
    lines.push('SUMMARY:' + icsEscape(title));
    if (ev.beschreibung) lines.push('DESCRIPTION:' + icsEscape(loc(ev.beschreibung)));
    lines.push('LOCATION:' + icsEscape(place));
    if (/^https?:/.test(window.location.href)) lines.push('URL:' + window.location.href.split('#')[0]);
    lines.push('END:VEVENT', 'END:VCALENDAR');

    var ics = lines.map(icsFold).join('\r\n') + '\r\n';
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
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
    var lang = state.lang;
    document.documentElement.lang = lang;

    $$('[data-i18n]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n'));
      if (v) n.textContent = v;
    });
    $$('[data-i18n-html]').forEach(function (n) {
      var v = t(n.getAttribute('data-i18n-html'));
      if (v) n.innerHTML = v;
    });
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

    $$('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
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
    if (state.menu) renderMenu();
    renderEvents();
  }

  /* ---------- Navigation (Handy) ---------- */

  function updateNavToggleLabel() {
    var btn = $('.nav-toggle');
    if (!btn) return;
    var open = btn.getAttribute('aria-expanded') === 'true';
    var label = $('.visually-hidden', btn);
    var v = t(open ? 'nav.close' : 'nav.toggle');
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

    var header = $('#site-header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll-Animationen ---------- */

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setupReveal() {
    var items = $$('.reveal');
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ---------- Galerie-Lightbox ---------- */

  function setupLightbox() {
    var dialog = $('[data-lightbox-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var img = $('[data-lightbox-img]', dialog);
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

  /* ---------- Google Maps (lädt erst nach Klick – Datenschutz) ---------- */

  function setupMap() {
    var wrap = $('[data-map]');
    var btn = $('[data-map-load]');
    if (!wrap || !btn) return;
    btn.addEventListener('click', function () {
      var a = (state.restaurant && state.restaurant.adresse) || { strasse: 'Obere Hauptstr. 41', plz: '85354', ort: 'Freising' };
      var q = encodeURIComponent('Auyama, ' + a.strasse + ', ' + a.plz + ' ' + a.ort);
      var iframe = el('iframe', {
        src: 'https://maps.google.com/maps?q=' + q + '&z=17&output=embed&hl=' + state.lang,
        title: t('map.iframeTitle') || 'Karte',
        loading: 'lazy',
        referrerpolicy: 'no-referrer-when-downgrade',
        allowfullscreen: true
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
    setupReveal();
    setupLightbox();
    setupMap();

    var year = $('[data-year]');
    if (year) year.textContent = String(new Date().getFullYear());

    $$('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-lang'), true); });
    });
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.filter = b.getAttribute('data-filter');
        applyFilter(true);
      });
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
      // Status jede Minute aktualisieren (und um Mitternacht die Tabelle)
      setInterval(function () { renderStatus(); renderHours(); }, 60 * 1000);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
