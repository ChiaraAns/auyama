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
  terracota-deep: "#9a3c24"
  white: "#ffffff"
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
  photo-inner: "3px"
  ticket: "4px"
  tile: "6px"
  sticker: "8px"
  panel: "8px"
  mood: "10px"
  price-tag: "999px"
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
  mood-button:
    backgroundColor: "{colors.auyama}"
    textColor: "{colors.ink}"
    rounded: "{rounded.mood}"
    height: "54px"
  ticket:
    backgroundColor: "{colors.cal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
  sticker:
    backgroundColor: "{colors.mango}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sticker}"
  price-tag:
    backgroundColor: "{colors.mango}"
    textColor: "{colors.ink}"
    rounded: "{rounded.price-tag}"
  diet-vegan:
    backgroundColor: "{colors.tropico}"
    textColor: "#ffffff"
    rounded: "4px"
---

# Design System: Auyama Freising

## Overview

**Creative North Star: "Mosaico"**

The site is a Venezuelan cement tile floor (baldosa hidráulica) seen from above, the floor under the table in a Caracas casa. Every working part of the first viewport is a tile: the headline slab, the photo, the live status, the monthly menu link, the greeting. Below the floor the house comes alive with playful, hand-placed things that belong on a Latin American table: a ribbon of words that moves as you scroll, photo prints with cal borders, round stamps, stickers, price tags and a paper order slip (comanda).

The pigments come from the logo: deep green, pumpkin and lime white, with mango, tropical green and terracotta as rare accents. Type pairs one sharp, high contrast display serif with a warm grotesk. The copy is short, warm and addresses guests with "du".

**Key Characteristics:**
- Square tiles with 6px corners and 8px grout gaps
- Authored SVG tile ornaments (corner quarter circles, four petal centre, mango dot)
- Cenefa bands as section dividers, never waves or plain rules
- Committed colour fields: whole rooms in verde or auyama, not accents on a neutral page
- Playful but placed: stickers, prints and price tags tilt by 2 to 6 degrees, never more
- One orchestrated entrance (tiles settle into the floor), one signature interaction (the order slip picks a dish)

## Colors

Pigments of poured cement tiles, pinned by the logo.

### Primary
- **Verde** (#14321d): hero slab, menu preview room, events room, menu page header.
- **Grout** (#0b220e): header, hero floor, footer; the gaps between tiles.

### Secondary
- **Auyama** (#d08230): primary buttons, the scrolling ribbon, monthly menu tile, tile ornament corners. Never as text on cal (use Auyama Ink).
- **Auyama Ink** (#94500f): prices, accents and display lines on cal (5.4:1).

### Tertiary
- **Mango** (#f2b53a): greeting tile, the "¿Qué comemos hoy?" room, price tags, stickers, focus ring, accents on verde, selection. On terracota only for large display text (3.8:1).
- **Terracota Deep** (#9a3c24): the "¡Hola, Freising!" room and colour dish cards; cal text on it (6.0:1).
- **Tropico** (#2a7448): vegan and vegetarian badges, active filter.
- **Terracota** (#a8442a): "Heute" tag, closed status dot, map pin.

### Neutral
- **Cal** (#f6efe2): ground of light rooms, status tile, name plates, photo frames, the order slip. Pinned by the logo's cream.
- **Cal 2** (#efe5d2): filter and pill backgrounds.
- **Ink** (#0b220e) and **Ink Soft** (#3d5443): text on cal.

### Named Rules
**The Pigment Rule.** Colour commits at room scale: a section is verde, auyama or cal as a whole field. Accents stay accents.

**The Contrast Rule.** Cal text on verde and terracota deep, ink on auyama and mango. Never cal on auyama.

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

Hero: a CSS grid floor of tiles that always fills the viewport: 6 × 4 on desktop and tablets in landscape (row height from the viewport, columns capped at 1.22 × row), 4 columns filling the screen height on tablets in portrait, 2 columns scrolling on phones, 8px grout. Rooms use a 1200px wrap with fluid gutters and clamp(4.5rem, 10vw, 8rem) vertical padding. The home page shows a menu preview (bento of highlight dishes, category chips with "ab" prices, button to the full menu); the full monthly menu lives on `speisekarte.html` and flows in CSS columns (1, 2, 3). Events sit beside a sticky heading on wide screens. The mobile action bar (call, route, menu) is fixed at the bottom below 760px.

## Elevation & Depth

Flat by default, like a floor. Depth appears only for things placed on top of it: photo prints, stickers, price tags, the order slip (drop shadow), the map consent card (`0 18px 40px -14px rgba(11,34,14,.55)`), the mobile bar and the logo badge.

## Shapes

Tiles and buttons: 6px corners. Panels and stickers: 8px. Mood buttons: 10px. Price tags: full pill. The order slip has perforated (scalloped) top and bottom edges. The logo is always a full circle, never cropped or redrawn. Ornaments are quarter circles and pointed petals inside a square.

## Components

- **Tile:** square, 6px corners, one job each (headline, photo, status, link, greeting, ornament).
- **Cenefa:** 32px (or 16px thin) repeating band of the flor tile between rooms.
- **Ribbon:** auyama band tilted −1.4°, Gloock words separated by small flor tiles; drifts slowly at a constant 30px/s on every device (scrolling does not change the speed), stops on hover and offscreen, static under reduced motion.
- **Sticker:** short fact on mango, cal, auyama or verde, 8px corners, tilted ±1 to 3°.
- **Print and stamp:** photos in 10px cal frames tilted 3 to 5°; a round mango stamp with circular text and a flor centre, slowly turning.
- **Dish card:** photo card with a cal name plate and a tilted mango price tag, or a colour card (auyama or terracota deep) with a flor corner ornament.
- **Mood button and order slip:** five coloured mood buttons; the cal order slip ("comanda") shows the picked dish, category, diet, a big Gloock price, and a tilted terracota stamp "Tu antojo de hoy".
- **Buttons:** auyama primary, verde secondary, line or outline variants; 50px tall.
- **Event:** verde-2 panel with an auyama date tile (weekday, day, month) and an "In den Kalender" .ics button.

## Do's and Don'ts

- Do keep every first viewport element a working tile.
- Do separate rooms with cenefas.
- Do use the authored tile SVGs for ornament; extend the family rather than adding clipart.
- Do keep playfulness to tilts of a few degrees, real objects (prints, stamps, tags, slips) and the palette; one playful device per element.
- Don't add kickers or eyebrows above headings.
- Don't use emoji or Unicode glyphs as icons; use the inline SVG sprite.
- Don't invent dates, dishes, prices or reviews; content comes from the JSON files.
- Don't put cal text on auyama.
