# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS, no framework, no build step, relative paths only, hosted on GitHub Pages (https://chiaraans.github.io/auyama/). Content lives in JSON files the owner edits without programming knowledge: `menu.json`, `events.json`, `restaurant.json`, `texts.json`. Two pages: `index.html` (onepager) and `speisekarte.html` (full monthly menu).

## Users

Guests of a small restaurant in Freising's old town: lunch guests from Freising, people strolling through the Altstadt, and international students from TU München (many browse in English). Confirmed by the user: all three groups are weighted equally. Most visits happen on a phone, often on the street, deciding where to eat right now.

The second audience is the owner, who sees this page first as a pitch: it must look finished and show at a glance that it brings guests and saves work.

## Product Purpose

Auyama has no website yet. The page should bring guests (find it, understand it, want to go) and take work off the owner (opening hours, monthly menu, events and directions answered without a phone call). Success: a first-time visitor knows within seconds what Auyama is, whether it is open now, and how to get there or call.

## Positioning

Venezuelan-Caribbean cooking and a deli ("Feinkost") in the middle of Freising's Altstadt, run with a family feel. Per the owner's own Instagram (Oct 2021, supplied by the user): housed in the renovated old Entleutner-Haus on Obere Hauptstraße; homemade specialities, fine wines and a changing lunch menu of exotic dishes made from regional ingredients; the shop sells wines and preserves (jams, chutneys, pestos, sauces); seating shared with the café in the courtyard (Hinterhof). "Auyama" is the Venezuelan word for pumpkin. The menu changes every month. The place hosts salsa nights with a DJ and film nights.

## Operating Context

- Opening hours: Tue to Thu 12:00 to 16:00, Fri and Sat 12:00 to 21:00, Sun and Mon closed (timezone Europe/Berlin).
- Address: Obere Hauptstr. 41, 85354 Freising. Phone 0170 2321409. Instagram @auyama_freising.
- Monthly menu ("Monatskarte"), currently October 2026, with prices from info.md only.
- Events announced on Instagram; one confirmed event: film night "La Clave – Das Geheimnis der kubanischen Musik", 11.10.2026, 17:00, free entry.

## Capabilities and Constraints

Live open/closed status, today highlighted in the hours table, sticky mobile action bar (call, route, menu), monthly menu preview on the home page (highlight dishes, category prices) with a separate full menu page (category jump links, vegetarian/vegan filter), "¿Qué comemos hoy?" dish picker by mood (light, filling, meat free, drinks, surprise) drawn from the monthly menu, events with automatic hiding of past dates and .ics download, DE/EN language switch, click-to-load Google Map (GDPR), local SEO with schema.org Restaurant JSON-LD.

Removed by user request: the dish glossary tiles ("¿Qué es eso?").

Removed by user request in Version 1: the "Feinkost & Catering" section and the catering enquiry. Re-added by user request in Version 2 as "Catering & Foodtruck" with real facts and a mailto enquiry. The user asked that the site look finished: no visible draft labels, placeholders or "example" badges.

## Brand Commitments

- Logo: round image on white (pumpkin mark, "auyama" wordmark, "FEINKOST"). Never redrawn or altered; used only as a round badge, and only in a refined way.
- Colors from the logo, pinned by the user: pumpkin orange (#D08230), deep dark green (#0B220E), cream. Accents allowed: mango yellow, tropical green, terracotta.
- Small Spanish accents in headings ("¡Bienvenidos!", "Buen provecho"), everything else German, English via switch.
- Voice: short, warm, heartfelt, no dashes in running copy. Guests are addressed with "du" (confirmed by the user). Caribbean and Latin American energy, salsa warmth, but high-end and modern, never kitsch. No palm clipart, no emoji decoration.

## Evidence on Hand

- Real menu with prices (`menu.json`, from info.md). No ratings, reviews, awards or press exist; never invent any.
- Photos: from Version 3 only the owner's own photos (guest photos from Google removed; the salad bowl with avocado and sprouts is kept at the user's request). People shown on the photos have consented (confirmed by the user).
- Operator: Joaquin von Dehn (Auyama Feinkost). Opening hours as on the site are correct (confirmed by the user). The owner wants to host the site himself; as of 18.10.2026 there is no hosting provider yet and auyama.de is not booked anywhere by them. All photos by Joaquin von Dehn. Catering venue text must stay word for word as the user wrote it: „Gerne vermieten wir auch die Räume des Auyama/Hinterhof und des Café Nebenan. Dort verwöhnen wir euch mit unserem Catering.“ (Café Nebenan is written with capital N).
- Salsa nights have no confirmed dates; never invent dates. Confirmed by the user: show only real, current dated events (from `events.json`), no dateless format cards.
- Feinkost: mention in the About text with the facts above (wines, preserves, homemade, regional ingredients); no separate section.
- Email: auyama@gmx.de (supplied by the user, Oct 2026).
- Catering (supplied by the user, Oct 2026, shown from Version 2): over 20 years of catering experience; weddings, birthdays and other celebrations; 15 to 250 guests; food truck; Auyama's rooms, the courtyard and the café next door can be rented for events with Auyama catering.
- Brunch: monthly; next date Sunday 18.10.2026, 09:00 to 14:30, 36 € per person incl. Caribbean buffet and speciality drinks (from the owner's flyer).
- Past events (flyers, all supplied by the user): Unter dem Feigenbaum (flamenco, 20.09.2025), Latin opening (30 April, salsa DJ), Caribbean Tapas live music (31 July), Salsa Night (21.08, DJ Cristobal), film night La Clave (11.10.2026).

## Product Principles

1. Answer the visitor's real questions first: is it open, what is on the menu, where is it.
2. Every word true: no invented dishes, prices, dates, reviews or claims.
3. The owner must be able to keep it current alone, by editing JSON.
4. Warm and personal over polished and corporate.

## Accessibility & Inclusion

WCAG AA contrast, keyboard focus styles, semantic HTML, alt texts, prefers-reduced-motion respected, bilingual DE/EN.
