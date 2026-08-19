# Markdown-Editor im Notion-Stil — Arbeitsregeln

Ein Markdown-Editor, der den Notion-Editor in Oberfläche und Bedienung
kopiert: Blöcke statt Zeilen, Slash-Menü, Blockgriff, schwebende
Auswahlleiste, „Umwandeln in". Was dabei herauskommt, ist und bleibt
eine `.md`-Datei.

**Zielumgebung:** Windows-PC, Microsoft Edge, Datei per Doppelklick
geöffnet (`file://`). Kein Internetzugriff zur Laufzeit. Kein Server,
kein Build-Schritt.

**Wie ein Schritt abgearbeitet wird, steht in `doku/ARBEITSWEISE.md`.
Diese Datei zuerst lesen.**

Dazu `doku/ENTSCHEIDUNGEN.md` vor jeder Änderung, die etwas an der
Datei oder am Datenmodell berührt. Was gebaut wird, steht in
`doku/ROADMAP.md`, wo es steht in `STAND.md`.

---

## Harte Regeln

Diese sind nicht verhandelbar. Ein Verstoß macht die Datei unbrauchbar
oder das Format kaputt.

1. **Eine Datei.** Alles in `editor.html`. Kein Build, kein Bundler,
   keine separate `.js` oder `.css`.
2. **Keine externen Abhängigkeiten.** Kein `<script src>`, kein
   `<link>`, kein `@import`, kein CDN, kein Netzzugriff, keine
   Webfonts. Auch keine Markdown-Bibliothek — der Umwandler steht in
   Abschnitt 4 und wird von Hand gepflegt.
3. **Nur Systemschriften.** Auf Windows greift Segoe UI.
4. **`color-scheme: light` in `:root`.** Ohne diese Zeile färbt Windows
   im Dunkelmodus Scrollbalken und Formularfelder selbst ein — schwarz.
5. **Jede Fläche selbst bemalen.** `.app`, `.kopf`, `.blatt`,
   `.quelle`, `.fuss` und jede weitere Vollflächen-Komponente brauchen
   ein eigenes `background`. Sich auf `body` zu verlassen genügt nicht.
6. **Keine gefüllten Unicode-Glyphen als Icons.** Icons sind Inline-SVG
   mit `stroke="currentColor" fill="none"`. Ausgenommen ist `•`
   (U+2022) als Listenpunkt — ein Satzzeichen, kein Symbol.
7. **`display` niemals in einer ID-Regel.** `#x{display:flex}` schlägt
   `.x.aktiv{display:block}` und bricht jedes Umschalten.

### Und zwei, die nur dieses Projekt hat

8. **Markdown ist die Wahrheit.** Der Text eines Blocks ist **immer**
   Rohtext. Die Fläche zeigt ihn gerendert; gespeichert, kopiert und
   ausgegeben wird nie etwas anderes als Markdown.
   `lesen(schreiben(x))` muss `x` ergeben — der Prüflauf rechnet das
   an neun Proben nach. Was das nicht erfüllt, gehört nicht in den
   Umwandler.
9. **Kein Dialekt ohne Schalter.** Alles, was über reines Markdown
   hinausgeht — GitHub-Alerts, `==markiert==`, `[[Wiki-Links]]`,
   eingebettetes HTML —, hängt an der Stufe in den Einstellungen
   (`Rein · GitHub · Obsidian · Pandoc`) und **wird in der Oberfläche
   gekennzeichnet**. Ein Block, den die gewählte Stufe nicht kann,
   wird gar nicht erst angeboten. Die Begründung steht in
   `doku/ENTSCHEIDUNGEN.md`, Punkt 1.

---

## Datenhaltung

* Alles Veränderliche liegt im Objekt `Z`. **Nie neu zuweisen** —
  immer an Ort und Stelle ändern. Zum Austauschen des Inhalts gibt es
  `ersetze(ziel, neu)`.
* Ein Block ist `{art, text}`, dazu je nach Art `fertig` (To-do) und
  `sprache` (Codeblock). `art` ist einer von: `absatz`, `h1`, `h2`,
  `h3`, `punkt`, `nummer`, `todo`, `zitat`, `code`, `linie`.
* Nach jeder Änderung `bewahre()` aufrufen. Ohne das ist die Änderung
  beim Neuladen weg.
* **Arbeitsstand: localStorage.** **Datei öffnen: Dateiauswahl.**
  **Datei sichern: Download.** Ein Browsertest im Schwesterprojekt hat
  ergeben, dass Edge aus einer lokal geöffneten Datei **keinen**
  direkten Dateizugriff erlaubt; die File System Access API ist damit
  keine Option. Siehe `doku/ENTSCHEIDUNGEN.md`, Punkt 2.

---

## Aufbau von `editor.html`

Neun nummerierte Abschnitte, jeder mit einem Kopfkommentar. Ändere
**genau den Abschnitt**, um den es geht — schreibe die Datei nicht neu.
Das hält Diffs klein und lesbar.

```
1  GRUNDLAGEN            Tokens, Grundstil
2  DIE BLÖCKE            Aussehen je Blockart
3  DATEN                 Z, bewahre, lade, melde
4  MARKDOWN              leseMarkdown, schreibeMarkdown, inlineMalen
5  DIE FLÄCHE            male, blockMalen, Schreibmarke
6  TIPPEN                Eingabehilfen, Tasten, Ereignisse, Ziehen
7  DER QUELLTEXT         geteilte Ansicht, Umschalter
8  DATEIEN               Öffnen, Sichern, Neu
9  TASTATUR UND START
```

`leseMarkdown` und `schreibeMarkdown` stehen mit Absicht nebeneinander
und werden **immer zusammen** geändert.

---

## Gestaltung

* Hell, ruhig, viel Weißraum. Alle Farb- und Formwerte stehen als
  Token in `:root`. Nichts weiter unten hart codieren.
* **Die Schreibspalte ist 708 Pixel breit** (`--spalte`), unabhängig
  von der Fensterbreite. Das ist Notions Maß und der wirksamste
  einzelne Griff für die Lesbarkeit.
* Kontrast prüfen: tragender Text mindestens 4,5 : 1, große Schrift
  mindestens 3 : 1. **Notions eigene Grauwerte unterschreiten das** —
  `rgba(55,53,47,.62)` ergibt auf Weiß nur 3,86 : 1. Die Tokens sind
  deshalb nachgedunkelt: Der Ton bleibt, die Helligkeit nicht.
  `werkzeug/pruefen.mjs` rechnet es nach.
* Farbe codiert Dringlichkeit und Zustand, nicht Kategorie. Blau ist
  „aktiv", Rot ist „kaputt". Blockarten unterscheiden sich durch Form,
  nicht durch Farbe.

---

## Die Entwürfe

Unter `mockups/` liegen sieben statische Flächen. **Sie sind der
Sollzustand, nicht der Iststand.** Vor jeder Änderung an der
Oberfläche dort nachsehen, wie sie aussehen soll. Ändert sich der
Entwurf, wird `werkzeug/bau-mockups.mjs` geändert und neu ausgeführt —
nicht die erzeugte HTML-Datei.

**`mockups/bloecke.html` und `doku/BLOCKKATALOG.md` sind dasselbe in
zwei Formen.** Ändert sich das Urteil zu einem Block, gehört es in
beide.

---

## Nach jeder Änderung prüfen

```bash
node werkzeug/pruefen.mjs
```

Läuft unter Windows, Linux und in Claude Code on the web. Keine
Abhängigkeiten. Rückgabewert 1, wenn etwas nicht stimmt.

Geprüft werden: Syntax, externe Abhängigkeiten, gefüllte Zeichen,
`color-scheme`, Klammern im Stilblock, `display` in ID-Regeln, bemalte
Flächen, Kontrast der Tokens, **Markdown hin und zurück**,
Vollständigkeit der Entwürfe und ob jeder Block im Katalog ein Urteil
trägt.

**Danach die Datei im Browser ansehen.** Ein bestandener Prüflauf sagt
nichts über die Darstellung:

```bash
node werkzeug/schau.mjs
```

Wird eine neue Regel gefunden, die sich automatisch prüfen lässt,
gehört sie in `werkzeug/pruefen.mjs` — nicht nur in dieses Dokument.

---

## Werkzeuge

| Befehl | wofür |
|---|---|
| `node werkzeug/lage.mjs` | Branch, letzte Commits, offene Punkte. Läuft beim Sitzungsbeginn von selbst |
| `node werkzeug/pruefen.mjs` | die Regelprüfung. Läuft nach jedem Schreiben als Haken automatisch mit |
| `node werkzeug/schau.mjs` | echter Browser, drei Ansichten, Tippprobe, Bilder, Skriptfehler |
| `node werkzeug/bau-mockups.mjs` | die sieben Entwürfe neu erzeugen |

---

## Sprache

Code, Kommentare, Bezeichner und Oberfläche auf Deutsch. Bestehende
Namensgebung übernehmen: `bewahre`, `melde`, `male`, `ersetze`,
`leseMarkdown`, `schreibeMarkdown`, `Z`, `bloecke`, `art`.
