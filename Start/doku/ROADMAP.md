# Roadmap

Ein Schritt, ein Branch, ein Pull Request. Der Ablauf steht in
`doku/ARBEITSWEISE.md`, die Regeln in `CLAUDE.md`.

Jeder Schritt nennt drei Dinge: **was** gebaut wird, **woran man es
sieht** (welcher Entwurf unter `mockups/`) und was **ausdrücklich
nicht** dazugehört. Der letzte Punkt ist der wichtigste — ohne ihn
wächst jeder Schritt, bis er nicht mehr zu prüfen ist.

**Diese Fassung beruht auf der Durchsprache vom August 2026.** Jeder
Punkt darin ist einzeln bestätigt, zurückgestellt oder gestrichen
worden; die Begründungen stehen in `doku/ENTSCHEIDUNGEN.md`,
Punkt 8 bis 12.

---

## Schritt 1 — Das Gerüst · **erledigt**

Blöcke aus Markdown lesen und verlustfrei wieder schreiben. Zehn
Blockarten. Eingabehilfen. Der Block unter der Schreibmarke zeigt
seinen Rohtext. Enter teilt, Backspace verschmilzt. Ziehen am Griff.
Drei Ansichten. Öffnen, Sichern, localStorage.

**Entwurf:** `mockups/schreiben.html`, `mockups/quelltext.html`

---

## Schritt 2 — Der Dialektschalter · **erledigt**

**Vorgezogen.** In der Roadmap stand er als Schritt 6; die Durchsprache
hat Callout, Toggle und Tabelle bestätigt, und harte Regel 9 verlangt
den Schalter, bevor einer davon gebaut werden darf.

`Rein · GitHub · Obsidian · Pandoc` in den Einstellungen. Dieselbe
Fläche, andere Ausgabe. Was die gewählte Stufe nicht kann, wird gar
nicht erst angeboten.

**Entwurf:** `mockups/grenzen.html`

**Nicht dazu:** eine zweite Datei neben der `.md`.

---

## Schritt 3 — Die Auswahlleiste · **erledigt**

Text markieren, und über der Auswahl steht eine Leiste: **B** *I*
~~S~~, `Code`, Link, Textmarker. Sie kommt zum Text, statt am
Fensterrand zu warten.

Die Knöpfe setzen **Zeichen in den Rohtext**, nichts anderes:
`**` um die Auswahl, `*`, `~~`, Rückstriche, `[…](…)`, `==`.
Der Textmarker hängt an der Stufe aus Schritt 2.

**Entwurf:** `mockups/auswahl.html`

**Nicht dazu:** der Kommentar-Knopf — gestrichen, siehe
`doku/ENTSCHEIDUNGEN.md` Punkt 8. Farbe und Unterstreichen —
gestrichen, siehe Punkt 11.

---

## Schritt 4 — Blockmenü, Umwandeln, Einrücken · **erledigt**

Der Griff `⠿` öffnet ein Menü: Löschen, Duplizieren, Umwandeln in.
„Umwandeln in" ändert die Art, ohne die Zeile anzufassen — der Griff,
den ein reines Textfeld grundsätzlich nicht hat.

Dazu `Tab` und `Umschalt+Tab` zum Ein- und Ausrücken von Listen. Das
verlangt eine `stufe` am Block und eine Erweiterung **beider**
Richtungen des Umwandlers.

**Entwurf:** `mockups/auswahl.html`

**Nicht dazu:** „Link kopieren" und „Verschieben nach" — gestrichen,
siehe `doku/ENTSCHEIDUNGEN.md` Punkt 11. Das `+` am Griff steht schon
seit Schritt 1.

---

## Schritt 5 — Callout, Toggle, Tabelle · **erledigt**

Die drei Blöcke, an denen sich entscheidet, wie ernst dieses Projekt
seine neunte Regel nimmt. Callout ist ein Dialekt (`> [!TIP]`), Toggle
ist HTML (`<details>`), die Tabelle ist GFM.

Alle drei sind bestätigt — und alle drei hängen am Schalter aus
Schritt 2.

**Entwurf:** `mockups/bloecke.html`, `mockups/grenzen.html`

**Nicht dazu:** Spalten. Die gehen nicht, und das bleibt so.

---

## Schritt 6 — Das Slash-Menü · **erledigt**

`/` am Blockanfang öffnet die Liste, Weitertippen filtert. Rechts in
jeder Zeile das Markdown-Kürzel — das Menü ist damit nebenbei ein
Lehrmittel.

**Und der Griff, den Notion nicht hat:** Die Vorschau rechts zeigt
nicht nur, wie der Block aussieht, sondern **was in die Datei kommt**,
samt Urteil aus `doku/BLOCKKATALOG.md`. Das ist der Unterschied
zwischen einem Werkzeug, dem man traut, und einem, das hinter dem
Rücken HTML schreibt.

**Steht bewusst hinter Schritt 5:** Das Menü zeigt nur, was gebaut
ist — sonst verspricht es etwas, das beim Klick nicht kommt.

**Entwurf:** `mockups/slash.html`

---

## Schritt 7 — Sich zurechtfinden · **erledigt**

Rechts die Gliederung aus den Überschriften, die springt. Dazu die
Suche im Dokument (`Strg+F` im Editor, nicht im Browser — die
Browsersuche findet den Rohtext eines Blocks nicht) und ein
Inhaltsverzeichnis, das sich aus den Überschriften erzeugen lässt.

**Entwurf:** `mockups/schreiben.html`, rechte Spalte

**Nicht dazu:** der Dateibaum links. Gestrichen, siehe
`doku/ENTSCHEIDUNGEN.md` Punkt 2.

---

## Schritt 8 — Bild und Rückgängig · **erledigt**

Bild einfügen als **Verweis** (`![Titel](bild.png)`), nicht
eingebettet — sonst ist die Datei kein lesbarer Text mehr.

Rückgängig über Blockgrenzen hinweg. Der einzige Punkt der ganzen
Liste, bei dem ohne ihn Arbeit verloren gehen kann: Ein gelöschter
oder verschobener Block kommt mit `Strg+Z` derzeit nicht zurück.

---

## Schritt 9 — Aussehen und Druck · **erledigt**

Zweites Thema (dunkel). Blocksatz als **Anzeige-Einstellung**, nicht
als Merkmal des Textes.

Vier Druck-Layouts, umschaltbar: **Schlicht** (Vorgabe),
**Technische Doku**, **Magazin**, **Manuskript**. Der Knopf **PDF**
öffnet den Druckdialog — dort wählt der Nutzer „Als PDF speichern".

Das Technik-Layout nummeriert nur die Überschriften, die noch keine
Nummer tragen.

Begründung für beides in `doku/ENTSCHEIDUNGEN.md`, Punkt 9 und 10.

---

## Schritt 10 — Vorschau, Themen und Ausgabe · **erledigt**

Der Editor bekommt seine zweite Hälfte: Er **zeigt** das Dokument,
statt es nur zu beschreiben, und **gibt es heraus**.

**Live-Vorschau.** Eine vierte Ansicht neben Schreiben, Geteilt und
Quelltext. Sie baut aus den Blöcken richtiges HTML — `<h1>`, `<p>`,
verschachtelte `<ul>`, `<table>` — und folgt der zuletzt geänderten
Stelle. Dazu Vollbild und ein ablenkungsfreier Modus.

**Farbe im Code.** Ein eigener Abtaster, über fünfzig Sprachen, sechs
Farben. Keine Bibliothek (harte Regel 2).

**Lange Dokumente.** Abschnitte an der Überschrift einklappen, eine
**Fußnotenleiste** neben der Gliederung, das Inhaltsverzeichnis
wahlweise in der Vorschau.

**Themen und Stil.** Acht Themen für das **Dokument** — sie gelten in
Vorschau, Druck und Export. Dazu Spaltenbreite, Schriftgröße,
Zeilenabstand und ein Feld für **eigenes CSS**, das auch in die
exportierte Datei geht.

**Seite einrichten.** Format, Hoch- und Querformat, vier Ränder,
mitlaufende Kopf- und Fußzeile mit Bild, Seitenumbruch vor jeder
Überschrift — und eine **Druckvorschau**, die die Seite maßhaltig
zeigt.

**Fünf Ausgaben.** `.md`, `.html` (eigenständig, mit Stil und
Bildern), `.docx` (ein ZIP von Hand), `.rtf`, PDF über den
Druckdialog. Dazu die Zwischenablage als HTML, RTF oder Markdown.

**Mehrere Dateien.** Nach Namen sortiert zu einem Dokument
zusammenfügen, Bilder inbegriffen.

**Schnellwahl.** `Strg+K`: Überschrift, Fußnote oder Befehl.

**Zwei neue Blöcke:** Fußnote (`[^1]:`, GFM) und Seitenumbruch
(`<!-- seitenumbruch -->`, HTML).

**Entwurf:** keiner. Diese Flächen sind aus der Anforderung gebaut,
nicht aus einem Entwurf — der erste Schritt des Projekts, für den das
gilt. Siehe `STAND.md`, offener Punkt 1.

**Nicht dazu:** Diagramme (Mermaid, PlantUML) — gestrichen, siehe
`doku/ENTSCHEIDUNGEN.md` Punkt 23. Bilder in DOCX und RTF —
gestrichen, Punkt 21. Der Ordnerbaum — bleibt gestrichen, Punkt 2
und 22.

---

## Schritt 11 — Die Oberfläche zusammenfassen · **erledigt**

Schritt 10 hat viel gebracht und die Oberfläche dabei zugestellt:
**vierzehn Knöpfe** in der Kopfleiste und drei Orte für dieselbe
Frage. Dieser Schritt räumt auf — und holt die Fläche zurück zu
Notion.

**Eine Frage, ein Ort.** „Stil“ und „Seite einrichten“ werden ein
Dialog **Layout** mit vier Reitern: *Thema · Satz und Maße · Seite ·
Eigenes CSS*. Die Textausrichtung wandert aus den Einstellungen
dorthin. Die Einstellungen behalten nur noch das **Programm**.

**Die Kopfleiste trägt sieben Knöpfe** — Name, vier Ansichten,
Ausgeben, Gliederung und `···`. Alles Seltene steht im Punkte-Menü,
in Gruppen: *Thema des Dokuments · Datei · Ansehen · Finden*.

**Jedes Thema bekommt eine Vorschau.** Die Kachel wendet das Thema
**auf sich selbst** an — sie trägt `.dok` und `data-vthema` und kann
deshalb nicht veralten. Groß im Dialog, klein als rollende Reihe im
Menü, wie Notion seine drei Schriften zeigt.

**Zwei Dinge hießen „Thema“.** Das der Anwendung heißt jetzt
**Erscheinungsbild**.

Dazu mehr Weißraum über dem Text, eine leisere Seitenleiste und eine
Fußleiste, die sich zurücknimmt.

**Entwurf:** keiner — siehe `STAND.md`, offener Punkt 1.

**Nicht dazu:** ein Seitenbaum links. Er bleibt gestrichen
(`doku/ENTSCHEIDUNGEN.md`, Punkt 2). Notions Kopfzeile ohne Notions
Seitenleiste ist hier die richtige Hälfte.

---

## Zurückgestellt

**Frontmatter als Eigenschaften.** Der YAML-Kopf als Notions
Eigenschaftenzeilen. Nicht abgelehnt, vertagt — er nützt vor allem
beim Verwalten vieler Dateien, und einen Ordnerbaum wird es nicht
geben. Siehe `doku/ENTSCHEIDUNGEN.md`, Punkt 12.

Bis dahin bleibt ein vorhandener YAML-Kopf unangetastet als Rohtext
stehen.

## Gestrichen

Ordnerbaum · Kommentare am Text · farbiger Text · unterstrichen ·
Erwähnung `[[Name]]` · „Link kopieren" · „Verschieben nach" · Spalten ·
synchronisierte Blöcke · Datenbanken · zweite Datei · lokaler Server ·
Rich-Text-Modell · KI-Funktionen · Diagramme im Codeblock · Bilder in
DOCX und RTF · Rückschreiben in mehrere Dateien.

Jeder Punkt mit Begründung in `doku/ENTSCHEIDUNGEN.md`. Sie stehen
hier, damit die Frage nicht alle drei Monate neu gestellt wird.
