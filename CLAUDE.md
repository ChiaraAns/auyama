# Hinweise für Claude

## Versionen: jede Änderung bekommt einen neuen Link

Die Nutzerin möchte jede abgenommene Version unter einem festen Link behalten.

- `versionen/v1/` ist die gespeicherte Version 1 (Stand 08.10.2026, Commit 5724536):
  https://chiaraans.github.io/auyama/versionen/v1/
- Ordner unter `versionen/` werden **nie verändert**, außer die Nutzerin verlangt ausdrücklich eine
  Änderung an genau dieser Version.
- Nachträgliche Änderungen an Version 1 auf ausdrücklichen Wunsch: Laufband über „¡Hola,
  Freising!“ läuft auf allen Geräten gleichmäßig langsam von selbst, immer im selben Tempo (auch beim
  Scrollen), ohne Pause-Knopf (08./09.10.2026). Hauptadresse und `versionen/v1/` sind dabei identisch
  geblieben.
- `versionen/v2/` ist Version 2 (Stand 17.10.2026): neues Hero-Foto, neue Gerichtfotos, „Karibische Bowl“,
  Events & Fiestas mit Brunch und Flyer-Rückblick, Abschnitt Catering & Foodtruck, E-Mail im Kontakt:
  https://chiaraans.github.io/auyama/versionen/v2/
- `versionen/v3/` ist Version 3 (Stand 17.10.2026): „Venezuelas Küche“, Galerie und Collage nur mit eigenen
  Fotos (Gästefotos entfernt), Impressum mit Inhaber Joaquin von Dehn:
  https://chiaraans.github.io/auyama/versionen/v3/
- `versionen/v4/` ist Version 4 (Stand 18.10.2026): mitlaufende Events-Überschrift in eigenem Rahmen (iPad/Safari),
  Status- und Monatskarten-Kachel passen auf dem Handy, Catering-Text wörtlich nach der Nutzerin, Bildnachweis:
  https://chiaraans.github.io/auyama/versionen/v4/
- `versionen/v5/` ist Version 5 (Stand 19.10.2026): Suchmaschinen-Bots bekommen immer Deutsch (detectLang),
  sonst wie Version 4: https://chiaraans.github.io/auyama/versionen/v5/
- **Hauptversion ist Version 4** (seit 18.10.2026 auf Wunsch der Nutzerin): Die Hauptadresse
  https://chiaraans.github.io/auyama/ (Dateien im Hauptverzeichnis) entspricht `versionen/v4/`,
  nur ohne `noindex` und mit og:image auf `assets/` im Hauptverzeichnis. Sie wechselt erst, wenn
  die Nutzerin ausdrücklich eine neue Version zur Hauptversion macht.
- **Seit 18.10.2026 live unter https://www.auyama-freising.de/ (Netlify).** Die GitHub-Hauptadresse trägt
  deshalb jetzt ebenfalls `noindex` plus `<link rel="canonical">` auf die eigene Domain. Änderungen an der
  Live-Seite: Hauptverzeichnis ändern, Paket neu bauen (`--netlify`), Nutzerin lädt
  `download/auyama-website-flach.zip` bzw. den Ordner bei Netlify unter „Deploys“ hoch.
- Eigenes Hosting (Stand 18.10.2026): Domain www.auyama-freising.de bei INWX, Website gratis bei
  Netlify (Upload per Drag & Drop des Ordners, DNS bei INWX: A-Record @ → 75.2.60.5,
  CNAME www → <seite>.netlify.app). STRATO wurde verworfen. Nach jeder Änderung an der Hauptversion
  das Upload-Paket neu bauen: `python3 werkzeuge/paket-bauen.py --netlify` → `download/auyama-website.zip`
  (Datenschutz-Absatz „Hosting“ nennt dann Netlify mit USA-Hinweis).
- **Neue Änderungswünsche** werden in einem neuen Ordner `versionen/vN/` umgesetzt (N = nächste
  freie Nummer): zuerst die neueste Version dorthin kopieren, dann nur dort ändern. Danach den
  neuen Link https://chiaraans.github.io/auyama/versionen/vN/ nennen.
- Gespeicherte Versionen tragen `<meta name="robots" content="noindex">`, damit Google nur die
  Hauptadresse findet.
- Kopiert werden: `index.html`, `speisekarte.html`, `impressum.html`, `datenschutz.html`, `css/`,
  `js/`, `assets/`, `menu.json`, `events.json`, `restaurant.json`, `texts.json`. Alle Pfade sind
  relativ, deshalb funktioniert jede Kopie für sich.

## Gestaltung

Design-Skill Impeccable liegt in `.claude/skills/impeccable`. Produktwissen in `PRODUCT.md`,
Gestaltungsregeln in `DESIGN.md`, Designvertrag in `.impeccable/surfaces/`.
