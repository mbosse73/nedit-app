# Arbeitsweise

Diese Datei richtet sich an Claude Code. Sie beschreibt, **wie** ein
Schritt abgearbeitet wird. Was gebaut wird, steht in
`doku/ROADMAP.md`, die Regeln in `CLAUDE.md`.

---

## Der Ablauf in sieben Phasen

### 1 — Lesen, bevor du irgendetwas tust

In dieser Reihenfolge:

1. `CLAUDE.md` — die Regeln
2. `doku/ENTSCHEIDUNGEN.md` — was schon entschieden ist
3. `STAND.md` — was gerade offen ist
4. Den betreffenden Abschnitt in `doku/ROADMAP.md`
5. Den Entwurf, den der Schritt nennt, unter `mockups/`

Beim ersten Mal zusätzlich `doku/HERKUNFT.md`. Dort steht, worauf man
sich bei den Entwürfen verlassen kann und worauf nicht.

### 2 — Den Ist-Zustand verstehen

`editor.html` hat neun nummerierte Abschnitte mit Kopfkommentaren.
Lies **den betroffenen Abschnitt**, nicht die ganze Datei:

```bash
grep -n "^   [0-9] —" editor.html      # die Abschnitte finden
```

Berührt der Schritt Markdown, lies Abschnitt 4 ganz — beide
Richtungen stehen dort nebeneinander und gehören zusammen geändert.

### 3 — Planen und zeigen — und warten

Plan **vor** der ersten Änderung. Danach ist Schluss, bis der Mensch
zustimmt. **Das ist ein Halt, keine Höflichkeitsformel.**

Der Plan beantwortet:

* Welche Abschnitte werden angefasst? Namentlich.
* Ändert sich das Blockmodell (`art`, neue Felder)? Dann **beide**
  Richtungen des Umwandlers und der Katalog.
* Kommt ein Block dazu? Dann `KATALOG` in
  `werkzeug/bau-mockups.mjs`, damit Entwurf und
  `doku/BLOCKKATALOG.md` mitwachsen — und `GEBAUT` dort, damit der
  Stand stimmt.
* Braucht der Schritt einen Dialekt oder HTML? Dann gehört er hinter
  den Schalter (harte Regel 9) — oder er wartet auf Schritt 6.
* **Welche Entscheidungen sind nicht umkehrbar?** Einzeln benennen.
* Was wird bewusst **nicht** gemacht?

### 4 — Bauen

Ändere genau den Abschnitt, um den es geht. Schreibe die Datei nicht
neu — das macht den Diff unlesbar und verliert Kommentare, in denen
Begründungen stehen.

Neue Namen folgen den alten: `bewahre`, `melde`, `male`, `ersetze`,
`bloecke`, `art`. Deutsch, auch in Kommentaren.

### 5 — Prüfen

```bash
node werkzeug/pruefen.mjs
```

Muss ohne Fehler durchlaufen. Die Markdown-Prüfung ist die wichtigste:
Bricht sie, ist der Umwandler kaputt, egal wie gut die Fläche aussieht.

Hast du eine neue Regel gefunden, die sich automatisch prüfen lässt,
baue sie ein — nicht nur ins Dokument.

### 6 — Hinsehen

```bash
node werkzeug/schau.mjs
```

Und dann selbst: `editor.html` im Browser öffnen, den geänderten Griff
**benutzen**. Ein bestandener Prüflauf sagt nichts über die
Darstellung und nichts darüber, ob sich etwas bedienen lässt.

Prüfe mindestens:

* Tippt es sich flüssig? Springt die Schreibmarke irgendwo?
* Steht der Rohtext im Block unter der Marke?
* Zeigt der Quelltext rechts dasselbe?
* Neu laden — ist alles noch da?

### 7 — Nachtragen

* `STAND.md` — wo das Projekt jetzt steht, was offen bleibt
* `doku/ENTSCHEIDUNGEN.md` — jede Entscheidung, die nicht offensichtlich
  ist, **mit Begründung**
* `doku/ROADMAP.md` — den Schritt als erledigt kennzeichnen
* `GEBAUT` in `werkzeug/bau-mockups.mjs`, wenn Blöcke dazukamen

---

## Der Umgang mit den Entwürfen

`mockups/` ist der Sollzustand. Weicht das Gebaute ab, ist entweder
das Gebaute falsch **oder der Entwurf**. Beides kommt vor. Was
zutrifft, entscheidet der Mensch — nicht Claude Code, und nicht
stillschweigend.

Ändert sich ein Entwurf, wird `werkzeug/bau-mockups.mjs` geändert und
neu ausgeführt. Nie die erzeugte HTML-Datei.

---

## Was nicht gemacht wird

* Keine Bibliothek einbauen, auch keine kleine, auch nicht „nur zum
  Testen".
* Keine zweite Datei neben `editor.html`.
* Keinen Block anbieten, den es nicht gibt.
* Kein Dialekt ohne Schalter.
* Nicht die ganze Datei neu schreiben.
