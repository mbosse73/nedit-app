# Markdown-Editor im Notion-Stil

Ein Markdown-Editor, der sich wie Notion bedienen lässt — Blöcke statt
Zeilen, Slash-Menü, Blockgriff, „Umwandeln in" — und trotzdem nichts
anderes schreibt als eine `.md`-Datei.

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
es einmal aussehen soll.

## Was schon geht

Blöcke aus Markdown lesen und verlustfrei wieder schreiben.
Eingabehilfen (`# `, `- `, `1. `, `- [ ] `, `> `, ` ``` `, `---`).
Der Block unter der Schreibmarke zeigt seinen **Rohtext**, alle anderen
das Ergebnis. Enter teilt, Backspace verschmilzt.

**Die drei Griffe:** `/` öffnet das Slash-Menü — mit dem Kürzel in
jeder Zeile und einer Vorschau, *was in die Datei kommt*. Text
markieren holt die Auswahlleiste zum Text. Der Griff links am Absatz
zieht ihn an eine andere Stelle oder öffnet Löschen, Duplizieren und
**Umwandeln in**.

Dazu: `Tab` rückt Listen ein. Tabelle, Callout und Toggle, jeder mit
sichtbarem Urteil. Der Dialektschalter `Rein · GitHub · Obsidian ·
Pandoc` — dieselbe Fläche, andere Ausgabe. Gliederung rechts, Suche im
Dokument, Inhaltsverzeichnis auf Knopfdruck. Rückgängig über
Blockgrenzen. Zweites Thema, Blocksatz und vier Druck-Layouts —
Schlicht, Technische Doku, Magazin, Manuskript; der Knopf **PDF**
öffnet den Druckdialog.

Drei Ansichten: Schreiben, Geteilt, Quelltext — der Quelltext
**farbig**, damit man die Auszeichnung sieht, ohne sie zu suchen.
Öffnen über die Dateiauswahl, Sichern über den Download, Arbeitsstand
in localStorage.

Was noch offen ist, steht in `STAND.md`.

## Der Kern in einem Satz

> Markdown ist die Wahrheit. Der Text eines Blocks ist immer Rohtext;
> die Fläche zeigt ihn gerendert, gespeichert wird nie etwas anderes.

Was Notion kann und Markdown nicht — Spalten, Kommentare am Text,
synchronisierte Blöcke, Datenbanken —, steht in
`doku/BLOCKKATALOG.md` mit Urteil, und in `doku/ENTSCHEIDUNGEN.md`
steht, wie damit umgegangen wird.

## Herkunft

Dieser Entwurf stammt aus einer Vorarbeit mit Claude. **Die
Notion-Oberfläche darin ist aus dem Gedächtnis nachgebaut, nicht aus
dem Produkt.** Was das heißt und was zu prüfen wäre, steht in
`doku/HERKUNFT.md`. Bitte vor dem ersten größeren Schritt lesen.
