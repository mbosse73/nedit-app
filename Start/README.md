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
werkzeug/            Prüflauf, Browserprobe, Generator für die Entwürfe
```

## Anfangen

```bash
node werkzeug/lage.mjs        # wo steht das Projekt
node werkzeug/pruefen.mjs     # Regelprüfung
node werkzeug/schau.mjs       # im echten Browser ansehen
```

`editor.html` per Doppelklick öffnen. `mockups/index.html` zeigt, wie
es einmal aussehen soll.

## Was schon geht

Blöcke aus Markdown lesen und verlustfrei wieder schreiben.
Eingabehilfen (`# `, `- `, `1. `, `- [ ] `, `> `, ` ``` `, `---`).
Der Block unter der Schreibmarke zeigt seinen **Rohtext**, alle anderen
das Ergebnis. Enter teilt, Backspace verschmilzt. Blöcke am Griff
ziehen. Drei Ansichten: Schreiben, Geteilt, Quelltext. Öffnen über die
Dateiauswahl, Sichern über den Download, Arbeitsstand in localStorage.

Was fehlt, steht in `STAND.md` und `doku/ROADMAP.md`.

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
