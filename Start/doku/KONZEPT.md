# Das Konzept

## Die Frage

Wie sähe ein Markdown-Editor aus, wenn er den Notion-Editor in
Oberfläche und Funktionen kopiert?

## Die kurze Antwort

**Besser, als man denkt — bis zu einer scharfen Kante.**

Notion und Markdown sind beide zeilenweise gebaut. Ein Markdown-Absatz
*ist* schon ein Block, eine Überschrift *ist* schon ein Blocktyp. Der
Blockgriff, das Slash-Menü und „Umwandeln in" brauchen überhaupt kein
neues Dateiformat — sie bedienen nur, was ohnehin schon dasteht.

Von den siebenundzwanzig Blöcken in `doku/BLOCKKATALOG.md` sind
fünfzehn reines oder verbreitetes Markdown. Das ist der Teil, der
umsonst zu haben ist.

**Die Kante:** Vier Blöcke — Spalten, Kommentare am Text,
synchronisierte Blöcke, Datenbanken — haben in einer `.md`-Datei
keinen Ort. Weitere acht gehen nur über HTML oder einen Dialekt. Wie
damit umgegangen wird, steht in `doku/ENTSCHEIDUNGEN.md`, Punkt 1.

---

## Der tragende Satz

> **Markdown ist die Wahrheit.** Der Text eines Blocks ist immer
> Rohtext. Die Fläche zeigt ihn gerendert; gespeichert, kopiert und
> ausgegeben wird nie etwas anderes.

Daraus folgt alles Weitere:

* Kein Rich-Text-Modell, kein Baum aus Textstücken. Ein Block hat
  genau ein Feld `text` (`doku/ENTSCHEIDUNGEN.md`, Punkt 7).
* `lesen(schreiben(x))` muss `x` ergeben. Der Prüflauf rechnet das an
  neun Proben nach.
* Der Block unter der Schreibmarke zeigt seinen Rohtext — wer Markdown
  kann, wird nicht bestraft (Punkt 4).
* Was kein Markdown ist, wird **gekennzeichnet, nicht versteckt**.

---

## Die drei Griffe, die den Unterschied machen

**Der Blockgriff.** `+` legt darüber etwas an, `⠿` zieht den Absatz an
eine andere Stelle. Das ersetzt Ausschneiden und Einfügen — den
häufigsten Handgriff beim Umsortieren, und den, den ein Textfeld gar
nicht kennt.

**Das Slash-Menü.** Ein Einstieg für alle Blöcke. Wer die Syntax nicht
kennt, tippt `/` und sucht; wer sie kennt, tippt sie direkt. Weil das
Kürzel in jeder Zeile steht, braucht man das Menü nach zwei Wochen für
die häufigen Blöcke nicht mehr.

**„Umwandeln in".** Ein Absatz wird eine Überschrift, eine Aufzählung
wird eine To-do-Liste — ohne die Zeile anzufassen.

---

## Der eine Griff, den Notion nicht braucht

Die Vorschau im Slash-Menü zeigt nicht nur, **wie** der Block aussieht,
sondern **was in die Datei kommt** — und ob das reines Markdown ist,
GFM, HTML oder ein Dialekt. In der geteilten Ansicht sind dieselben
Stellen im Quelltext markiert.

Notion braucht das nicht, weil es keine Datei gibt. Für einen
Markdown-Editor ist es der Unterschied zwischen einem Werkzeug, dem man
traut, und einem, das hinter dem Rücken HTML schreibt.

---

## Was dieser Editor nicht sein will

* **Kein Notion.** Keine Datenbanken, keine Spalten, keine geteilten
  Arbeitsbereiche, keine Kommentare. Wer das braucht, nimmt Notion.
* **Kein zweites Dateiformat.** Nichts wird neben der `.md` abgelegt.
* **Kein Rohtext-Editor mit Vorschau.** Es gibt keine zwei Zustände,
  sondern eine Fläche — und daneben, wer will, den Quelltext.
