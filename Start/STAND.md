# Stand

Kurz gehalten. Hier steht, wo das Projekt jetzt ist, was offen ist und
was als Nächstes ansteht. Warum etwas so entschieden wurde, steht in
`doku/ENTSCHEIDUNGEN.md`; was noch kommt, in `doku/ROADMAP.md`.

---

## Wo wir stehen

**Die Schritte 1 bis 11 sind gebaut.** Schritt 10 hat dem Editor seine
zweite Hälfte gegeben — er **zeigt** das Dokument und **gibt es
heraus** —, und Schritt 11 hat die Oberfläche danach wieder
aufgeräumt.

**Schreiben — das war Schritt 1 bis 9:**

* Blöcke aus Markdown lesen und verlustfrei zurückschreiben
* **Auswahlleiste** — markieren, und Fett, Kursiv, Durchgestrichen,
  Code, Link und Textmarker setzen Zeichen in den Rohtext
* **Slash-Menü** — `/` öffnet die Liste, mit Kürzel und einer
  Vorschau, *was in die Datei kommt*, samt Urteil
* **Blockmenü** am Griff — Darüber einfügen, Löschen, Duplizieren,
  Umwandeln in
* **Einrücken** mit `Tab` und `Umschalt+Tab`
* **Tabelle, Callout und Toggle**, jeder mit sichtbarem Urteil
* **Dialektschalter** `Rein · GitHub · Obsidian · Pandoc`
* **Gliederung** rechts, **Suche** im Dokument (`Strg+F`),
  **Inhaltsverzeichnis** auf Knopfdruck
* **Bild** als Verweis; ein Verweis ins Netz wird benannt, nicht geladen
* **Rückgängig über Blockgrenzen** (`Strg+Z` / `Strg+Y`)
* **Farbe und Warnung im Quelltext** — jede Zeile jenseits des reinen
  Markdown ist hinterlegt, mit `GFM`, `Dialekt` oder `HTML` am Rand
* **Fortsetzungszeilen** einer Liste gehören zu ihrem Punkt

**Ansehen und ausgeben — Schritt 10:**

* **Vorschau** als vierte Ansicht: richtiges HTML statt Blockzeilen,
  in Echtzeit, mit **automatischem Scrollen zur letzten Änderung**.
  Dieselbe Zeichenkette geht in Druck und Export —
  `doku/ENTSCHEIDUNGEN.md`, Punkt 17
* **Vollbild** (`Strg+Umschalt+V`) und **ablenkungsfrei**
  (`Strg+Umschalt+R`)
* **Farbe im Code** — ein eigener Abtaster, über fünfzig Sprachen,
  sechs Farben, ohne Bibliothek
* **Abschnitte einklappen** an jeder Überschrift; die Zahl der
  verborgenen Blöcke steht am Titel
* **Fußnotenleiste** neben der Gliederung — sie meldet auch die
  Fußnoten **ohne Verweis im Text**
* **Acht Themen für das Dokument** — sie gelten in Vorschau, Druck und
  Export; das Druck-Layout ist darin aufgegangen (Punkt 20)
* **Stil-Verwalter** — Spaltenbreite, Schriftgröße, Zeilenabstand und
  **eigenes CSS**, das auch in die exportierte Datei geht
* **Seite einrichten** — Format, Hoch- und Querformat, vier Ränder,
  **mitlaufende Kopf- und Fußzeile mit Bild**, Umbruch vor jeder
  Überschrift
* **Druckvorschau** — die Seite maßhaltig, mit einer feinen Linie je
  Seitenhöhe
* **Fünf Ausgaben** — `.md`, `.html` (eigenständig, mit Stil und
  Bildern), `.docx` (ein ZIP von Hand), `.rtf`, PDF über den
  Druckdialog; dazu die Zwischenablage als HTML, RTF oder Markdown
* **Mehrere Dateien zusammenfügen**, nach Namen sortiert, Bilder
  inbegriffen
* **Schnellwahl** (`Strg+K`) — Überschrift, Fußnote oder Befehl
* **Zwei neue Blöcke:** Fußnote (`[^1]:`) und Seitenumbruch
  (`<!-- seitenumbruch -->`)

**Die Oberfläche — Schritt 11:**

* **Sieben Knöpfe in der Kopfleiste** statt vierzehn: Name, vier
  Ansichten, Ausgeben, Gliederung, `···`. Alles Seltene steht im
  Punkte-Menü, in vier Gruppen (Punkt 25)
* **Ein Layout-Dialog statt zweier Karten** — Thema · Satz und Maße ·
  Seite · Eigenes CSS. „Stil“ und „Seite einrichten“ beantworteten
  dieselbe Frage
* **Die Einstellungen tragen nur noch das Programm.** Die
  Textausrichtung ist ins Layout gewandert, das Thema der Anwendung
  heißt **Erscheinungsbild** — zwei Dinge durften nicht gleich heißen
* **Jedes Thema hat eine Vorschau**, die das Thema **auf sich selbst
  anwendet** und deshalb nicht veralten kann (Punkt 26)
* Mehr Weißraum über dem Text, eine leisere Seitenleiste, eine
  Fußleiste, die sich zurücknimmt

**20 von 29 Blöcken aus `doku/BLOCKKATALOG.md` stehen.** Sieben sind
gestrichen, einer ist vertagt, einer ist offen.

Der Prüflauf hat **14 Prüfungen**. Die wichtigste — Markdown hin und
zurück — läuft an **33 Proben**. Die Kontrastprüfung rechnet **36
Paare** in beiden Themen nach, dazu drei für die Vorschau-Themen. Zwei Prüfungen sind
Bremsen: **jede Blockart muss in jedem Ausgang vorkommen** — eine Art,
von der HTML, RTF oder DOCX nichts wissen, verschwände dort
stillschweigend —, und die **Kopfleiste darf nicht über acht Knöpfe
wachsen**.

`werkzeug/probe.mjs` **bedient** die Anwendung im echten Browser —
**126 Proben**, alle grün. `werkzeug/schau.mjs` klappert vier
Ansichten und die Druckvorschau ab.

---

## Offen

### 1. Für Schritt 10 und 11 gibt es keinen Entwurf

Die sieben Flächen unter `mockups/` zeigen den Editor beim
**Schreiben**. Für Vorschau, Druckvorschau, Layout-Dialog,
Punkte-Menü und Schnellwahl gibt es keinen — sie sind aus der
Anforderung gebaut, nicht aus einem Entwurf. Das gilt seit Schritt 10
und ist mit Schritt 11 nicht kleiner geworden; es steht hier, damit es
nicht untergeht.

**Was daraus folgt:** Wer diese Flächen ändert, hat keinen
Sollzustand, gegen den er prüfen kann. Entweder wird einer
nachgezogen — `werkzeug/bau-mockups.mjs` ergänzen, wie in `CLAUDE.md`
beschrieben — oder es wird ausdrücklich entschieden, dass es für sie
keinen gibt.

### 2. Die mitlaufende Kopfzeile ist nur emuliert geprüft

Sie hängt an `<thead>` und `<tfoot>` einer Tabelle, weil Chromium das
auf jeder Seite wiederholt. Geprüft ist das mit Chromiums eigener
PDF-Ausgabe: acht Kapitel ergeben acht Seiten, der Umbruch vor jeder
Überschrift 1 greift. **Ob die Zeile im Edge-Druckdialog am
Zielrechner auf jeder Seite steht, ist noch nicht angesehen worden** —
zusammen mit dem alten offenen Punkt zum Druck (unten).

### 3. Die Entwürfe sind aus dem Gedächtnis

Die Notion-Oberfläche in `mockups/` ist nachgebaut, nicht abgemalt.
Was verlässlich ist und was nicht, steht in `doku/HERKUNFT.md`.

### 4. Ein Block ist noch offen

**Lesezeichen** (ein Link mit Vorschau) steht im Katalog ohne
Umsetzung. Als gewöhnlicher Link ist er ohnehin schon möglich — offen
ist nur die Darstellung als Karte.

### 5. Vertagt: Frontmatter als Eigenschaften

Nicht abgelehnt, sondern verschoben — `doku/ENTSCHEIDUNGEN.md`,
Punkt 12. Ein vorhandener YAML-Kopf bleibt bis dahin unangetastet als
Rohtext stehen.

### 6. Der Druck ist nur emuliert geprüft

Die Themen sind mit Chromiums emulierter Druckausgabe angesehen
worden, nicht auf Papier und nicht im Edge-Druckdialog. **Vor dem
ersten ernsten Ausdruck einmal am Zielrechner ansehen** — besonders
die Seitenumbrüche, den Rand im Manuskript-Thema und die
Silbentrennung im Blocksatz: Sie hängt an den Trenntabellen des
Browsers, und im Prüflauf war keine geladen.

### 7. Das RTF in der Zwischenablage nimmt nicht jedes Programm an

`Als RTF` in der Zwischenablage setzt `text/rtf`. Ob das Zielprogramm
daraus das Windows-Format `CF_RTF` macht, entscheidet der Browser, und
Chromium sagt darüber nichts zu. Der Weg über die **Datei** (`.rtf`
ausgeben und öffnen) geht in jedem Fall; die Meldung nach dem Kopieren
sagt das auch.

---

## Erledigt und deshalb nicht mehr offen

* **Der Editor kann etwas herausgeben** — in fünf Formaten, nicht nur
  als `.md`. Das war der zweite schwere Punkt nach dem Download.
* **Die Vorschau ist keine Behauptung.** Vorschau, Druck und Export
  kommen aus **einer** Funktion; sie können nicht auseinanderlaufen.
  `doku/ENTSCHEIDUNGEN.md`, Punkt 17.
* **Zwei Systeme fürs Aussehen sind eins geworden.** Punkt 20.
* **Der Kommentar am Text hat eine ehrliche Antwort bekommen:** die
  Fußnote. Punkt 8 und 18.
* **Der Download geht.** Am Zielrechner geprüft.
* **Die Nummerierung im Starttext stimmt.** Punkt 15.
* **Der Ordnerbaum ist entschieden** — es gibt keinen. Punkt 2; das
  Zusammenfügen ist ausdrücklich eine Einbahnstraße, Punkt 22.
* **Es gibt eine Regel, wohin eine Einstellung gehört.** Vorher gab es
  drei Orte für dieselbe Frage. Punkt 25 — und `pruefen.mjs` bremst,
  wenn die Kopfleiste wieder zuwächst.
