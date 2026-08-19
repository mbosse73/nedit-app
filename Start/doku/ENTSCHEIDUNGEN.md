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

## 2 · Wie der Editor an Dateien kommt — **teilweise offen**

Ein Browsertest im Schwesterprojekt hat ergeben: **Edge erlaubt aus
einer lokal geöffneten Datei keinen direkten Dateizugriff.** Die File
System Access API ist damit keine Option, solange die harte Regel 1
gilt (eine Datei, per Doppelklick, ohne Server).

**Entschieden für den Einzelfall:**

* Öffnen über `<input type="file">`.
* Sichern über den Download.
* Der Arbeitsstand dazwischen liegt in `localStorage`.

Das genügt für „eine Datei bearbeiten". Es genügt **nicht** für den
Ordnerbaum aus `mockups/schreiben.html`.

**Offen, und vor Schritt 8 zu entscheiden:** Ein Ordner lässt sich über
`<input webkitdirectory>` einlesen — alle Dateien auf einmal, als
Kopie im Speicher. Zurückschreiben lässt er sich nicht; jede geänderte
Datei käme einzeln als Download heraus, und der Nutzer müsste sie von
Hand an ihren Platz legen. Drei Wege:

1. **Ordner nur lesen.** Der Baum zeigt, was da ist; geändert wird
   immer nur die eine offene Datei, gesichert per Download. Ehrlich,
   aber der Baum verspricht mehr, als er hält.
2. **Auf die Regel verzichten** und den Editor über einen kleinen
   lokalen Server ausliefern. Dann geht die File System Access API,
   und der Baum ist echt. Kostet die Grundbedingung des Projekts.
3. **Keinen Baum.** Eine Datei, ein Fenster. Am wenigsten Notion, am
   wenigsten Lüge.

Ohne Entscheidung wird Schritt 8 nicht begonnen.

---

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
