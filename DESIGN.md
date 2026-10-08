---
name: Auyama Freising
description: Venezolanische und karibische Küche mitten in Freising, gebaut als Zementfliesenboden.
colors:
  grout: "#0b220e"
  verde: "#14321d"
  verde-2: "#1c4228"
  auyama: "#d08230"
  auyama-ink: "#94500f"
  auyama-soft: "#f3dab9"
  mango: "#f2b53a"
  cal: "#f6efe2"
  cal-2: "#efe5d2"
  tropico: "#2a7448"
  terracota: "#a8442a"
  ink: "#0b220e"
  ink-soft: "#3d5443"
typography:
  display:
    fontFamily: "Gloock, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(2.6rem, 6.2vw, 4.6rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  hero:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "calc(var(--t) * 0.355)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Gloock, Georgia, serif"
    fontSize: "1.85rem"
    fontWeight: 400
    lineHeight: 1.04
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  tile: "6px"
  panel: "8px"
  badge: "50%"
spacing:
  grout: "8px"
  gutter: "clamp(16px, 4vw, 40px)"
  room: "clamp(4.5rem, 10vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.auyama}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "0.7rem 1.35rem"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.mango}"
  button-verde:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.cal}"
    rounded: "{rounded.tile}"
    padding: "0.7rem 1.35rem"
  tile-status:
    backgroundColor: "{colors.cal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
  tile-menu:
    backgroundColor: "{colors.auyama}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
  tile-welcome:
    backgroundColor: "{colors.mango}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
  diet-vegan:
    backgroundColor: "{colors.tropico}"
    textColor: "#ffffff"
    rounded: "4px"
---

# Design System: Auyama Freising

## Overview

**Creative North Star: "Mosaico"**

The site is a Venezuelan cement tile floor (baldosa hidráulica) seen from above, the floor under the table in a Caracas casa. Every working part of the first viewport is a tile: the headline slab, the photo, the live status, the monthly menu link, the greeting. Rooms below are separated by cenefas, the patterned border bands of a tiled floor, and the dish ABC is a grid of tiles that turn over.

The pigments come from the logo: deep green, pumpkin and lime white, with mango, tropical green and terracotta as rare accents. Type pairs one sharp, high contrast display serif with a warm grotesk. The copy is short, warm and addresses guests with "du".

**Key Characteristics:**
- Square tiles with 6px corners and 8px grout gaps
- Authored SVG tile ornaments (corner quarter circles, four petal centre, mango dot)
- Cenefa bands as section dividers, never waves or plain rules
- Committed colour fields: whole rooms in verde or auyama, not accents on a neutral page
- One orchestrated entrance (tiles settle into the floor), one signature interaction (tiles flip)

## Colors

Pigments of poured cement tiles, pinned by the logo.

### Primary
- **Verde** (#14321d): hero slab, events room, term popover, back of ABC tiles.
- **Grout** (#0b220e): header, hero floor, footer; the gaps between tiles.

### Secondary
- **Auyama** (#d08230): primary buttons, the ABC room, monthly menu tile, tile ornament corners. Never as text on cal (use Auyama Ink).
- **Auyama Ink** (#94500f): prices, accents and display lines on cal (5.4:1).

### Tertiary
- **Mango** (#f2b53a): greeting tile, focus ring, accents on verde, selection.
- **Tropico** (#2a7448): vegan and vegetarian badges, active filter.
- **Terracota** (#a8442a): "Heute" tag, closed status dot, map pin.

### Neutral
- **Cal** (#f6efe2): ground of light rooms, status tile, ABC tile fronts. Pinned by the logo's cream.
- **Cal 2** (#efe5d2): filter and pill backgrounds.
- **Ink** (#0b220e) and **Ink Soft** (#3d5443): text on cal.

### Named Rules
**The Pigment Rule.** Colour commits at room scale: a section is verde, auyama or cal as a whole field. Accents stay accents.

**The Contrast Rule.** Cal text on verde, ink on auyama and mango. Never cal on auyama.

## Typography

**Display Font:** Gloock (fallback Bodoni 72, Didot, Georgia)
**Body Font:** Bricolage Grotesque (fallback system UI)

**Character:** Gloock brings sharp, high contrast elegance; Bricolage keeps body copy warm and slightly hand made. Gloock has one weight and no italic: emphasis is colour (auyama), never italic or bold.

### Hierarchy
- **Hero** (400, tile size × 0.355, 1.0): first viewport headline only.
- **Display** (400, clamp(2.6rem, 6.2vw, 4.6rem), 1.04): room headings; Spanish accents set here (¡Hola!, ¿Qué es eso?).
- **Title** (400, 1.3 to 1.85rem): menu categories, tile titles, event titles.
- **Body** (400, 1.0625rem, 1.6): copy, max about 52ch.
- **Label** (700, 0.78rem, 0.1em, uppercase): footer column headings only.

### Named Rules
**The No Kicker Rule.** No small label above a heading or tile title. Context goes below the title or into the title.

## Layout

Hero: a CSS grid floor of square tiles sized by the viewport (`--t`), 6 × 4 on desktop, 4 columns on tablet, 2 on phones, 8px grout. Rooms use a 1200px wrap with fluid gutters and clamp(4.5rem, 10vw, 8rem) vertical padding. The monthly menu flows in CSS columns (1, 2, 3). Events sit beside a sticky heading on wide screens. The mobile action bar (call, route, menu) is fixed at the bottom below 760px.

## Elevation & Depth

Flat by default, like a floor. Depth appears only for things that float above it: the term popover and map consent card (`0 18px 40px -14px rgba(11,34,14,.55)`), the mobile bar and the logo badge.

## Shapes

Tiles and buttons: 6px corners. Panels and popovers: 8px. The logo is always a full circle, never cropped or redrawn. Ornaments are quarter circles and pointed petals inside a square.

## Components

- **Tile:** square, 6px corners, one job each (headline, photo, status, link, greeting, ornament).
- **Cenefa:** 32px (or 16px thin) repeating band of the flor tile between rooms.
- **ABC tile:** button with front (cal, auyama corner quarter circles, Gloock word, turn icon) and back (verde, mango word, explanation); flips in 3D, crossfades under reduced motion.
- **Term:** dotted auyama underline in menu text; opens the same explanation in a popover.
- **Buttons:** auyama primary, verde secondary, line or outline variants; 50px tall.
- **Event:** verde-2 panel with an auyama date tile (weekday, day, month) and an "In den Kalender" .ics button.

## Do's and Don'ts

- Do keep every first viewport element a working tile.
- Do separate rooms with cenefas.
- Do use the authored tile SVGs for ornament; extend the family rather than adding clipart.
- Don't add kickers or eyebrows above headings.
- Don't use emoji or Unicode glyphs as icons; use the inline SVG sprite.
- Don't invent dates, dishes, prices or reviews; content comes from the JSON files.
- Don't put cal text on auyama.
