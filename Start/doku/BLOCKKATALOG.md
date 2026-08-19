# Blockkatalog

Für jeden Block, den Notion kann, muss dieser Editor entscheiden: weglassen, in HTML ausweichen, einen Dialekt sprechen — oder er geht gar nicht.

**Diese Datei wird erzeugt.** Sie kommt aus `KATALOG` in `werkzeug/bau-mockups.mjs`, genau wie `mockups/bloecke.html`. Ändern heißt: dort ändern und `node werkzeug/bau-mockups.mjs` laufen lassen.

| Block | Kürzel | In der Datei | Urteil | Stand |
|---|---|---|---|---|
| Text | — | ` Ein einfacher Absatz. ` | rein | gebaut |
| Überschrift 1–3 | ` # ## ### ` | ` ## 2 Zielbild ` | rein | gebaut |
| Aufzählung | ` - ` | ` - Erster Punkt ` | rein | gebaut |
| Nummerierte Liste | ` 1. ` | ` 1. Erster Punkt ` | rein | gebaut |
| To-do-Liste | ` - [ ] ` | ` - [ ] Berichte sichten `<br>` - [x] Erledigtes ` | GFM | gebaut |
| Zitat | ` > ` | ` > Ein abgesetzter Satz. ` | rein | gebaut |
| Trennlinie | ` --- ` | ` --- ` | rein | gebaut |
| Codeblock | ```` ``` ```` | ```` ```javascript ````<br>` const n = 1; `<br>```` ``` ```` | rein | gebaut |
| Text in Code | `` `…` `` | `` Der Wert `localStorage` `` | rein | gebaut |
| Fett, kursiv | ` ** * ` | ` **fett** und *kursiv* ` | rein | gebaut |
| Durchgestrichen | ` ~~ ` | ` ~~verworfen~~ ` | GFM | gebaut |
| Unterstrichen | — | ` <u>unterstrichen</u> ` | HTML | offen |
| Link | ` [ ]( ) ` | ` [Schnittstellen](./Schnittstellen.md) ` | rein | gebaut |
| Bild | ` ![ ]( ) ` | ` ![Das Raster](./bilder/raster.png) ` | rein | offen |
| Tabelle | ` \| ` | ` \| Name \| Format \| `<br>` \| --- \| --- \| `<br>` \| Export \| CSV \| ` | GFM | offen |
| Callout | ` 💡 ` | ` > [!TIP] `<br>` > Vier davon sind derselbe Export. ` | Dialekt | offen |
| Toggle-Liste | ` › ` | ` <details> `<br>` <summary>Entscheidungen</summary> `<br><br>` … `<br><br>` </details> ` | HTML | offen |
| Markierter Text | ` == ` | ` ==elf Jahre== ` | Dialekt | gebaut |
| Farbiger Text | — | ` <span style="color:#c0392b">dringend</span> ` | HTML | offen |
| Erwähnung | ` @ [[ ]] ` | ` [[Kai Richter]] ` | Dialekt | offen |
| Lesezeichen | — | ` [Handbuch](https://conf.firma.de/hb) ` | rein | offen |
| Inhaltsverzeichnis | — | ` <!-- inhalt -->   ← oder beim Speichern erzeugt ` | Dialekt | offen |
| Eigenschaften | ` --- ` | ` --- `<br>` status: laeuft `<br>` datum: 2026-08-19 `<br>` --- ` | Dialekt | offen |
| Spalten | — | — | geht nicht | offen |
| Kommentar am Text | — | — | geht nicht | offen |
| Synchronisierter Block | — | — | geht nicht | offen |
| Datenbank | — | — | geht nicht | offen |

## Was die Urteile bedeuten

* **rein** — läuft in jedem Werkzeug der Welt. 12 Blöcke.
* **GFM** — GitHub-Markdown, sehr verbreitet, aber eine Erweiterung. 3 Blöcke.
* **HTML** — gültiges Markdown, im nächsten Editor aber rohes HTML statt eines Blocks. 3 Blöcke.
* **Dialekt** — bindet die Datei an das Werkzeug, das ihn kennt. 5 Blöcke.
* **geht nicht** — ohne eine zweite Datei nicht zu haben. 4 Blöcke. Siehe `doku/ENTSCHEIDUNGEN.md`, Punkt 1.

## Stand

**13 von 27 Blöcken sind gebaut.** Welcher Schritt welchen bringt, steht in `doku/ROADMAP.md`.
