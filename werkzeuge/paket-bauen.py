#!/usr/bin/env python3
"""Baut das Upload-Paket für den eigenen Webspace (z. B. www.auyama-freising.de).

Nimmt die Hauptversion aus dem Hauptverzeichnis, setzt die eigene Adresse ein,
passt den Abschnitt „Hosting“ im Datenschutz an und legt robots.txt, sitemap.xml
und eine kurze Anleitung dazu. Ergebnis: download/auyama-website.zip

Aufruf (im Hauptverzeichnis):  python3 werkzeuge/paket-bauen.py
Hosting bei Netlify (aktuell):   python3 werkzeuge/paket-bauen.py --netlify
Anderer Hoster mit Namen:        python3 werkzeuge/paket-bauen.py --hoster "Name, Anschrift"
"""
import argparse, datetime, os, re, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD_URL = 'https://chiaraans.github.io/auyama/'
FILES = ['index.html', 'speisekarte.html', 'impressum.html', 'datenschutz.html',
         'menu.json', 'events.json', 'restaurant.json', 'texts.json']
DIRS = ['css', 'js', 'assets']

ap = argparse.ArgumentParser()
ap.add_argument('--domain', default='www.auyama-freising.de')
ap.add_argument('--hoster', default='', help='Name und Anschrift des Webhosters für den Datenschutz')
ap.add_argument('--netlify', action='store_true', help='Hosting bei Netlify (USA): passender Datenschutz-Absatz')
args = ap.parse_args()
new_url = 'https://' + args.domain + '/'

if args.netlify:
    # Netlify sitzt in den USA: Übermittlung in ein Drittland muss genannt werden
    HOSTING = ('<p>Diese Website wird bei Netlify, Inc., San Francisco, USA, gehostet. Beim Aufruf verarbeitet '
               'Netlify technisch notwendige Daten wie Ihre IP-Adresse, Datum und Uhrzeit des Abrufs und die '
               'aufgerufene Seite, um die Website auszuliefern und abzusichern. Dabei können Daten in die USA '
               'übermittelt werden. Rechtsgrundlage ist unser berechtigtes Interesse an einer sicheren und stabilen '
               'Website (Art. 6 Abs. 1 lit. f DSGVO). Mit Netlify besteht ein Vertrag zur Auftragsverarbeitung '
               '(Art. 28 DSGVO), der die Standardvertragsklauseln der EU-Kommission enthält (Art. 46 DSGVO). '
               'Mehr dazu: <a href="https://www.netlify.com/privacy/" rel="noopener">netlify.com/privacy</a>.</p>')
else:
    hoster = ('unserem Webhoster ' + args.hoster) if args.hoster else 'unserem Webhoster'
    HOSTING = ('<p>Diese Website liegt auf den Servern von ' + hoster + '. Beim Aufruf verarbeitet der Hoster '
               'technisch notwendige Daten wie Ihre IP-Adresse, Datum und Uhrzeit des Abrufs und die aufgerufene Seite, '
               'um die Website auszuliefern und abzusichern. Rechtsgrundlage ist unser berechtigtes Interesse an einer '
               'sicheren und stabilen Website (Art. 6 Abs. 1 lit. f DSGVO). Mit dem Hoster besteht ein Vertrag zur '
               'Auftragsverarbeitung (Art. 28 DSGVO).</p>')

def transform(name, text):
    text = text.replace(OLD_URL, new_url)
    if name == 'datenschutz.html':
        text, n = re.subn(r'(<h2>Hosting</h2>\n)(?:\s*<!--.*?-->\n)?\s*<p>Diese Website wird über GitHub Pages.*?</p>',
                          lambda m: m.group(1) + '    ' + HOSTING, text, flags=re.S)
        assert n == 1, 'Hosting-Absatz im Datenschutz nicht gefunden'
    assert 'github' not in text.lower(), name + ' enthält noch GitHub'
    return text

today = datetime.date.today().isoformat()
extra = {
    'robots.txt': 'User-agent: *\nAllow: /\n\nSitemap: ' + new_url + 'sitemap.xml\n',
    'sitemap.xml': ('<?xml version="1.0" encoding="UTF-8"?>\n'
                    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                    '  <url><loc>' + new_url + '</loc><lastmod>' + today + '</lastmod></url>\n'
                    '  <url><loc>' + new_url + 'speisekarte.html</loc><lastmod>' + today + '</lastmod></url>\n'
                    '</urlset>\n'),
    'ANLEITUNG.txt': open(os.path.join(ROOT, 'werkzeuge', 'ANLEITUNG.txt'), encoding='utf-8').read().replace('{ADRESSE}', new_url),
}

os.makedirs(os.path.join(ROOT, 'download'), exist_ok=True)
out = os.path.join(ROOT, 'download', 'auyama-website.zip')
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for name in FILES:
        text = open(os.path.join(ROOT, name), encoding='utf-8').read()
        z.writestr('auyama-website/' + name, transform(name, text))
    for d in DIRS:
        for base, _, files in os.walk(os.path.join(ROOT, d)):
            for f in sorted(files):
                full = os.path.join(base, f)
                rel = os.path.relpath(full, ROOT)
                z.write(full, 'auyama-website/' + rel)
    for name, text in extra.items():
        z.writestr('auyama-website/' + name, text)
print('Fertig:', os.path.relpath(out, ROOT), '·', new_url, '·', 'Hoster: ' + ('Netlify' if args.netlify else (args.hoster or '(ohne Namen)')))
