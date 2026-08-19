# Herkunft — bitte vor dem ersten größeren Schritt lesen

Dieses Projekt geht auf einen Entwurf zurück, den Claude in einer
Sitzung im August 2026 gebaut hat. Zwei Dinge daran müssen bekannt
sein, sonst baut man auf einer Annahme weiter, die niemand geprüft hat.

---

## 1 · Die Notion-Oberfläche ist aus dem Gedächtnis nachgebaut

**Nicht aus dem Produkt, nicht aus Bildschirmfotos, nicht aus der
Dokumentation.** Notion war aus der Umgebung, in der die Entwürfe
entstanden, nicht abrufbar — `notion.so`, `notion.com/help` und
`developers.notion.com` lieferten alle drei keine Antwort. Der
Wissensstand des Modells endete im Mai 2026, und Notion ändert seine
Oberfläche mehrmals im Jahr.

**Was mit einiger Sicherheit stimmt** — Griffe, die seit Jahren stabil
sind:

* der Blockgriff aus `⠿` und `+` links am Absatz
* der Platzhalter „Beginne zu schreiben, tippe / für Befehle"
* die schwebende Leiste beim Markieren
* „Umwandeln in"
* die schmale Schreibspalte, Kopfbild, Emoji, großer Titel
* Callouts, Toggles, Codeblöcke mit Sprachwahl

**Was sicher nicht stimmt:**

* **Notions Slash-Menü hat keine zweite Spalte.** Es ist eine einfache
  Liste. Die Vorschau rechts in `mockups/slash.html` ist erfunden —
  und zwar bewusst: Sie zeigt, was in die Datei kommt, und genau das
  braucht ein Markdown-Editor. Sie bleibt, aber sie ist **kein Zitat**.
* **Notion AI fehlt vollständig.** In neueren Fassungen sitzt sie
  prominent in der Auswahlleiste und oben im Slash-Menü.

**Was schlicht unbekannt ist:** die genauen Gruppennamen im
Slash-Menü, wo die Einstellungen heute hängen, wie Seiteneigenschaften
derzeit dargestellt werden, die exakten Farbwerte.

### Was daraus folgt

Die Entwürfe taugen als **Absichtserklärung**, nicht als Vorlage zum
Abmalen. Wer diesen Editor ernsthaft weiterbaut, sollte einmal mit
Notion nebeneinander sitzen und die Entwürfe nachziehen. Weil alles aus
`werkzeug/bau-mockups.mjs` kommt, ist das billig: eine Stelle ändern,
neu bauen.

Der **Blockkatalog** ist davon nicht betroffen. Er hängt an Markdown,
nicht an Notions Versionsstand.

---

## 2 · Was aus dem Schwesterprojekt übernommen ist

Die Arbeitsregeln, der Prüflauf, der Sitzungshaken und die
Namensgebung (`Z`, `bewahre`, `melde`, `male`, `ersetze`) stammen aus
einem Dashboard-Projekt desselben Nutzers — einer Anwendung nach
denselben harten Regeln: eine Datei, offline, per Doppelklick, ohne
Abhängigkeiten.

Übernommen wurden auch zwei **geprüfte Befunde**, die hier als gegeben
gelten und nicht noch einmal nachgemessen wurden:

* Edge erlaubt aus einer lokal geöffneten Datei keinen direkten
  Dateizugriff (Browsertest am Zielrechner, 7. August 2026).
* `localStorage` funktioniert dort, ebenso Zwischenablage und
  `mailto:`/`tel:`.

Nicht übernommen und **offen**: ob Edge den Download einer erzeugten
Datei aus einer `file://`-Seite annimmt. Im Schwesterprojekt steht das
noch auf der Liste der offenen Punkte. **Das betrifft hier den Knopf
„Sichern" und ist damit keine Nebensache** — es ist der erste Punkt in
`STAND.md`.
