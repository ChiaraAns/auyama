# Hinweise für Claude

## Versionen: jede Änderung bekommt einen neuen Link

Die Nutzerin möchte jede abgenommene Version unter einem festen Link behalten.

- `versionen/v1/` ist die gespeicherte Version 1 (Stand 08.10.2026, Commit 5724536):
  https://chiaraans.github.io/auyama/versionen/v1/
- Ordner unter `versionen/` werden **nie verändert**, außer die Nutzerin verlangt ausdrücklich eine
  Änderung an genau dieser Version.
- Nachträgliche Änderungen an Version 1 auf ausdrücklichen Wunsch: Laufband über „¡Hola,
  Freising!“ läuft langsam von selbst auf allen Geräten, mit Pause-Knopf (08.10.2026). Hauptadresse
  und `versionen/v1/` sind dabei identisch geblieben.
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
