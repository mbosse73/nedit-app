# Entscheidungen

Was hier steht, ist entschieden — nicht vergessen. Wer es ändern will,
ändert **diese Datei zuerst** und begründet es. Ohne das wird jeder
Punkt beim nächsten Schritt neu verhandelt, und zwar anders.

---

## 1 · Was mit den Blöcken geschieht, die Markdown nicht kann

**Vier Blöcke haben in einer `.md`-Datei keinen Ort:** Spalten,
Kommentare am Text, synchronisierte Blöcke, Datenbanken. Weitere acht
gehen nur über HTML oder einen Dialekt. Es gibt genau vier Antworten
darauf, und `mockups/grenzen.html` stellt sie nebeneinander.

**Entschieden:** Weg 1 als Vorgabe, Weg 3 als Schalter, Weg 2 nur da,
wo Weg 3 nichts anbietet — und Weg 4 gar nicht.

* **Reines Markdown ist die Vorgabe.** Das Slash-Menü hat dann etwa
  fünfzehn Einträge statt vierunddreißig, und die Datei läuft überall.
* **Der Dialekt gehört in die Einstellungen**, nicht in den Code:
  `Rein · GitHub · Obsidian · Pandoc`. Dieselbe Fläche, andere Ausgabe.
* **HTML nur als Notausgang**, und gekennzeichnet: im Menü, in der
  Vorschau und im Quelltext.
* **Keine zweite Datei.** Wer einen Markdown-Editor will und nicht
  Notion, will die Datei. Sobald der Inhalt in zwei Dateien liegt, hat
  man Notions Nachteil — ein Werkzeug versteht es — ohne Notions
  Vorteil, dass es dafür alles kann.
* **Kommentare bleiben draußen.** Der schwerste Verzicht, und er ist
  trotzdem richtig: Ein Kommentar, der beim Kopieren der Datei
  verschwindet, ist schlimmer als keiner.

---

## 2 · Wie der Editor an Dateien kommt — **entschieden**

Ein Browsertest im Schwesterprojekt hat ergeben: **Edge erlaubt aus
einer lokal geöffneten Datei keinen direkten Dateizugriff.** Die File
System Access API ist damit keine Option, solange die harte Regel 1
gilt (eine Datei, per Doppelklick, ohne Server).

**Entschieden:**

* Öffnen über `<input type="file">`.
* Sichern über den Download.
* Der Arbeitsstand dazwischen liegt in `localStorage`.

**Der Download ist geprüft und angenommen** (August 2026, am
Zielrechner). Damit ist der schwerste offene Punkt des Projekts erledigt:
Der Editor hat einen Weg, etwas herauszugeben.

**Kein Ordnerbaum.** Der Entwurf `mockups/schreiben.html` zeigt links
einen Dateibaum. Ein Ordner ließe sich über `<input webkitdirectory>`
zwar einlesen, aber nicht zurückschreiben — jede geänderte Datei käme
einzeln als Download heraus, und der Nutzer müsste sie von Hand an
ihren Platz legen. Ein Baum, der das verschweigt, verspricht mehr, als
er hält.

**Entschieden: eine Datei, ein Fenster.** Kein Baum, auch kein
lesender. Damit entfällt Schritt 8 zur Hälfte; die Gliederung aus den
Überschriften bleibt, der Dateibaum fällt weg.

## 3 · Warum der Quelltext in der geteilten Ansicht nur zu lesen ist

Zwei schreibbare Stände nebeneinander sind zwei Wahrheiten. Die
Schreibmarke müsste in beiden dieselbe Stelle meinen; das ist der
teuerste Teil einer solchen Anwendung und der häufigste Ort für
Fehler.

**Entschieden:** In der Ansicht „Geteilt" ist der Quelltext nur zu
lesen und folgt der Fläche. In der Ansicht „Quelltext" ist er zu
schreiben, und beim Verlassen wird neu eingelesen. Eine Wahrheit, zwei
Blicke, ein Umschalter dazwischen.

---

## 4 · Warum der Block unter der Schreibmarke seinen Rohtext zeigt

Ein Editor, der `**fett**` versteckt, nimmt genau denen etwas weg, die
Markdown gewählt haben, weil es lesbarer Text ist.

**Entschieden:** Der Block, in dem die Schreibmarke steht, zeigt seinen
Rohtext; alle anderen zeigen das Ergebnis. Der Rohtext bleibt immer die
Wahrheit im Modell (`Z.bloecke[i].text`), die Anzeige wird nur gerechnet.

Der Preis: Beim Klick mitten in einen Absatz verschiebt sich die
Schreibmarke um die Länge der bis dahin verborgenen Zeichen. Das ist
hingenommen — dieselbe Unschärfe hat jeder Editor, der es so macht.

---

## 5 · Warum die Grauwerte nicht Notions Grauwerte sind

Notions Nebenschrift ist `rgba(55,53,47,.62)`. Auf Weiß ergibt das
**3,86 : 1** und liegt damit unter der Schwelle von 4,5 : 1 für
tragenden Text.

**Entschieden:** Die Tokens sind nachgedunkelt — `--tinte2` auf `.70`,
`--tinte3` auf `.55`. Der Ton bleibt, die Helligkeit nicht.
`werkzeug/pruefen.mjs` rechnet es bei jedem Lauf nach. Ein Vorbild
darf die Kontrastregel nicht unterlaufen.

---

## 6 · Warum `male()` alles neu baut

Jede strukturelle Änderung — Enter, Backspace, Umwandeln, Ziehen —
verschiebt Blöcke und damit jeden Index darunter. Teilzeichnen wäre
hier die Quelle jedes zweiten Fehlers.

**Entschieden:** `male()` baut die ganze Liste neu. **Beim Tippen wird
nicht gemalt** — dort wandert nur der Text ins Modell, sonst spränge
die Schreibmarke bei jedem Zeichen.

Falls das bei sehr langen Dokumenten zu langsam wird, ist die Antwort
nicht „teilweise malen", sondern „nur den sichtbaren Ausschnitt malen".
Das ist ein eigener Schritt und keine Notlösung nebenbei.

---

## 7 · Kein Rich-Text-Modell

Notion speichert ausgezeichneten Text als Baum aus Textstücken mit
Merkmalen. Das ist mächtiger und wäre hier falsch: Es gäbe zwei
Wahrheiten — den Baum und die Datei —, und die Umwandlung dazwischen
wäre nie ganz verlustfrei.

**Entschieden:** Ein Block hat genau ein Feld `text`, und darin steht
Markdown. Alles Weitere wird daraus gerechnet.

---

## 8 · Kommentare am Text bleiben draußen — endgültig

`mockups/auswahl.html` zeigte einen Kommentar-Knopf in der
Auswahlleiste. Das war ein Widerspruch zu Punkt 1, der Kommentare
ausschließt: Ein Kommentar hat in einer `.md`-Datei keinen Ort. Er
müsste entweder sichtbar im Text stehen oder in einer zweiten Datei
liegen — beides ist ausgeschlossen.

**Entschieden:** Der Knopf ist aus dem Entwurf entfernt. Die
Auswahlleiste trägt nur Knöpfe, deren Ergebnis in der Datei landet und
überall lesbar bleibt.

Der Weg über `<!-- Anmerkung -->` wurde erwogen und verworfen: Er
überlebt zwar das Kopieren, ist aber in jedem anderen Programm
unsichtbar. Ein Kommentar, den niemand sieht, ist keiner.

---

## 9 · Ausrichtung und Aussehen gehören nicht in die Datei

Markdown beschreibt, **was** etwas ist — eine Überschrift, ein Zitat —,
nicht **wie** es aussieht. Für Blocksatz, Schriftwahl oder Randbreite
gibt es kein Markdown-Zeichen, und das ist kein Mangel, sondern der
Grund, warum dieselbe Datei überall funktioniert.

**Entschieden:** Blocksatz ist eine **Anzeige-Einstellung** des
Editors, kein Merkmal des Textes. Er gilt für die Schreibfläche und
für den Druck; die Datei bleibt unberührt. Der Weg über
`<div style="text-align:justify">` wurde verworfen — er brächte
HTML-Gerüst mitten in den Text.

Dasselbe gilt für jede weitere Frage nach Aussehen: Sie wird über die
Themen und die Druck-Layouts beantwortet, nie über die Datei.

---

## 10 · Das PDF entsteht über den Druckdialog

Ein PDF-Erzeuger als Bibliothek in `editor.html` würde die Datei um
mehrere hundert Kilobyte aufblähen, fremden Code ins Projekt bringen
(harte Regel 2) und Seitenumbrüche schlechter beherrschen als der
Browser.

**Entschieden:** Der Knopf **PDF** öffnet den Druckdialog; dort wählt
der Nutzer „Als PDF speichern". Der Editor liefert dafür das Layout —
Schrift, Ränder, Umbrüche, Kopf- und Fußzeile. Die Arbeit steckt im
Druckstil, nicht in einem Erzeuger.

**Drei Druck-Layouts**, umschaltbar in den Einstellungen:

* **Schlicht** — die Vorgabe. Nüchtern, wenig Zierrat, spart Papier.
* **Technische Doku** — serifenlos, nummerierte Überschriften,
  gerahmte Codeblöcke, Tabellen mit Linien, Kopfzeile mit Seitenzahl.
* **Manuskript** — eine Spalte, großer Zeilenabstand, breiter
  Korrekturrand, Seitenzahlen.

---

## 11 · Was aus dem Blockkatalog gestrichen ist

Drei Auszeichnungen sind bewusst **nicht** gebaut worden, obwohl sie
im Katalog stehen:

* **Farbiger Text** (`<span style="color:…">`) und **Unterstrichen**
  (`<u>`) — beide bringen HTML-Gerüst in den Satz. In einem einfachen
  Editor sieht man den Schnipsel statt des Wortes.
* **Erwähnung** (`[[Name]]`) — nützt nur mit Obsidian und setzt einen
  Ordner voraus, den es nach Punkt 2 nicht gibt.

Aus dem Blockmenü gestrichen:

* **Link kopieren** — bezieht sich in Notion auf eine Web-Adresse pro
  Block. In einer `.md`-Datei gibt es die nicht.
* **Verschieben nach** — setzt mehrere Dateien voraus. Siehe Punkt 2.

Sie bleiben im Katalog als **abgelehnt** stehen, damit die Frage nicht
alle drei Monate neu gestellt wird.

---

## 12 · Eigenschaften aus dem YAML-Kopf sind zurückgestellt

Der Frontmatter-Kopf als Notions Eigenschaftenzeilen ist nicht
abgelehnt, sondern **vertagt**. Begründung: Er nützt vor allem beim
Verwalten vieler Dateien, und einen Ordnerbaum wird es nach Punkt 2
nicht geben.

Bis dahin gilt, was schon gilt: Ein vorhandener YAML-Kopf bleibt
unangetastet als Rohtext stehen und wird unverändert
zurückgeschrieben.
