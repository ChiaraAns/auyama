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
- Die Hauptadresse https://chiaraans.github.io/auyama/ (Dateien im Hauptverzeichnis) bleibt
  ebenfalls auf Version 1 stehen, solange die Nutzerin nicht ausdrücklich sagt, dass eine neue
  Version die Hauptversion werden soll.
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
