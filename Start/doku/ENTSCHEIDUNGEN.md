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

**Nachtrag August 2026:** Die Anforderung dahinter — eine Anmerkung an
einer Stelle im Text, gesammelt in einer Seitenleiste — hat eine Form,
die Markdown kennt: die **Fußnote**. Sie steht in der Datei und
überlebt das Kopieren. Sie ist gebaut, samt Seitenleiste; siehe
Punkt 18. Der Kommentar am Text bleibt gestrichen.

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
Themen und die Seiteneinrichtung beantwortet, nie über die Datei.

**Eine Ausnahme, und nur eine:** der Seitenumbruch. Warum er keine ist,
steht in Punkt 18.

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

**Vier Druck-Layouts**, umschaltbar in den Einstellungen:

* **Schlicht** — die Vorgabe. Nüchtern, wenig Zierrat, spart Papier.
* **Technische Doku** — enger Satz, gerahmte Codeblöcke, Tabellen mit
  Linien, jede Überschrift 1 auf einer neuen Seite, nummerierte
  Überschriften.
* **Magazin** — Serifenschrift, schmale Spalte (118 mm, rund 70
  Zeichen), große Überschriften, Blocksatz.
* **Manuskript** — eine Spalte, großer Zeilenabstand, breiter
  Korrekturrand.

**Die Seitenzahl setzt der Browser**, nicht die Seite. Sie steht im
Druckdialog und lässt sich von hier aus nicht steuern — Chrome und Edge
unterstützen die dafür vorgesehene CSS-Regel nicht.

**Nachtrag August 2026:** Für **Kopf- und Fußzeile** gilt dieser Satz
nicht mehr. Sie sind über `<thead>` und `<tfoot>` einer Tabelle zu
haben, mitsamt Bild, und stehen auf jeder Seite. Ebenso Seitengröße,
Hoch- und Querformat und die vier Ränder. Siehe Punkt 17. Nur die
Seitenzahl bleibt beim Browser.

**Die vier Druck-Layouts sind in die Vorschau-Themen aufgegangen** —
ein Satz Themen für Vorschau, Druck und Export statt zweier. Siehe
Punkt 20.

### Die Nummerierung im Technik-Layout

Das Layout nummeriert die Überschriften selbst — **aber nur die, die
noch keine Nummer tragen.** Steht `## 1 Bestandsaufnahme` in der
Datei, bleibt es dabei; steht dort `## Offene Fragen`, bekommt es
eine. Sonst stünde auf dem Papier „1.1  1 Bestandsaufnahme".

Gezählt wird trotzdem an **jeder** Überschrift, auch an den
übersprungenen: Die vergebene Nummer soll die Stelle im Dokument
treffen. Ein Text, in dem nur ein Teil der Überschriften eine eigene
Nummer trägt, ergibt deshalb eine gemischte Folge (`1`, dann
`1.2`). Das ist die ehrliche Anzeige einer uneinheitlichen Vorlage —
**entweder alle Überschriften selbst nummerieren oder keine.**

Erkannt wird über `EIGENE_NUMMER` in Abschnitt 5; CSS-Zähler können
keinen Text lesen, deshalb setzt `blockMalen` die Klasse `eigen`.

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

---

## 13 · Farbe im Quelltext liegt in einer zweiten Schicht

Ein `<textarea>` kann keine Auszeichnung tragen — es kennt nur eine
Farbe für allen Text. Wer im Quelltext Farbe will, hat zwei Wege:

1. Das Feld gegen ein `contenteditable` tauschen. Dann färbt man
   frei — und verliert das, was ein Textfeld von sich aus richtig
   macht: Rückgängig, Einfügen als reiner Text, die Schreibmarke, das
   Verhalten der Bildschirmtastatur.
2. Ein `<pre>` mit dem eingefärbten Text **unter** das Feld legen und
   die Schrift im Feld durchsichtig machen.

Gewählt ist der zweite Weg. Der Preis dafür ist eine harte Bedingung:
**Beide Schichten müssen zeichengenau gleich umbrechen.** Bricht die
Farbschicht eine Zeile früher, steht sie ab dort neben der
Schreibmarke.

Deshalb steht jedes Maß, das den Umbruch beeinflusst — Schriftart,
Größe, Zeilenhöhe, Innenabstand, Tabulatorbreite, Umbruchregel — in
**genau einer** CSS-Regel für beide Schichten, und `scrollbar-gutter`
hält den Platz des Rollbalkens auf beiden Seiten frei. Zwei Proben in
`werkzeug/probe.mjs` rechnen das nach: gleicher Text, gleiche Höhe,
gleiche Breite.

Die Färbung selbst **entscheidet nichts**. Sie deutet dieselben Zeilen
wie `leseMarkdown`, aber getrennt davon; ein falsch gefärbtes Zeichen
steht trotzdem unverändert in der Datei. Was die gewählte Stufe nicht
kann, wird auch nicht gefärbt — harte Regel 9 gilt hier wie überall.

---

## 14 · Der Suchtreffer ist orange, nicht gelb

Beide waren gelb: der Textmarker (`==…==`, eine Auszeichnung **in der
Datei**) und der Suchtreffer (eine Anzeige, die verschwindet, sobald
man die Suche schließt). Dieselbe Farbe für beides behauptet, sie
seien dasselbe.

Der Suchtreffer hat jetzt ein eigenes Token `--fund` in Hellorange.
Der Prüflauf rechnet für beide Töne nach, dass der Text darauf über
4,5 : 1 bleibt — in beiden Themen.

---

## 15 · Fortsetzungszeilen gehören zum Listenpunkt

Bis August 2026 las `leseMarkdown` jede Zeile für sich. Eine
eingerückte Folgezeile ohne eigenes Listenzeichen wurde damit ein
eigener Absatz — und weil ein Absatz die Liste unterbricht, fing die
Nummerierung danach wieder bei `1.` an. Der mitgelieferte Starttext
schrieb sich selbst als `1. 1. 2.` zurück.

Jetzt gilt: **Eine eingerückte Zeile ohne eigenes Zeichen, direkt
hinter einem Listenpunkt, gehört zu ihm.** Drei Bedingungen, alle
nötig:

1. Die Zeile beginnt mit Leerzeichen oder Tabulator.
2. Es ist kein Absatz offen.
3. Die Zeile davor war nicht leer — **nach einer Leerzeile ist der
   Punkt zu Ende.**

Der Block trägt die Fortsetzung dann als zweite Zeile in seinem Feld
`text`. Das ist keine Neuerung: Ein Absatz aus mehreren Zeilen tat das
schon immer.

**Der Preis ist eine Normalisierung.** Beim Zurückschreiben wird die
Fortsetzung auf die Spalte des Inhalts gerückt — genau so weit, wie
das Listenzeichen breit ist (`- ` zwei, `1. ` drei, `- [ ] ` sechs
Zeichen). Wer eine Datei mit anderer Einrückung öffnet, bekommt sie
vereinheitlicht zurück. Das ist derselbe Handel, den der Editor schon
bei `*` → `-` und bei der Neuvergabe der Nummern eingeht: Der Text
bleibt, die Schreibweise wird die des Editors.

Was **nicht** angehängt wird: eine nicht eingerückte Folgezeile. Der
weiche Umbruch mitten in einem Fließtextabsatz (`lazy continuation`)
bleibt außen vor — er würde den nächsten Absatz verschlucken.

Sechs Proben in `werkzeug/pruefen.mjs` sichern das ab, darunter eine
Gegenprobe mit Leerzeile.

---

## 16 · Der Quelltext warnt, wo die Datei sich bindet

Die Farbe im Quelltext sagt, **was** eine Stelle ist. Sie sagt nicht,
**wo es klemmt**, wenn die Datei woanders geöffnet wird — und genau
das ist die Frage, die man sich in der Dateiansicht stellt.

Zeilen jenseits des reinen Markdown sind deshalb warm hinterlegt, mit
einem Zettel am rechten Rand: `GFM`, `Dialekt` oder `HTML`. Die
Urteile kommen aus derselben Tabelle `URTEIL` wie das Urteil am Block
und im Slash-Menü; sie können nicht auseinanderlaufen.

Drei Festlegungen dazu:

* **Ein Zettel je Bereich, nicht je Zeile.** Eine Tabelle aus fünf
  Zeilen sagt einmal `GFM`.
* **Das stärkere Urteil gewinnt.** Ein To-do mit einem `[[Wiki-Link]]`
  darin ist nicht `GFM`, sondern `Dialekt` — es braucht Obsidian.
* **Der Zettel steht außerhalb des Textflusses** (`position:absolute`).
  Im Fluss verschöbe er den Umbruch, und die Farbschicht stünde ab
  dort neben der Schreibmarke — siehe Punkt 13.

Gewarnt wird nach dem, was `leseMarkdown` aus der Zeile machen würde.
Die beiden Auszeichnungen im Text (`~~…~~`, `==…==`) hängen zusätzlich
an der Stufe: Was der Editor nicht als Auszeichnung liest, meldet er
auch nicht — harte Regel 9.

---

## 17 · Gedruckt wird das Dokument, nicht die Schreibfläche

Bis August 2026 druckte der Editor die Schreibfläche: dieselben
`.blk`-Zeilen, nur ohne Griffe. Das war der kürzeste Weg und der
falsche. Die Fläche hat eine feste Spaltenbreite von 708 Pixeln, sie
zeigt den Rohtext unter der Schreibmarke, sie hat Griffe, Urteile und
Marken — nichts davon gehört aufs Papier, und jedes davon musste im
Druckstil einzeln wieder weggeräumt werden. Vor allem aber: Eine
Vorschau, die anders gebaut ist als das Papier, ist keine Vorschau.

**Entschieden:** Es gibt eine Funktion `dokumentHtml()`, die aus den
Blöcken **richtiges HTML** baut — `<h1>`, `<p>`, verschachtelte
`<ul>`, `<blockquote>`, `<pre><code>`, `<table>`. Dieselbe
Zeichenkette geht an drei Stellen:

* in die **Vorschau** (`#vdok`),
* in das **Druckblatt** (`#druckblatt`), aus dem der Druckdialog liest,
* in die **exportierte HTML-Datei**.

Drei Ausgaben, eine Quelle. Liefen sie auseinander, wäre die Vorschau
eine Behauptung statt einer Anzeige.

Der Stil dazu steht als Zeichenkette `DOK_CSS` im Skript und nicht im
`<style>`-Block: Der Export braucht ihn wörtlich, und zwei gepflegte
Fassungen desselben Stils wären eine zu viel. Vier Stilblöcke hängt
das Skript zur Laufzeit ein — `dokstil`, `eigenstil`, `seitenstil` —
in dieser Reihenfolge: Grundstil, Thema, eigene Maße, eigenes CSS.

**Die mitlaufende Kopf- und Fußzeile** hängt an `<thead>` und
`<tfoot>` einer Tabelle. Das ist der einzige Weg, den Chromium
verlässlich auf jeder Seite wiederholt; ein `position:fixed`-Kasten
säße im Satzspiegel und liefe in den Text. Die Tabelle wird **nur**
gebaut, wenn eine Kopf- oder Fußzeile eingetragen ist — ohne sie
bleibt das Dokument ein gewöhnlicher Fluss, und der bricht sauberer
um.

**Die Seitenzahl bleibt beim Browser.** `counter(page)` in einem
Randkasten kennt Chromium nicht; was der Editor selbst schriebe,
stünde auf jeder Seite gleich. Sie steht im Druckdialog unter „Kopf-
und Fußzeilen“, und die Karte „Seite einrichten“ sagt das auch.

---

## 18 · Zwei neue Blöcke: Fußnote und Seitenumbruch

### Die Fußnote — die ehrliche Antwort auf Punkt 8

Punkt 8 schließt **Kommentare am Text** aus, und dabei bleibt es: Ein
Kommentar, der beim Kopieren der Datei verschwindet, ist schlimmer als
keiner. Die Anforderung dahinter — eine Anmerkung an einer Stelle im
Text, gesammelt in einer Seitenleiste — hat aber eine Form, die
Markdown kennt: die **Fußnote**.

```
Ein Satz mit Beleg.[^1]

[^1]: Woher der Satz stammt.
```

Sie steht in der Datei. Sie überlebt das Kopieren. GitHub, Pandoc und
Obsidian zeigen sie. Damit erfüllt sie genau die Bedingung, an der der
Kommentar gescheitert ist.

**Entschieden:** Die Fußnote ist eine Blockart `fussnote` mit Urteil
`GFM`, hängt am Merkmal `fussnote` und damit an der Stufe (harte
Regel 9) — ab `GitHub`, auch auf `Obsidian` und `Pandoc`, nicht auf
`Rein`. Sie trägt ihre ganze Quelle im Feld `text`, wie Tabelle,
Callout und Toggle, und steht in `GRUPPIERT`: Zwei Erklärungen
untereinander bekommen keine Leerzeile dazwischen, sonst käme die
Datei anders zurück, als sie hereinkam.

Die Fußnotenleiste rechts sammelt sie und meldet, welche **keinen
Verweis im Text** hat. Eine Fußnote, die nirgends steht, ist eine, die
niemand findet.

### Der Seitenumbruch — und warum er trotz Punkt 9 in die Datei darf

Punkt 9 sagt: Aussehen gehört nicht in die Datei. Ein Seitenumbruch
sieht aus wie ein Verstoß dagegen, und die Frage ist ernst gemeint
gestellt worden.

Er ist keiner, aus drei Gründen:

1. **Er ist keine Gestaltung, sondern Gliederung.** „Hier fängt etwas
   Neues an“ ist dieselbe Art von Aussage wie eine Überschrift oder
   eine Trennlinie — und die Trennlinie steht seit Schritt 1 in der
   Datei.
2. **Er ist überall gültig und überall unsichtbar.** Die Form ist ein
   HTML-Kommentar: `<!-- seitenumbruch -->`. Jeder Markdown-Leser der
   Welt überliest ihn. Er bindet die Datei an nichts.
3. **Ohne ihn ist der PDF-Export nicht zu bedienen.** Die Alternative
   — der Umbruch als Editor-Einstellung — beantwortet nur die
   regelmäßige Frage („vor jeder Überschrift 1“), nicht die einzelne
   („nach dem Vorwort“). **Beides ist gebaut**: die Regel in der Karte
   „Seite einrichten“, die Ausnahme als Block.

Genau dieses Argument gilt für `<!-- Anmerkung -->` **nicht** — dort
war die Unsichtbarkeit der Mangel, hier ist sie der Zweck.

**Entschieden:** Blockart `umbruch`, Urteil `HTML`, am Merkmal `html`
und damit ab Stufe `GitHub`. Er trägt keinen Text: Auf der Fläche ist
er eine gestrichelte Linie mit Wort in der Mitte, im Export beginnt
dort eine Seite.

---

## 19 · Ein Verweis ist auf der Fläche eine Farbe, im Dokument ein Ziel

`inlineMalen` hat bisher aus `[Wort](Ziel)` ein `<span class="verweis">`
gemacht — Farbe ohne Ziel. Das war richtig und ist es weiterhin: Die
Anwendung geht zu keinem Zeitpunkt ins Netz (harte Regel 2), und ein
Klick mitten im Schreiben soll nichts öffnen.

Im **Dokument** ist ein Verweis ohne Ziel wertlos. Eine exportierte
HTML-Datei, in der kein Link führt, ist keine Ausgabe, sondern ein
Bild vom Text.

**Entschieden:** Ein Schalter `MALART` statt eines zweiten
Umwandlers. Er steht auf `"flaeche"` und wird für die Dauer von
`dokumentHtml()` auf `"dokument"` gestellt. Zwei Fassungen derselben
Auszeichnung liefen unweigerlich auseinander; ein Schalter kann das
nicht.

Dasselbe gilt für Bilder: Auf der Fläche wird ein Verweis ins Netz
benannt und nicht geladen; im Dokument wird ein **mitgewähltes** Bild
als Daten-Adresse eingesetzt (Punkt 22). Geladen wird auch dort
nichts.

---

## 20 · Druck-Layout und Vorschau-Thema sind dasselbe

Schritt 9 hat vier **Druck-Layouts** gebracht: Schlicht, Technische
Doku, Magazin, Manuskript. Die Vorschau hätte daneben einen zweiten
Satz **Themen** gebraucht. Zwei Systeme für dieselbe Frage — wie sieht
das Dokument aus — und die sichere Folge, dass die Vorschau etwas
anderes zeigt als das Papier.

**Entschieden: zusammengelegt.** Es gibt **einen** Satz von acht
Themen für das Dokument, und er gilt in Vorschau, Druck und Export:

`Wie der Editor · Papier · Buchsatz · Technische Doku · Zeitung ·
Hoher Kontrast · Manuskript · Schreibmaschine`

Die vier alten Layouts sind darin aufgegangen: „Schlicht“ ist „Wie der
Editor“, „Magazin“ ist „Buchsatz“, die beiden anderen heißen weiter,
wie sie hießen. Die Einstellung `Z.druck` ist entfallen, `Z.vthema`
hat ihren Platz.

Zwei Dinge bleiben davon unberührt:

* **Das Thema der Anwendung** (`hell`/`dunkel`) färbt die Werkbank,
  nicht das Dokument. Papier bleibt Papier, auch wenn die Werkbank
  dunkel steht.
* **Die Nummerierung im Thema „Technische Doku“** nummeriert weiter
  nur die Überschriften ohne eigene Nummer, nach derselben Regel und
  demselben `EIGENE_NUMMER` wie in Punkt 10.

---

## 21 · DOCX und RTF entstehen von Hand — und ohne Bilder

Eine Bibliothek für DOCX oder RTF wäre nach harter Regel 2
ausgeschlossen. Beide Formate sind trotzdem zu haben:

* **RTF** ist reiner Text mit Steuerwörtern. Was nicht in ASCII passt,
  wird als `\uNNNN?` geschrieben.
* **DOCX** ist ein ZIP mit sechs XML-Teilen. Gepackt wird **ohne
  Komprimierung** (Verfahren 0) — ein Packer wäre der nächste fremde
  Code, und Word liest gespeicherte Einträge genauso. Die
  Prüfsumme CRC-32 steht als Tabelle im Skript, dreißig Zeilen.
  Überschriften, Zitate, Code, Tabellen und **echte Listen** über
  `numbering.xml` sind dabei; die Seitengröße kommt aus derselben
  Einstellung wie beim Druck.

**Was beide nicht können: Bilder.** Beide Formate legen sie binär im
Dokument ab — bei DOCX als eigener Teil im ZIP mit einer Beziehung und
einem `<w:drawing>` samt Maßen in EMU, bei RTF als Hexdump mit
Bildgröße. Das ist jeweils ein eigener Schritt, und keiner davon ist
nötig, um das Format brauchbar zu machen.

**Entschieden:** In DOCX und RTF steht an der Stelle eines Bildes
`[Bild: Titel]`. Der Editor sagt es beim Ausgeben, und im Menü steht,
dass HTML und PDF die Bilder mitnehmen. Ein Export, der Bilder
stillschweigend verschluckt, wäre schlimmer als einer, der es
ausspricht.

---

## 22 · Zusammenfügen ist eine Einbahnstraße

Ein Buch liegt selten in einer Datei. Der Editor fügt mehrere zu einem
Dokument zusammen — nach Dateinamen sortiert, mit `10` hinter `9` und
nicht davor. Wahlweise mit einem Seitenumbruch zwischen den Teilen
oder mit dem Dateinamen als Überschrift.

**Das ist kein Ordnerbaum.** Punkt 2 bleibt: Ein Ordner ließe sich
einlesen, aber nicht zurückschreiben. Deshalb ist ausdrücklich
entschieden, dass das Zusammenfügen **in eine Richtung** geht: Was
hereinkommt, geht als **eine** Datei wieder heraus. Ein Baum, der so
täte, als schriebe er die Einzeldateien zurück, verspräche mehr, als
er hält.

**Bilder in derselben Auswahl** werden als Daten-Adresse gemerkt und
lösen `![](bilder/raster.png)` über den Dateinamen auf. Sie stehen
damit in Vorschau, Druck und HTML-Export — und nur dort: Die
`.md`-Datei behält den Pfad, der in ihr steht. Geladen wird nichts,
schon gar nicht aus dem Netz.

---

## 23 · Diagramme bleiben draußen

Nach Diagrammen im Codeblock — Mermaid, PlantUML, Graphviz — ist
gefragt worden. Sie sind **nicht** gebaut, und das ist eine
Entscheidung, keine Lücke.

Jedes dieser Formate braucht einen Übersetzer: Mermaid sind rund
tausend Kilobyte JavaScript, PlantUML und Graphviz brauchen einen
Dienst im Netz oder ein Programm auf dem Rechner. Beides verstößt
gegen harte Regel 2, und der zweite Weg zusätzlich gegen die Zusage,
dass die Anwendung zu keinem Zeitpunkt ins Netz geht.

**Entschieden:** Ein Codeblock mit `mermaid` am Zaun bleibt ein
Codeblock — mit Syntaxfarbe, unverändert in der Datei, und in jedem
Werkzeug, das Mermaid kann, ein Diagramm. Der Editor zeigt den
Bauplan, nicht das Bild. Was er dafür kann, ist die **technische
Seite** der Anforderung: Syntaxfarbe für über fünfzig Sprachen,
Tabellen, Fußnoten, Codeblöcke mit Sprachmarke und ein Thema
„Technische Doku“, das die Überschriften nummeriert.

Wer das Bild braucht, erzeugt es außerhalb und bindet es als Bild ein
— `![Ablauf](./bilder/ablauf.svg)`. Das ist ein Verweis, wie jeder
andere, und der Editor zeigt ihn.

---

## 24 · Das eigene CSS gilt ungekapselt

Der Stil-Verwalter hat ein Feld für eigenes CSS. Es wäre möglich
gewesen, jede Regel darin automatisch mit `.dok` zu versehen, damit
sie nur das Dokument trifft. Dagegen sprechen zwei Dinge: Ein solcher
Vorsatz braucht einen CSS-Zerleger, der `@media`, `@keyframes` und
Auswahlketten richtig behandelt — und wer eigenes CSS schreibt, will
es durchsetzen, nicht mit dem Editor verhandeln.

**Entschieden:** Das eigene CSS wird als letzter Stilblock eingehängt
und gilt ungekapselt. Es schlägt damit jedes Thema. Der Hinweis im
Feld sagt, was das heißt: Regeln mit `.dok` davor gelten nur für das
Dokument, ohne das verändern sie auch die Oberfläche. Es geht in den
HTML-Export mit ein und gilt auch im Druck.

Der Platzhalter im Feld zeigt zwei Regeln mit `.dok` davor. Wer sie
übernimmt, macht es richtig, ohne es gelesen zu haben.
