# Auyama Freising – Website

Onepage-Website für das Restaurant **Auyama** (venezolanisch-karibische Küche & Feinkost,
Obere Hauptstr. 41, 85354 Freising).

Diese Anleitung erklärt, wie Sie **Speisekarte, Events, Öffnungszeiten und Texte selbst ändern** –
ganz ohne Programmierkenntnisse. Sie müssen nur ein paar Textdateien bearbeiten.

---

## Überblick: Welche Datei ist wofür?

| Datei | Was steht drin? | Wie oft ändern? |
|---|---|---|
| `menu.json` | Die **Monatskarte** (Gerichte, Preise, vegan/vegetarisch) | jeden Monat |
| `events.json` | **Termine** (Salsa Nights, Filmabende …) | bei jedem neuen Event |
| `restaurant.json` | **Öffnungszeiten**, Telefon, Adresse, Instagram | selten |
| `texts.json` | Alle **Texte** der Website auf Deutsch und Englisch | selten |
| `assets/` | Logo und **Fotos** | bei neuen Fotos |

Die Website liest diese Dateien beim Aufruf automatisch ein. Sie ändern also nur die Datei –
die Website passt sich von selbst an.

---

## So bearbeiten Sie eine Datei (direkt auf GitHub)

1. Öffnen Sie das Projekt auf **github.com** und klicken Sie auf die gewünschte Datei, z. B. `menu.json`.
2. Klicken Sie oben rechts auf das **Stift-Symbol** („Edit this file“).
3. Ändern Sie den Text.
4. Unten bzw. oben rechts auf **„Commit changes“** klicken → nochmal bestätigen.
5. Nach **1–2 Minuten** ist die Änderung online (ggf. Seite im Browser neu laden).

### Die drei wichtigsten Regeln für JSON-Dateien

Die Dateien sind im sogenannten JSON-Format. Das ist streng – ein fehlendes Zeichen genügt,
damit z. B. die Speisekarte nicht mehr angezeigt wird. Deshalb:

1. **Text steht immer in geraden Anführungszeichen:** `"Kürbissuppe"` – nicht `„Kürbissuppe“`.
   (Typografische Anführungszeichen *innerhalb* eines Textes sind erlaubt, z. B. `"Arepa „Reina Pepiada“"`.)
2. **Zwischen zwei Einträgen steht ein Komma** – nach dem **letzten** Eintrag einer Liste **kein** Komma.
3. **Klammern nicht löschen:** `{ }` und `[ ]` müssen immer paarweise vorhanden sein.

**Tipp:** Kopieren Sie einfach eine bestehende Zeile und ändern Sie nur die Inhalte. Wenn Sie
unsicher sind, prüfen Sie die Datei vor dem Speichern auf <https://jsonlint.com> (Inhalt
einfügen → „Validate JSON“).

---

## 1. Speisekarte ändern (`menu.json`)

### Monat ändern

Ganz oben in der Datei:

```json
"monat": { "de": "November", "en": "November" },
"jahr": "2026",
```

Die Überschrift lautet dann automatisch „Monatskarte November 2026“.

### Startseite und eigene Speisekarten-Seite

- Auf der **Startseite** steht eine appetitliche **Vorschau**: die Gerichte mit `"highlight": true`
  (am besten 3 bis 5), dazu alle Kategorien mit „ab“-Preis und ein Knopf zur ganzen Karte.
- Die **ganze Karte** steht auf der eigenen Seite `speisekarte.html`. Beide lesen dieselbe `menu.json`.
- Ein Highlight kann ein Foto bekommen: `"bild": "assets/pokebowls.jpg"` und eine Bildbeschreibung
  `"bildAlt"`. Mit `"bildFokus": "40% 78%"` lässt sich der sichtbare Bildausschnitt verschieben
  (links/rechts in %, oben/unten in %). Ohne Foto erscheint eine bunte Fliesenkachel.

### „¿Qué comemos hoy?“

Gäste wählen ihren Hunger (klein, groß, egal) und ob mit Fleisch, ohne Fleisch oder vegan, auf
Wunsch mit Getränk. Ein „Comanda“-Bon stellt daraus ein Essen aus der aktuellen Monatskarte
zusammen, mit Gesamtpreis und dem aktuellen Öffnungsstatus. Gesteuert wird das über
`"stimmung"` bei jeder Kategorie: `"leicht"` (kleiner Hunger), `"satt"` (großer Hunger) oder
`"trinken"` (Getränke). Fleisch/vegan nutzt die Labels vegetarisch/vegan.
Neue Kategorie? Einfach eine passende `"stimmung"` dazuschreiben.

### Ein Gericht

So sieht ein Gericht aus:

```json
{ "name": { "de": "Arepa vegan", "en": "Vegan arepa" }, "details": { "de": "gefüllt mit Linsen und Mango, Dips und Salat", "en": "filled with lentils and mango, dips and salad" }, "preis": "12,80", "label": "vegan" },
```

| Feld | Bedeutung | Pflicht? |
|---|---|---|
| `name` | Name des Gerichts | ja |
| `details` | Beilagen/Zutaten (kleinere Schrift darunter) | nein |
| `preis` | Preis **mit Komma**, ohne €-Zeichen, z. B. `"14,80"` | ja |
| `menge` | z. B. `"0,4 l"` (für Getränke) | nein |
| `label` | `"vegan"` oder `"vegetarisch"` – sonst ganz weglassen | nein |

- **Englisch ist optional:** Sie können auch nur `"name": "Kürbissuppe"` schreiben. Dann sehen
  englischsprachige Gäste den deutschen Text.
- **Gericht löschen:** die ganze Zeile von `{` bis `},` entfernen (Komma-Regel beachten!).
- **Gericht hinzufügen:** eine bestehende Zeile kopieren, darunter einfügen, Inhalt ändern.
- Über die Filter-Knöpfe „Vegetarisch“ / „Vegan“ sehen Gäste nur die passenden Gerichte.
  Vegane Gerichte erscheinen auch beim Filter „Vegetarisch“.

> **Bitte prüfen:** Die Labels „vegan“/„vegetarisch“ wurden im Entwurf nur dort gesetzt, wo es aus
> der Beschreibung eindeutig hervorgeht. Bitte bestätigen Sie, ob das stimmt (z. B. Dressings,
> Dips, Brühen der Suppen) – Suppen haben bewusst noch kein Label.

### Kategorien

Die Gerichte sind in `"kategorien"` gruppiert (Suppen, Bowls & Salate, …). Jede Kategorie hat
einen Namen und optional ein Foto (`"bild"`, `"bildAlt"` = Bildbeschreibung für blinde Gäste).
Neue Kategorie: eine bestehende Kategorie komplett kopieren (von `{` mit `"id"` bis zum
passenden `},`) und anpassen. Die `"id"` muss eindeutig sein, kleingeschrieben, ohne Leerzeichen
und Umlaute (z. B. `"desserts"`).

Der Allergen-Hinweis unter der Karte steht ganz unten bei `"fussnote"`.

---

## 2. Events ändern (`events.json`)

Ein Termin sieht so aus:

```json
{
  "typ": "salsa",
  "datum": "2026-11-14",
  "beginn": "19:00",
  "ende": "23:00",
  "titel": { "de": "Salsa Night mit DJ", "en": "Salsa night with DJ" },
  "beschreibung": { "de": "Tanzen bis Mitternacht. Eintritt frei.", "en": "Dance the night away. Free entry." }
},
```

| Feld | Bedeutung |
|---|---|
| `typ` | `"salsa"` (Noten-Symbol) oder `"film"` (Film-Symbol), sonst Stern |
| `datum` | **Jahr-Monat-Tag**, z. B. `"2026-11-14"` für den 14. November 2026 |
| `beginn` / `ende` | Uhrzeit, z. B. `"19:00"`. `ende` ist optional |
| `titel`, `beschreibung` | Text auf Deutsch und (optional) Englisch |

- **Vergangene Termine verschwinden automatisch** am Tag nach dem Event – Sie müssen sie nicht löschen
  (können es aber, damit die Datei übersichtlich bleibt).
- Die Reihenfolge ist egal, die Website sortiert nach Datum.
- Jeder Termin bekommt automatisch einen Knopf **„In den Kalender“** (Kalenderdatei für
  iPhone, Android, Outlook).
- Sind keine kommenden Termine eingetragen, zeigt die Website einen freundlichen Hinweis auf Instagram.

> **Wichtig:** Die Website zeigt nur Termine, die hier eingetragen sind. Instagram-Posts werden
> **nicht** automatisch übernommen (dafür bräuchte es einen Zugang zur Instagram-Schnittstelle,
> den eine einfache Website nicht sicher speichern kann). Neue Salsa Nights also bitte hier
> eintragen, am besten gleich, wenn sie auf Instagram angekündigt werden.

---

## 3. Öffnungszeiten ändern (`restaurant.json`)

```json
"oeffnungszeiten": {
  "montag": [],
  "dienstag": ["12:00-16:00"],
  "mittwoch": ["12:00-16:00"],
  "donnerstag": ["12:00-16:00"],
  "freitag": ["12:00-21:00"],
  "samstag": ["12:00-21:00"],
  "sonntag": []
},
```

- **Geschlossen:** leere Klammern `[]`.
- **Mittagspause:** zwei Zeiten, z. B. `["12:00-14:30", "17:30-21:00"]`.
- Automatisch aktualisiert werden: der **Live-Status** („Geöffnet, heute bis 16:00 Uhr“ /
  „Geschlossen, wir öffnen am Dienstag um 12:00 Uhr“, deutsche Zeit), die **Tabelle** mit dem
  heutigen Tag hervorgehoben, die Kurzfassung in der Fußzeile und die Angaben für **Google**.
- **Sonderhinweis** (z. B. Urlaub): unter `"sonderhinweis"` eintragen, z. B.
  `"de": "Vom 24.12. bis 6.1. machen wir Urlaub."` – leer lassen (`""`), wenn es nichts gibt.

> **Für Google:** In `index.html` stehen die Öffnungszeiten zusätzlich im Abschnitt
> `application/ld+json`. Die Website aktualisiert diese Angaben automatisch, Google liest sie
> also korrekt. Wer ganz sicher gehen will, passt sie dort bei einer dauerhaften Änderung
> zusätzlich an. Und: Öffnungszeiten auch im **Google-Unternehmensprofil** ändern!

In derselben Datei stehen außerdem **Telefon**, **Adresse** und **Instagram**.
`telefonLink` ist die Nummer im internationalen Format ohne Leerzeichen (`+491702321409`) – das
ist die Nummer, die beim Antippen von „Anrufen“ gewählt wird.

---

## 4. Texte ändern (`texts.json`)

Alle Texte der Website stehen hier – oben Deutsch (`"de"`), darunter Englisch (`"en"`).
Ändern Sie nur den Text **rechts vom Doppelpunkt**. Wörter in geschweiften Klammern wie
`{zeit}` oder `{monat}` sind Platzhalter, die die Website automatisch füllt – bitte stehen lassen.

Die Website spricht Gäste mit **„du“** an. Wer lieber „Sie“ möchte, ändert das hier.

---

## 5. Fotos austauschen (`assets/`)

- Neues Foto **mit demselben Dateinamen** in den Ordner `assets/` hochladen (z. B. `pokebowls.jpg`
  ersetzen) – fertig.
- Empfehlung: JPG, ca. **1200 px** an der langen Seite, unter **300 KB** (z. B. mit
  <https://squoosh.app> verkleinern). Hochformat oder quadratisch funktioniert am besten.
- **Wichtig:** Die aktuellen Fotos stammen teils von Gästen (Google). Für die Live-Version bitte
  durch **eigene Fotos** ersetzen, wegen der Bildrechte.

| Datei | Wo zu sehen? |
|---|---|
| `logo.jpg` | Kopfzeile, Fußzeile |
| `pokebowls.jpg` | Startbereich, Vorschau, Speisekarte (Bowls), Galerie |
| `salat-mango-avocado.jpg` | Über uns, Vorschau, Galerie |
| `burrito-guacamole.jpg` | Vorschau, Speisekarte (Burritos), Galerie |
| `burrito-salsa.jpg` | Über uns, Galerie |
| `og-image.jpg` | Vorschaubild beim Teilen (WhatsApp, Facebook …), 1200 × 630 px |
| `favicon*.png`, `favicon.ico`, `apple-touch-icon.png` | Symbol im Browser-Tab / Homescreen |

---

## Vor dem Livegang: Checkliste

- [ ] Name des Inhabers in `impressum.html` eintragen, Impressum und Datenschutz rechtlich prüfen lassen
- [ ] Aktuelle Termine (Salsa Nights, Filmabende) in `events.json` eintragen
- [ ] vegan/vegetarisch-Labels in `menu.json` bestätigen
- [ ] Eigene Fotos statt Gästefotos
- [ ] Bei eigener Domain: Adressen `https://chiaraans.github.io/auyama/` in `index.html` (Open Graph, JSON-LD) anpassen
- [ ] Link zur Website im Google-Unternehmensprofil und in der Instagram-Bio eintragen

---

## Technik (für Entwickler)

- Statisches HTML/CSS/Vanilla-JS, kein Framework, kein Build-Schritt. Läuft auf GitHub Pages
  (Settings → Pages → Branch auswählen). Alle Pfade sind relativ.
- Schriften (Gloock und Bricolage Grotesque, Google Fonts) sind **lokal** in `assets/fonts/`
  eingebunden, damit keine Daten an Google übertragen werden.
- Gestaltung: Leitidee „Mosaico“ (venezolanischer Zementfliesenboden), dokumentiert in
  `DESIGN.md`. Produktwissen in `PRODUCT.md`. Das Design-Skill **Impeccable** liegt in
  `.claude/skills/impeccable` und steht in jeder Claude-Code-Sitzung zu diesem Repo bereit.
- Google Maps lädt erst nach Klick (Zwei-Klick-Lösung, DSGVO).
- Sprache DE/EN: automatisch nach Browsersprache, Auswahl wird im Browser gespeichert.
- **Lokal testen:** Die JSON-Dateien werden per `fetch` geladen und funktionieren daher nicht
  per Doppelklick auf `index.html`. Stattdessen im Projektordner `python3 -m http.server`
  ausführen und <http://localhost:8000> öffnen.
- Dateien: `index.html` (Startseite), `speisekarte.html` (ganze Karte), `css/style.css`,
  `js/main.js`, Daten-Dateien im Hauptverzeichnis.
