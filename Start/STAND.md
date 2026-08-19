# Stand

Kurz gehalten. Hier steht, wo das Projekt jetzt ist, was offen ist und
was als Nächstes ansteht. Warum etwas so entschieden wurde, steht in
`doku/ENTSCHEIDUNGEN.md`; was noch kommt, in `doku/ROADMAP.md`.

---

## Wo wir stehen

**Schritt 1 ist fertig: das Gerüst läuft.** `editor.html` liest
Markdown in Blöcke, schreibt sie verlustfrei zurück und lässt sich
bedienen — Eingabehilfen, Enter, Backspace, Ziehen am Griff, drei
Ansichten, Öffnen, Sichern, localStorage.

Zehn Blockarten sind gebaut: Absatz, Überschrift 1–3, Aufzählung,
nummerierte Liste, To-do, Zitat, Codeblock, Trennlinie. Dazu die
Auszeichnung im Text — fett, kursiv, Code, durchgestrichen, markiert,
Link —, die aber nur **angezeigt** wird; Knöpfe dafür kommen in
Schritt 2.

**13 von 27 Blöcken aus `doku/BLOCKKATALOG.md` stehen.**

Der Prüflauf hat elf Prüfungen, darunter die wichtigste: Markdown hin
und zurück an neun Proben. Er läuft nach jedem Schreiben als Haken
automatisch mit.

Geprüft im echten Browser (Chromium, Playwright): drei Ansichten ohne
Querlauf, ohne dunkle Fläche, ohne Skriptfehler; Tippen, Eingabehilfen,
Backspace und die Live-Vorschau greifen.

---

## Offen — hier weitermachen

### 1. Nimmt Edge den Download an?

Der Knopf **Sichern** erzeugt eine Datei über `URL.createObjectURL`
und einen Klick auf ein `<a download>`. Ob Edge das aus einer
`file://`-Seite annimmt, ist **nicht geprüft** — im Schwesterprojekt
steht derselbe Punkt noch offen.

**Das ist keine Nebensache.** Geht es nicht, hat der Editor keinen Weg,
etwas herauszugeben, und Punkt 2 aus `doku/ENTSCHEIDUNGEN.md` muss neu
entschieden werden. Bitte am Zielrechner ausprobieren, bevor Schritt 2
beginnt.

### 2. Die Entwürfe sind aus dem Gedächtnis

Die Notion-Oberfläche in `mockups/` ist nachgebaut, nicht abgemalt.
Was verlässlich ist und was nicht, steht in `doku/HERKUNFT.md`. Vor
Schritt 3 (Slash-Menü) wäre ein Blick in das echte Notion viel wert.

### 3. Der Ordnerbaum ist noch nicht entschieden

`mockups/schreiben.html` zeigt links einen Ordner. Ob und wie es den
geben kann, steht als offene Frage in `doku/ENTSCHEIDUNGEN.md`,
Punkt 2. Vor Schritt 8 zu klären.

---

## Als Nächstes

**Schritt 2 — Die Auswahlleiste.** Text markieren, Leiste darüber, die
Knöpfe setzen Zeichen in den Rohtext. Der kleinste Schritt mit dem
größten spürbaren Gewinn, und er berührt das Datenmodell nicht.

Vorher: Punkt 1 oben klären.
