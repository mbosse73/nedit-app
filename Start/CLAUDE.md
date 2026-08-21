# Markdown-Editor im Notion-Stil — Arbeitsregeln

Ein Markdown-Editor, der den Notion-Editor in Oberfläche und Bedienung
kopiert: Blöcke statt Zeilen, Slash-Menü, Blockgriff, schwebende
Auswahlleiste, „Umwandeln in". Was dabei herauskommt, ist und bleibt
eine `.md`-Datei.

Dazu, seit Schritt 10, die andere Hälfte: **ansehen und ausgeben.**
Eine Vorschau in Echtzeit, acht Themen für das Dokument, eine
Seiteneinrichtung und fünf Ausgabeformate. Die tragende Regel dabei
ist dieselbe wie beim Schreiben: **eine Quelle, drei Ausgaben.**
Vorschau, Druck und Export kommen aus derselben Funktion und können
nicht auseinanderlaufen (`doku/ENTSCHEIDUNGEN.md`, Punkt 17).

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
2. **Keine externen Abhängigkeiten, kein Netz.** Kein `<script src>`,
   kein `<link>`, kein `@import`, kein CDN, keine Webfonts. Auch keine
   Markdown-Bibliothek, kein Syntax-Färber, kein ZIP-Packer und kein
   PDF-Erzeuger — der Umwandler steht in Abschnitt 4, der Abtaster
   für die Codefarbe in Abschnitt 12, der ZIP-Packer für DOCX in
   Abschnitt 17, und alle drei werden von Hand gepflegt. Das PDF kommt
   aus dem Druckdialog des Browsers.

   **Die Anwendung greift zu keinem Zeitpunkt auf das Internet zu.**
   Nicht beim Start, nicht beim Sichern, nicht für Schriften, nicht
   für Aktualisierungen. Das schließt KI-Funktionen aus: Sie
   bräuchten eine Verbindung und einen Zugangsschlüssel. Ausdrücklich
   bestätigt im August 2026.
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
   an 27 Proben nach. Was das nicht erfüllt, gehört nicht in den
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
* Ein Block ist `{art, text}`, dazu je nach Art `fertig` (To-do),
  `sprache` (Codeblock) und `tiefe` (Einrückung, nur bei `punkt`,
  `nummer`, `todo`; fehlt, wenn sie 0 ist). `art` ist einer von:
  `absatz`, `h1`, `h2`, `h3`, `punkt`, `nummer`, `todo`, `zitat`,
  `code`, `linie`, `tabelle`, `callout`, `toggle`, `fussnote`,
  `umbruch`.
* **`tiefe` heißt nicht `stufe`.** `Z.stufe` ist die Markdown-Stufe
  des Dialektschalters; zwei Dinge gleichen Namens in einem Modell
  sind eine Fehlerquelle.
* **Ein `text` darf mehrere Zeilen haben.** Beim Absatz war das immer
  so; seit August 2026 auch bei den drei Listenarten, wenn eine
  eingerückte Fortsetzungszeile dazugehört. Der Schreiber rückt sie
  auf die Spalte des Inhalts — so weit, wie das Listenzeichen breit
  ist. `doku/ENTSCHEIDUNGEN.md`, Punkt 15.
* **Die Rohblöcke tragen ihre ganze Quelle im Feld `text`** — mitsamt
  Balken, `> [!TIP]`, `<details>`, `[^1]:` und
  `<!-- seitenumbruch -->`. Sie gehen unverändert wieder heraus.
  Deshalb hat auch für sie ein Block genau ein Feld, und der Rundlauf
  braucht keine Sonderbehandlung. Die Liste heißt `ROHBLOCK`, steht in
  Abschnitt 4 und wird an genau einer Stelle abgefragt.
* **`linie` und `umbruch` haben keinen Text.** Sie stehen in
  `OHNE_TEXT`: Backspace davor löscht sie ganz, statt in sie
  hineinzuspringen, und `blockMalen` endet für sie früh.
* Neben dem Text liegen in `Z` die Einstellungen aus der Liste
  `EINSTELLUNG` — Stufe, Thema, Satz, Vorschau-Thema, Autoscroll,
  Seitenformat, Ränder, Kopf- und Fußzeile, eigenes CSS und die Maße
  des Dokuments. Sie werden **sofort** gesichert (`bewahreSofort`),
  nicht gebündelt wie das Tippen. **Wer ein Feld hinzufügt, trägt es
  in `EINSTELLUNG` ein** — sichern und laden gehen beide über diese
  eine Liste.
* Nach jeder Änderung `bewahre()` aufrufen. Ohne das ist die Änderung
  beim Neuladen weg.
* **Arbeitsstand: localStorage.** **Datei öffnen: Dateiauswahl.**
  **Datei sichern: Download.** Ein Browsertest im Schwesterprojekt hat
  ergeben, dass Edge aus einer lokal geöffneten Datei **keinen**
  direkten Dateizugriff erlaubt; die File System Access API ist damit
  keine Option. Siehe `doku/ENTSCHEIDUNGEN.md`, Punkt 2.

---

## Aufbau von `editor.html`

Zwanzig nummerierte Abschnitte, jeder mit einem Kopfkommentar. Ändere
**genau den Abschnitt**, um den es geht — schreibe die Datei nicht neu.
Das hält Diffs klein und lesbar.

```
 1  GRUNDLAGEN           Tokens, beide Themen, Druckstil
 2  DIE BLÖCKE           Aussehen je Blockart, Leiste, Menüs
 3  DATEN                Z, bewahre, lade, melde, Stufen, Verlauf
 4  MARKDOWN             leseMarkdown, schreibeMarkdown, nummern
 5  DIE FLÄCHE           male, blockMalen, blockInhalt, Schreibmarke
 6  TIPPEN               Eingabehilfen, Tasten, Leiste, Menüs, Ziehen
 7  DER QUELLTEXT        geteilte Ansicht, Farbschicht, Umschalter
 8  GLIEDERUNG, SUCHEN   Überschriften, Fund, Inhaltsverzeichnis
 9  EINSTELLUNGEN        Stufe, Thema, Satz, Autoscroll
10  DATEIEN              Öffnen, Sichern, Neu, herunterladen
12  FARBE IM CODE        SPRACHEN, codeMalen, HTML/CSS/Markdown/Diff
13  DAS DOKUMENT         DOK_CSS, dokumentHtml, blockDokument
14  DIE VORSCHAU         vorschauMalen, Autoscroll, Vollbild, Ruhe
15  THEMEN UND STIL      VTHEMEN, dokStilSetzen, Stil-Verwalter
16  DIE SEITE            SEITEN, seitenStilSetzen, druckDokument
17  AUSGEBEN             htmlAusgeben, rtfAusgeben, docxAusgeben, ZIP
18  LANGE DOKUMENTE      Einklappen, springeZu, Fußnotenleiste
19  MEHRERE DATEIEN      zusammenfügen, Bilder als Daten-Adresse
20  SCHNELLWAHL          BEFEHLE, schnellMalen
11  TASTATUR UND START   steht als letzter Abschnitt, weil `start()`
                         am Ende der Datei aufgerufen wird
```

**Abschnitt 11 steht zuletzt in der Datei, nicht an elfter Stelle.**
Er ruft `start()` auf; alles, was `start()` braucht, muss vorher
ausgewertet sein. Neue Abschnitte kommen deshalb **vor** ihn.

`leseMarkdown` und `schreibeMarkdown` stehen mit Absicht nebeneinander
und werden **immer zusammen** geändert. `werkzeug/pruefen.mjs`
schneidet genau diesen Bereich heraus — von `const GRUPPIERT` bis zum
Kommentar `/* Auszeichnung im Text` — und führt ihn in einer Sandbox
aus. **Was der Umwandler braucht, muss deshalb in diesem Bereich
stehen**; ein Aufruf nach draußen (etwa `kann()`) bricht die
Markdown-Prüfung.

Was neu in den Umwandler kommt, bekommt eine Probe in `PROBEN`. Dort
stehen auch Gegenproben: dass ein Absatz mit Balken **keine** Tabelle
ist und ein gewöhnliches Zitat vom Callout nicht verschluckt wird.

### Eine Quelle, drei Ausgaben

`dokumentHtml()` in Abschnitt 13 baut aus den Blöcken **richtiges
HTML**. Dieselbe Zeichenkette geht in die Vorschau, in das Druckblatt
und in die exportierte Datei. **Nie eine zweite Fassung davon bauen** —
eine Vorschau, die anders gebaut ist als das Papier, ist keine
Vorschau (`doku/ENTSCHEIDUNGEN.md`, Punkt 17).

Der Stil dazu steht als Zeichenkette `DOK_CSS` im Skript und **nicht**
im `<style>`-Block: Der Export braucht ihn wörtlich. Vier Stilblöcke
hängt das Skript zur Laufzeit ein, in dieser Reihenfolge —
Grundstil, Thema, eigene Maße (`dokstil`), eigenes CSS (`eigenstil`),
Seiteneinrichtung (`seitenstil`). Wer zuletzt kommt, gewinnt.

**Kommt eine Blockart dazu, muss sie in jeden Ausgang.** `blockDokument`
(HTML), `rtfAusgeben` und `docxAusgeben` haben je einen Fall dafür;
`werkzeug/pruefen.mjs` rechnet nach, dass keiner fehlt. Eine Art, von
der ein Ausgang nichts weiß, verschwindet dort stillschweigend.

---

## Gestaltung

* Hell, ruhig, viel Weißraum. Alle Farb- und Formwerte stehen als
  Token in `:root`. Nichts weiter unten hart codieren.
* **Die Schreibspalte ist 708 Pixel breit** (`--spalte`), unabhängig
  von der Fensterbreite. Das ist Notions Maß und der wirksamste
  einzelne Griff für die Lesbarkeit.
* **Zwei Themen.** Die hellen Werte stehen in `:root`, die dunklen in
  `:root[data-thema="dunkel"]` — dort nur, was sich ändert. Eine feste
  Farbe wie `#fff` mitten im Stil bricht das zweite Thema; wo eine
  Fläche den umgekehrten Grund hat (Auswahlleiste, Meldungszettel),
  gehören `--grund` und `--tinte` über Kreuz oder ein neutrales Grau
  hin. `werkzeug/pruefen.mjs` rechnet **beide** Themen nach.
* Kontrast prüfen: tragender Text mindestens 4,5 : 1, große Schrift
  mindestens 3 : 1. **Notions eigene Grauwerte unterschreiten das** —
  `rgba(55,53,47,.62)` ergibt auf Weiß nur 3,86 : 1. Die Tokens sind
  deshalb nachgedunkelt: Der Ton bleibt, die Helligkeit nicht.
  `werkzeug/pruefen.mjs` rechnet es nach.
* Farbe codiert Dringlichkeit und Zustand, nicht Kategorie. Blau ist
  „aktiv", Rot ist „kaputt". Blockarten unterscheiden sich durch Form,
  nicht durch Farbe.
* **Das Urteil steht an drei Stellen und muss überall gleich lauten:**
  am Block, im Slash-Menü und an der Zeile im Quelltext. Es kommt
  deshalb aus einer einzigen Tabelle `URTEIL`.
* **Der Suchtreffer (`--fund`) und der Textmarker (`--marker`) sind
  zwei Farben.** Der eine ist eine Anzeige, der andere steht in der
  Datei; sie dürfen nicht gleich aussehen.
* **Das Thema der Anwendung und das Thema des Dokuments sind zwei
  Dinge.** `Z.thema` (`hell`/`dunkel`) färbt die Werkbank; `Z.vthema`
  färbt das **Dokument** in Vorschau, Druck und Export und folgt dem
  ersten **nicht** — Papier bleibt Papier, auch wenn die Werkbank
  dunkel steht. Es gibt **keinen** zweiten Satz Druck-Layouts daneben;
  er ist im August 2026 in die Themen aufgegangen
  (`doku/ENTSCHEIDUNGEN.md`, Punkt 20).
* **Die sechs Farben der Syntax-Hervorhebung stehen auf `--code-g`,
  nicht auf dem Blattgrund.** Der Prüflauf rechnet sie gegen diese
  Fläche nach.
* **Die Farbschicht im Quelltext liegt unter dem Textfeld.** Jedes
  Maß, das den Umbruch beeinflusst, steht in **genau einer** Regel für
  beide Schichten (`.qfeld textarea,.qfeld .qfarbe`). Wer dort etwas
  ändert, ändert es für beide — sonst bricht die Farbe eine Zeile
  früher als der Text und steht ab da neben der Schreibmarke.
  `doku/ENTSCHEIDUNGEN.md`, Punkt 13.

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

**Für Schritt 10 gibt es keinen Entwurf.** Vorschau, Druckvorschau,
Stil-Verwalter, Seite einrichten und Schnellwahl sind aus der
Anforderung gebaut, nicht aus einer Fläche unter `mockups/`. Wer sie
ändert, hat keinen Sollzustand — das ist ein offener Punkt und steht
so in `STAND.md`. Es stillschweigend hinzunehmen wäre schlimmer, als
es aufzuschreiben.

---

## Nach jeder Änderung prüfen

```bash
node werkzeug/pruefen.mjs
```

Läuft unter Windows, Linux und in Claude Code on the web. Keine
Abhängigkeiten. Rückgabewert 1, wenn etwas nicht stimmt.

Dreizehn Prüfungen: Syntax, externe Abhängigkeiten, gefüllte Zeichen,
`color-scheme`, Klammern im Stilblock, `display` in ID-Regeln, bemalte
Flächen, Kontrast der Tokens, **Markdown hin und zurück**,
Vollständigkeit der Entwürfe, ob jeder Block im Katalog ein Urteil
trägt, ob jedes Vorschau-Thema einen Stil und genug Kontrast hat und
ob **jede Blockart in jedem Ausgang** vorkommt.

**Danach die Datei im Browser ansehen.** Ein bestandener Prüflauf sagt
nichts über die Darstellung:

```bash
node werkzeug/schau.mjs
node werkzeug/probe.mjs
```

`probe.mjs` **bedient** die Anwendung: Es markiert Text, öffnet Menüs,
rückt ein, nimmt zurück, wechselt die Stufe — und prüft danach, was in
der Datei steht. Das ist der einzige Weg, den Rundlauf über die Fläche
zu prüfen: `pruefen.mjs` rechnet `lesen(schreiben(x))` in einer Sandbox
nach, ob ein Klick auf „Umwandeln in" dasselbe ergibt, sieht es nicht.

Wer einen Griff ändert, ändert dort die Probe mit.

Wird eine neue Regel gefunden, die sich automatisch prüfen lässt,
gehört sie in `werkzeug/pruefen.mjs` — nicht nur in dieses Dokument.

---

## Werkzeuge

| Befehl | wofür |
|---|---|
| `node werkzeug/lage.mjs` | Branch, letzte Commits, offene Punkte. Läuft beim Sitzungsbeginn von selbst |
| `node werkzeug/pruefen.mjs` | die Regelprüfung. Läuft nach jedem Schreiben als Haken automatisch mit |
| `node werkzeug/schau.mjs` | echter Browser, vier Ansichten, Druckvorschau, Tippprobe, Bilder, Skriptfehler |
| `node werkzeug/probe.mjs` | die **Bedienung** im echten Browser: markieren, Menüs, Einrücken, Verlauf, Stufen, Themen, Einklappen, Fußnoten, Codefarbe, die fünf Ausgaben, Schnellwahl, Seiteneinrichtung. 110 Proben |
| `node werkzeug/bau-mockups.mjs` | die sieben Entwürfe neu erzeugen |

---

## Sprache

Code, Kommentare, Bezeichner und Oberfläche auf Deutsch. Bestehende
Namensgebung übernehmen: `bewahre`, `melde`, `male`, `ersetze`,
`leseMarkdown`, `schreibeMarkdown`, `Z`, `bloecke`, `art`.
