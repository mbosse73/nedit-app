# Stand

Kurz gehalten. Hier steht, wo das Projekt jetzt ist, was offen ist und
was als Nächstes ansteht. Warum etwas so entschieden wurde, steht in
`doku/ENTSCHEIDUNGEN.md`; was noch kommt, in `doku/ROADMAP.md`.

---

## Wo wir stehen

**Die Schritte 1 bis 9 sind gebaut.** Nach der Durchsprache vom
August 2026 ist jeder Punkt der Roadmap einzeln bestätigt,
zurückgestellt oder gestrichen worden — und das Bestätigte steht.

**Der Editor kann:**

* Blöcke aus Markdown lesen und verlustfrei zurückschreiben
* **Auswahlleiste** — markieren, und Fett, Kursiv, Durchgestrichen,
  Code, Link und Textmarker setzen Zeichen in den Rohtext
* **Slash-Menü** — `/` öffnet die Liste, mit Kürzel und einer
  Vorschau, *was in die Datei kommt*, samt Urteil
* **Blockmenü** am Griff — Löschen, Duplizieren, Umwandeln in
* **Einrücken** mit `Tab` und `Umschalt+Tab`
* **Tabelle, Callout und Toggle**, jeder mit sichtbarem Urteil
* **Dialektschalter** `Rein · GitHub · Obsidian · Pandoc` — dieselbe
  Fläche, andere Ausgabe
* **Gliederung** rechts, **Suche** im Dokument (`Strg+F`),
  **Inhaltsverzeichnis** auf Knopfdruck
* **Bild** als Verweis; ein Verweis ins Netz wird benannt, nicht
  geladen
* **Rückgängig über Blockgrenzen** (`Strg+Z` / `Strg+Y`)
* **Zweites Thema**, **Blocksatz** und **drei Druck-Layouts**;
  der Knopf **PDF** öffnet den Druckdialog

**18 von 27 Blöcken aus `doku/BLOCKKATALOG.md` stehen.** Sieben sind
gestrichen, einer ist vertagt, zwei sind offen.

Der Prüflauf hat elf Prüfungen. Die wichtigste — Markdown hin und
zurück — läuft an **21 Proben**, darunter verschachtelte Listen,
Tabellen, Callouts, Toggles und zwei Gegenproben. Die Kontrastprüfung
rechnet **beide Themen** nach.

Geprüft im echten Browser (Chromium, Playwright): drei Ansichten,
Auswahlleiste, Slash-Menü, Blockmenü, Einrücken, Suche, Verlauf, beide
Themen und alle drei Druckbilder — ohne Skriptfehler.

---

## Offen

### 1. Die Entwürfe sind aus dem Gedächtnis

Die Notion-Oberfläche in `mockups/` ist nachgebaut, nicht abgemalt.
Was verlässlich ist und was nicht, steht in `doku/HERKUNFT.md`. Das
ist der letzte ungeprüfte Bezugspunkt des Projekts.

### 2. Zwei Blöcke sind noch offen

**Lesezeichen** (ein Link mit Vorschau) und **Erwähnung** stehen im
Katalog ohne Umsetzung. Die Erwähnung ist gestrichen; das Lesezeichen
ist als gewöhnlicher Link ohnehin schon möglich — offen ist nur die
Darstellung als Karte.

### 3. Vertagt: Frontmatter als Eigenschaften

Nicht abgelehnt, sondern verschoben — `doku/ENTSCHEIDUNGEN.md`,
Punkt 12. Ein vorhandener YAML-Kopf bleibt bis dahin unangetastet als
Rohtext stehen.

### 4. Der Druck ist nur emuliert geprüft

Die drei Druck-Layouts sind mit Chromiums emulierter Druckausgabe
angesehen worden, nicht auf Papier und nicht im Edge-Druckdialog.
**Vor dem ersten ernsten Ausdruck einmal am Zielrechner ansehen** —
besonders die Seitenumbrüche und den Rand im Manuskript-Layout.

---

## Erledigt und deshalb nicht mehr offen

* **Der Download geht.** Am Zielrechner geprüft. Damit ist der
  schwerste offene Punkt des Projekts weg.
* **Der Ordnerbaum ist entschieden** — es gibt keinen. Eine Datei, ein
  Fenster. `doku/ENTSCHEIDUNGEN.md`, Punkt 2.
