# Roadmap

Ein Schritt, ein Branch, ein Pull Request. Der Ablauf steht in
`doku/ARBEITSWEISE.md`, die Regeln in `CLAUDE.md`.

Jeder Schritt nennt drei Dinge: **was** gebaut wird, **woran man es
sieht** (welcher Entwurf unter `mockups/`) und was **ausdrücklich
nicht** dazugehört. Der letzte Punkt ist der wichtigste — ohne ihn
wächst jeder Schritt, bis er nicht mehr zu prüfen ist.

---

## Schritt 1 — Das Gerüst · **erledigt**

Blöcke aus Markdown lesen und verlustfrei wieder schreiben. Zehn
Blockarten. Eingabehilfen. Der Block unter der Schreibmarke zeigt
seinen Rohtext. Enter teilt, Backspace verschmilzt. Ziehen am Griff.
Drei Ansichten. Öffnen, Sichern, localStorage.

**Entwurf:** `mockups/schreiben.html`, `mockups/quelltext.html`

**Nicht dazu:** alles Übrige.

---

## Schritt 2 — Die Auswahlleiste

Text markieren, und über der Auswahl steht eine Leiste: `Text ▾`,
Link, Kommentar, **B** *I* ~~S~~, `Code`, Farbe. Sie kommt zum Text,
statt am Fensterrand zu warten.

Die Knöpfe setzen **Zeichen in den Rohtext**, nichts anderes:
`**` um die Auswahl, `*`, `~~`, Rückstriche. `U` steht blass darin —
Markdown kennt kein Unterstreichen, und ein fehlender Knopf wird
gesucht, ein abgeschalteter nicht.

**Entwurf:** `mockups/auswahl.html`

**Nicht dazu:** das Umwandeln-Menü (Schritt 4), Farbe (Schritt 6 —
sie braucht erst den Dialektschalter).

---

## Schritt 3 — Das Slash-Menü

`/` am Blockanfang öffnet die Liste, Weitertippen filtert. Rechts in
jeder Zeile das Markdown-Kürzel — das Menü ist damit nebenbei ein
Lehrmittel.

**Und der Griff, den Notion nicht hat:** Die Vorschau rechts zeigt
nicht nur, wie der Block aussieht, sondern **was in die Datei kommt**,
samt Urteil aus `doku/BLOCKKATALOG.md`. Das ist der Unterschied
zwischen einem Werkzeug, dem man traut, und einem, das hinter dem
Rücken HTML schreibt.

**Entwurf:** `mockups/slash.html`

**Nicht dazu:** Blöcke, die es noch nicht gibt. Das Menü zeigt nur,
was gebaut ist — sonst verspricht es etwas, das beim Klick nicht
kommt.

---

## Schritt 4 — Blockmenü, Umwandeln, Einrücken

Der Griff `⠿` öffnet ein Menü: Löschen, Duplizieren, Umwandeln in,
Link kopieren, Verschieben nach. „Umwandeln in" ändert die Art, ohne
die Zeile anzufassen — der Griff, den ein reines Textfeld
grundsätzlich nicht hat.

Dazu `Tab` und `Umschalt+Tab` zum Ein- und Ausrücken von Listen. Das
verlangt eine `stufe` am Block und eine Erweiterung beider Richtungen
des Umwandlers.

**Entwurf:** `mockups/auswahl.html`, Musterbogen unten

**Nicht dazu:** verschachtelte Blöcke unter einem Toggle.

---

## Schritt 5 — Callout, Toggle, Tabelle

Die drei Blöcke, an denen sich entscheidet, wie ernst dieses Projekt
seine neunte Regel nimmt. Callout ist ein Dialekt (`> [!TIP]`), Toggle
ist HTML (`<details>`), die Tabelle ist GFM.

Alle drei kommen **zusammen mit dem Dialektschalter** oder gar nicht.

**Entwurf:** `mockups/bloecke.html`, `mockups/grenzen.html`

**Nicht dazu:** Spalten. Die gehen nicht, und das bleibt so.

---

## Schritt 6 — Der Dialektschalter

`Rein · GitHub · Obsidian · Pandoc` in den Einstellungen. Dieselbe
Fläche, andere Ausgabe. Das Slash-Menü blendet aus, was die gewählte
Stufe nicht kann, statt es anzubieten und hinterher zu enttäuschen.

Damit werden auch Farbe, Marker und Erwähnung möglich — jede an ihrer
Stufe.

**Entwurf:** `mockups/grenzen.html`

**Nicht dazu:** eine zweite Datei neben der `.md`. Siehe
`doku/ENTSCHEIDUNGEN.md`, Punkt 1.

---

## Schritt 7 — Frontmatter als Eigenschaften

Der YAML-Kopf sieht aus wie Notions Eigenschaftenzeilen: links das
Etikett, rechts der Wert. Ein Klick auf die Fußzeile zeigt wieder den
Rohtext.

**Entwurf:** `mockups/schreiben.html`, oberer Teil

**Nicht dazu:** ein YAML-Parser für alles. Flache Schlüssel mit Text,
Zahl, Datum und Liste reichen; was er nicht versteht, bleibt Rohtext
und wird unverändert zurückgeschrieben.

---

## Schritt 8 — Gliederung und Dateien

Rechts die Gliederung aus den Überschriften, die springt. Links der
Ordner statt Notions Seitenbaum.

**Hier liegt die offene Frage aus `doku/ENTSCHEIDUNGEN.md`, Punkt 2:**
Ein Ordnerbaum lässt sich über `<input webkitdirectory>` lesen, aber
nicht zurückschreiben. Was das für den Editor heißt, wird **vor**
diesem Schritt entschieden, nicht darin.

**Entwurf:** `mockups/schreiben.html`

---

## Später, ohne Reihenfolge

Bild einfügen (als Verweis, nicht eingebettet — sonst ist die Datei
kein Text mehr). Suchen im Dokument. Zweites Thema (dunkel). Druckbild.
Mehrere Dateien nebeneinander. Rückgängig über Blockgrenzen hinweg.
