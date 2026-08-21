# Markdown-Editor im Notion-Stil

Ein Markdown-Editor, der sich wie Notion bedienen lässt — Blöcke statt
Zeilen, Slash-Menü, Blockgriff, „Umwandeln in" — und trotzdem nichts
anderes schreibt als eine `.md`-Datei.

Dazu die andere Hälfte: **ansehen und ausgeben.** Eine Vorschau in
Echtzeit, acht Themen für das Dokument, eine Seiteneinrichtung mit
Kopf- und Fußzeile und fünf Ausgabeformate.

**Eine Datei, offline, per Doppelklick.** Kein Server, kein Build, keine
Abhängigkeiten.

```
editor.html          die Anwendung
mockups/             sieben Entwürfe — der Sollzustand
doku/                Konzept, Blockkatalog, Entscheidungen, Roadmap
werkzeug/            Prüflauf, Browserproben, Generator für die Entwürfe
```

## Anfangen

```bash
node werkzeug/lage.mjs        # wo steht das Projekt
node werkzeug/pruefen.mjs     # Regelprüfung
node werkzeug/schau.mjs       # im echten Browser ansehen
node werkzeug/probe.mjs       # die Bedienung im echten Browser proben
```

`editor.html` per Doppelklick öffnen. `mockups/index.html` zeigt, wie
die Schreibfläche aussehen soll.

## Schreiben

Blöcke aus Markdown lesen und verlustfrei wieder schreiben.
Eingabehilfen (`# `, `- `, `1. `, `- [ ] `, `> `, ` ``` `, `---`).
Der Block unter der Schreibmarke zeigt seinen **Rohtext**, alle anderen
das Ergebnis. Enter teilt, Backspace verschmilzt.

**Die drei Griffe:** `/` öffnet das Slash-Menü — mit dem Kürzel in
jeder Zeile und einer Vorschau, *was in die Datei kommt*. Text
markieren holt die Auswahlleiste zum Text. Der Griff links am Absatz
zieht ihn an eine andere Stelle oder öffnet Löschen, Duplizieren und
**Umwandeln in**.

Dazu: `Tab` rückt Listen ein. Tabelle, Callout, Toggle, **Fußnote** und
**Seitenumbruch**, jeder mit sichtbarem Urteil. Der Dialektschalter
`Rein · GitHub · Obsidian · Pandoc` — dieselbe Fläche, andere Ausgabe.
Rückgängig über Blockgrenzen. Der Quelltext **farbig**, und jede Zeile
jenseits des reinen Markdown eigens gekennzeichnet.

## Sich zurechtfinden

Gliederung und **Fußnotenleiste** rechts. Suche im Dokument
(`Strg+F`). Inhaltsverzeichnis auf Knopfdruck. Der Griff an einer
Überschrift **klappt den Abschnitt ein** — die Zahl der verborgenen
Blöcke steht am Titel. `Strg+K` öffnet die **Schnellwahl**:
Überschrift, Fußnote oder Befehl.

`Strg+Umschalt+R` schaltet alles weg außer dem Text,
`Strg+Umschalt+V` geht ins Vollbild.

## Ansehen

Die Ansicht **Vorschau** zeigt das fertige Dokument neben der
Schreibfläche — richtiges HTML statt Blockzeilen, in Echtzeit, und sie
**folgt der zuletzt geänderten Stelle**.

Unter **Stil** stehen acht Themen für das Dokument — *Wie der Editor,
Papier, Buchsatz, Technische Doku, Zeitung, Hoher Kontrast,
Manuskript, Schreibmaschine* —, dazu Spaltenbreite, Schriftgröße,
Zeilenabstand und ein Feld für **eigenes CSS**.

Codeblöcke sind **farbig**, in über fünfzig Sprachen. Der Abtaster
dafür steht in `editor.html` und ist von Hand geschrieben; eine
Bibliothek wäre hier ausgeschlossen.

## Ausgeben

| Format | Bilder | wie |
|---|---|---|
| Markdown `.md` | als Verweis | die Datei selbst |
| HTML `.html` | eingebettet | eigenständige Seite mit Stil |
| PDF | eingebettet | über den Druckdialog |
| Word `.docx` | nein | ein ZIP mit sechs XML-Teilen, von Hand |
| RTF `.rtf` | nein | reiner Text mit Steuerwörtern |

Dazu die **Zwischenablage** als HTML, RTF oder Markdown.

Unter **Seite einrichten**: Seitengröße (A3 bis Legal), Hoch- und
Querformat, vier Ränder, eine **mitlaufende Kopf- und Fußzeile mit
Bild** und der Umbruch vor jeder Überschrift. Die **Druckvorschau**
zeigt die Seite maßhaltig.

**Die Seitenzahl setzt der Browser** — sie steht in seinem
Druckdialog, und die Karte sagt das auch.

## Mehrere Dateien

```
buch/
├── 01-einleitung.md
├── 02-kapitel.md
├── 03-kapitel.md
├── 04-anhang.md
└── bilder/
```

**Zusammenfügen** macht daraus ein Dokument — nach Dateinamen
sortiert, mit `10` hinter `9`, wahlweise mit einem Seitenumbruch
zwischen den Teilen. Bilder aus derselben Auswahl stehen danach in
Vorschau, Druck und HTML-Export.

Das geht **in eine Richtung**: Was hereinkommt, geht als eine Datei
wieder heraus. Warum es keinen Ordnerbaum gibt, steht in
`doku/ENTSCHEIDUNGEN.md`, Punkt 2 und 22.

## Der Kern in zwei Sätzen

> **Markdown ist die Wahrheit.** Der Text eines Blocks ist immer
> Rohtext; die Fläche zeigt ihn gerendert, gespeichert wird nie etwas
> anderes.
>
> **Eine Quelle, drei Ausgaben.** Vorschau, Druck und Export kommen
> aus derselben Funktion. Eine Vorschau, die anders gebaut ist als das
> Papier, ist keine Vorschau.

Was Notion kann und Markdown nicht — Spalten, Kommentare am Text,
synchronisierte Blöcke, Datenbanken —, steht in
`doku/BLOCKKATALOG.md` mit Urteil, und in `doku/ENTSCHEIDUNGEN.md`
steht, wie damit umgegangen wird. Auch, warum es **keine Diagramme**
gibt (Punkt 23) und warum der Kommentar am Text eine **Fußnote**
geworden ist (Punkt 8 und 18).

## Herkunft

Dieser Entwurf stammt aus einer Vorarbeit mit Claude. **Die
Notion-Oberfläche darin ist aus dem Gedächtnis nachgebaut, nicht aus
dem Produkt.** Was das heißt und was zu prüfen wäre, steht in
`doku/HERKUNFT.md`. Bitte vor dem ersten größeren Schritt lesen.

Was noch offen ist, steht in `STAND.md` — darunter, dass es für die
Flächen aus Schritt 10 noch **keinen Entwurf** gibt.
