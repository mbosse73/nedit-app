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
* **Zweites Thema**, **Blocksatz** und **vier Druck-Layouts** —
  Schlicht, Technische Doku, Magazin, Manuskript; der Knopf **PDF**
  öffnet den Druckdialog
* **Farbe im Quelltext** — Auszeichnungszeichen, Überschriften, Code,
  Verweise, Tabellen; in zwei Schichten, damit das Textfeld bleibt,
  was es ist (`doku/ENTSCHEIDUNGEN.md`, Punkt 13)

**18 von 27 Blöcken aus `doku/BLOCKKATALOG.md` stehen.** Sieben sind
gestrichen, einer ist vertagt, zwei sind offen.

Der Prüflauf hat elf Prüfungen. Die wichtigste — Markdown hin und
zurück — läuft an **21 Proben**, darunter verschachtelte Listen,
Tabellen, Callouts, Toggles und zwei Gegenproben. Die Kontrastprüfung
rechnet **20 Paare** nach, beide Themen, jeweils gegen den Grund, auf
dem der Ton wirklich steht.

`werkzeug/probe.mjs` **bedient** die Anwendung im echten Browser —
markieren, Menüs, Einrücken, Verlauf, Stufen, Suche, Themen, Druck,
Farbe im Quelltext — und prüft danach, was in der Datei steht.
**56 Proben**, alle grün.

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

### 4. Der Quelltext deutet, er warnt aber nicht

Die Farbe zeigt, **was** eine Stelle ist. Der Entwurf
(`mockups/quelltext.html`) zeigt daneben noch etwas anderes: Zeilen,
die die reine Sprache verlassen, sind dort eigens hervorgehoben. Das
ist nicht gebaut. Das Urteil steht bis dahin nur im Slash-Menü und am
Block, nicht im Quelltext.

### 5. Fortsetzungszeilen einer Liste werden nicht angehängt

`leseMarkdown` liest Zeile für Zeile. Eine eingerückte Folgezeile ohne
Listenzeichen wird deshalb ein eigener Absatz — und weil sie die Liste
unterbricht, fängt die Nummerierung danach wieder bei `1.` an. Im
mitgelieferten Starttext ist das zu sehen: Die drei Griffe sind mit
`1. 1. 2.` nummeriert, nicht mit `1. 2. 3.`.

Verlustfrei ist es trotzdem — die Zeile steht unverändert in der
Datei. Aber es sieht falsch aus, und der Ausweg ist eine Entscheidung,
keine Kosmetik: entweder der Starttext kommt ohne Fortsetzungszeilen
aus, oder `leseMarkdown` hängt sie an den vorigen Block an — was den
Grundsatz „eine Zeile, ein Block" aufweicht.

### 6. Der Druck ist nur emuliert geprüft

Die vier Druck-Layouts sind mit Chromiums emulierter Druckausgabe
angesehen worden, nicht auf Papier und nicht im Edge-Druckdialog.
**Vor dem ersten ernsten Ausdruck einmal am Zielrechner ansehen** —
besonders die Seitenumbrüche, den Rand im Manuskript-Layout und die
Silbentrennung im Blocksatz: Sie hängt an den Trenntabellen des
Browsers, und im Prüflauf war keine geladen.

---

## Erledigt und deshalb nicht mehr offen

* **Der Download geht.** Am Zielrechner geprüft. Damit ist der
  schwerste offene Punkt des Projekts weg.
* **Der Ordnerbaum ist entschieden** — es gibt keinen. Eine Datei, ein
  Fenster. `doku/ENTSCHEIDUNGEN.md`, Punkt 2.
