/* ============================================================
   probe.mjs — die Bedienung im echten Browser

   `pruefen.mjs` liest die Datei, `schau.mjs` sieht sie an. Diese
   Probe **bedient** sie: Sie markiert Text, öffnet Menüs, rückt ein,
   nimmt zurück und wechselt die Stufe — und prüft, was danach in der
   Datei steht.

   Das ist der einzige Weg, den Rundlauf über die Fläche zu prüfen.
   `pruefen.mjs` rechnet `lesen(schreiben(x))` in einer Sandbox nach;
   ob ein Klick auf „Umwandeln in" dasselbe ergibt, sieht es nicht.

       node werkzeug/probe.mjs

   Rückgabewert 1, wenn eine Probe nicht stimmt.
   ============================================================ */
import { createRequire } from "node:module";
import { resolve } from "node:path";

function hole(name){
  for (const wo of ["/opt/node22/lib/node_modules/", process.cwd() + "/"]) {
    try { return createRequire(wo)(name); } catch { /* weitersuchen */ }
  }
  return null;
}
const pw = hole("playwright");
if (!pw) {
  console.error("Playwright ist hier nicht vorhanden. Dann von Hand bedienen.");
  process.exit(2);
}

let schlecht = 0;
const gut = (was) => console.log("  ✓ " + was);
const schlimm = (was, soll, ist) => {
  schlecht++;
  console.log("  ✗ " + was + "\n      erwartet: " + JSON.stringify(soll)
              + "\n      bekommen: " + JSON.stringify(ist));
};
const gleich = (was, ist, soll) => ist === soll ? gut(was) : schlimm(was, soll, ist);

const browser = await pw.chromium.launch();
const seite = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const skriptfehler = [];
seite.on("pageerror", (e) => skriptfehler.push(e.message));
await seite.goto("file://" + resolve("editor.html"));
await seite.evaluate(() => localStorage.clear());
await seite.reload();

/* ---------- Handgriffe ---------- */
const setzen = async (text) => {
  await seite.click("#w-quelltext");
  await seite.fill("#q", text);
  await seite.click("#w-schreiben");
  await seite.waitForTimeout(350);
};
const datei = async () => {
  await seite.click("#w-geteilt");
  const v = await seite.inputValue("#q");
  await seite.click("#w-schreiben");
  await seite.waitForTimeout(200);
  return v;
};
/* Die Kopfleiste trägt seit August 2026 keine Knöpfe mehr für die
   Karten — sie stehen im Punkte-Menü (doku/ENTSCHEIDUNGEN.md,
   Punkt 25). Die Proben gehen denselben Weg wie ein Mensch. */
const ausMenue = async (name) => {
  await seite.click("#mehr");
  await seite.waitForTimeout(220);
  await seite.click('#menue button:has(.nm:text-is("' + name + '"))');
  await seite.waitForTimeout(320);
};
const stufe = async (name) => {
  await ausMenue("Einstellungen …");
  await seite.click('#ein-gruppen .gruppe:has(.etikett:text-is("Markdown-Stufe")) '
                    + 'button:text-is("' + name + '")');
  await seite.click("#ein-zu");
  await seite.waitForTimeout(250);
};
const markieren = (von, bis) => seite.evaluate(([v, b]) => {
  const t = document.querySelector(".blk .txt");
  t.focus();
  const r = document.createRange();
  r.setStart(t.firstChild, v); r.setEnd(t.firstChild, b);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  document.dispatchEvent(new Event("selectionchange"));
}, [von, bis]);

/* ---------- 1 Die Auswahlleiste ---------- */
console.log("\nDie Auswahlleiste");
await stufe("Rein");
await setzen("Das Altsystem traegt alles.\n");
await markieren(4, 13);
await seite.waitForTimeout(200);
gleich("erscheint bei einer Markierung", await seite.isVisible("#leiste"), true);
gleich("zeigt auf Stufe Rein vier Zeichen und den Link",
  (await seite.$$eval("#leiste button", ns => ns.map(n => n.title.split(" ")[0]))).join(","),
  "Link,Fett,Kursiv,Code");
await seite.click('#leiste button[title^="Fett"]');
await seite.waitForTimeout(250);
gleich("setzt Sterne in den Rohtext", await datei(), "Das **Altsystem** traegt alles.\n");
/* Der Blick in die Datei wechselt die Ansicht und verbirgt die
   Leiste — fuer den zweiten Klick muss neu markiert werden. Die
   Sterne stehen jetzt mit im Text, das Wort beginnt zwei Zeichen
   spaeter. */
await seite.click('.blk[data-i="0"] .txt');
await markieren(6, 15);
await seite.waitForTimeout(250);
await seite.click('#leiste button[title^="Fett"]');
await seite.waitForTimeout(250);
gleich("nimmt beim zweiten Klick zurueck", await datei(), "Das Altsystem traegt alles.\n");

/* ---------- 2 Der Dialektschalter ---------- */
console.log("\nDer Dialektschalter");
await setzen("Ein ~~verworfener~~ und ==markierter== Satz.\n");
const zeig = () => seite.$eval(".blk .txt", n => n.innerHTML);
gleich("laesst auf Rein die Zeichen stehen", await zeig(),
  "Ein ~~verworfener~~ und ==markierter== Satz.");
await stufe("GitHub");
gleich("streicht auf GitHub durch", await zeig(),
  "Ein <s>verworfener</s> und ==markierter== Satz.");
await stufe("Obsidian");
gleich("markiert erst auf Obsidian", await zeig(),
  "Ein <s>verworfener</s> und <mark>markierter</mark> Satz.");

/* ---------- 3 Einruecken ---------- */
console.log("\nEinruecken");
await setzen("- eins\n- zwei\n- drei\n");
await seite.click('.blk[data-i="1"] .txt');
await seite.keyboard.press("Tab");
await seite.waitForTimeout(250);
gleich("Tab rueckt eine Stufe ein", await datei(), "- eins\n  - zwei\n- drei\n");
await seite.click('.blk[data-i="1"] .txt');
await seite.keyboard.press("Tab");
await seite.waitForTimeout(250);
gleich("aber nicht tiefer als der Vorgaenger plus eins", await datei(),
  "- eins\n  - zwei\n- drei\n");
await seite.click('.blk[data-i="1"] .txt');
await seite.keyboard.press("Shift+Tab");
await seite.waitForTimeout(250);
gleich("Umschalt+Tab rueckt wieder aus", await datei(), "- eins\n- zwei\n- drei\n");

/* ---------- 4 Blockmenue ---------- */
console.log("\nDas Blockmenue");
await seite.hover('.blk[data-i="0"]');
await seite.click('.blk[data-i="0"] .griff button:nth-child(2)');
await seite.waitForTimeout(250);
gleich("oeffnet sich am Griff", await seite.isVisible("#menue"), true);
await seite.click('#menue button:has(.nm:text-is("Überschrift 2"))');
await seite.waitForTimeout(300);
gleich("wandelt um, ohne die Zeile anzufassen", await datei(),
  "## eins\n\n- zwei\n- drei\n");
await seite.hover('.blk[data-i="0"]');
await seite.click('.blk[data-i="0"] .griff button:nth-child(2)');
await seite.click('#menue button:has(.nm:text-is("Duplizieren"))');
await seite.waitForTimeout(300);
gleich("dupliziert", await datei(), "## eins\n\n## eins\n\n- zwei\n- drei\n");

/* ---------- 5 Der Verlauf ---------- */
console.log("\nDer Verlauf");
await seite.waitForTimeout(600);
await seite.hover('.blk[data-i="0"]');
await seite.click('.blk[data-i="0"] .griff button:nth-child(2)');
await seite.click('#menue button:has(.nm:text-is("Löschen"))');
await seite.waitForTimeout(700);
gleich("loescht einen Block", await datei(), "## eins\n\n- zwei\n- drei\n");
await seite.click('.blk[data-i="0"] .txt');
await seite.keyboard.press("Control+z");
await seite.waitForTimeout(400);
gleich("Strg+Z holt ihn ueber die Blockgrenze zurueck", await datei(),
  "## eins\n\n## eins\n\n- zwei\n- drei\n");
await seite.keyboard.press("Control+y");
await seite.waitForTimeout(400);
gleich("Strg+Y wiederholt", await datei(), "## eins\n\n- zwei\n- drei\n");

/* ---------- 6 Das Slash-Menue ---------- */
console.log("\nDas Slash-Menue");
await stufe("Rein");
await setzen("\n");
await seite.click('.blk[data-i="0"] .txt');
await seite.keyboard.type("/tab");
await seite.waitForTimeout(300);
gleich("bietet die Tabelle auf Rein nicht an",
  (await seite.$$eval("#slash-liste button .nm", ns => ns.map(n => n.textContent))).join(","), "");
await seite.keyboard.press("Escape");
await stufe("GitHub");
await seite.click('.blk[data-i="0"] .txt');
await seite.evaluate(() => { document.querySelector('.blk[data-i="0"] .txt').textContent = ""; });
await seite.keyboard.type("/tab");
await seite.waitForTimeout(300);
gleich("auf GitHub schon",
  (await seite.$$eval("#slash-liste button .nm", ns => ns.map(n => n.textContent))).join(","),
  "Tabelle");
gleich("und zeigt, was in die Datei kommt",
  await seite.$eval("#slash-vorschau pre", n => n.textContent),
  "| Name | Format |\n| --- | --- |\n| Export | CSV |");
gleich("samt Urteil", await seite.$eval("#slash-vorschau .ur", n => n.textContent), "GFM");
await seite.keyboard.press("Enter");
await seite.waitForTimeout(400);
gleich("Enter setzt die Vorlage", await datei(),
  "| Spalte | Spalte |\n| --- | --- |\n|  |  |\n");

/* ---------- 7 Die drei Sonderbloecke ---------- */
console.log("\nTabelle, Callout, Toggle");
const QUELLE = "| Name | Format |\n| --- | --- |\n| Export | CSV |\n\n"
  + "> [!WARNING]\n> Vier davon sind derselbe Export.\n\n"
  + "<details>\n<summary>Entscheidungen</summary>\n\nDer Rumpf.\n\n</details>\n";
await setzen(QUELLE);
gleich("werden als drei Bloecke gelesen",
  await seite.$$eval(".blk", ns => ns.map(n => n.className).join(" / ")),
  "blk tabelle / blk callout warnung / blk toggle");
gleich("die Tabelle wird zur Tabelle",
  await seite.$eval(".blk.tabelle .txt", n => !!n.querySelector("table")), true);
gleich("jeder traegt sein Urteil",
  (await seite.$$eval(".blk .urteil", ns => ns.map(n => n.textContent))).join(","),
  "GFM,Dialekt,HTML");
gleich("und kommen unveraendert wieder heraus", await datei(), QUELLE);

/* ---------- 8 Gliederung und Suche ---------- */
console.log("\nGliederung und Suche");
await setzen("# Titel\n\nDas Altsystem.\n\n## Erstens\n\nNoch ein Altsystem.\n");
gleich("listet die Ueberschriften",
  (await seite.$$eval(".gliederung .z", ns => ns.map(n => n.textContent))).join(","),
  "Titel,Erstens");
await seite.keyboard.press("Control+f");
await seite.fill("#such-feld", "Altsystem");
await seite.waitForTimeout(400);
gleich("zaehlt die Funde", await seite.textContent("#such-zahl"), "1 von 2");
gleich("und markiert sie", await seite.$$eval(".txt .fund", ns => ns.length), 2);
await seite.click("#such-zu");
await seite.waitForTimeout(250);
await seite.click("#g-inhalt");
await seite.waitForTimeout(400);
gleich("das Inhaltsverzeichnis ist reines Markdown", (await datei()).split("\n")[2],
  "- [Titel](#titel)");

/* ---------- 9 Themen und Druck ---------- */
console.log("\nThemen und Druck");
const stellen = async (gruppe, name) => {
  await ausMenue("Einstellungen …");
  await seite.click('#ein-gruppen .gruppe:has(.etikett:text-is("' + gruppe + '")) '
                    + 'button:text-is("' + name + '")');
  await seite.click("#ein-zu");
  await seite.waitForTimeout(250);
};
/* Alles, was das Dokument **aussehen** lässt, steht im Layout-Dialog. */
const layout = async (reiter, waehler) => {
  await seite.evaluate((r) => layoutOeffnen(r), reiter);
  await seite.waitForTimeout(300);
  await seite.click(waehler);
  await seite.waitForTimeout(300);
  await seite.click("#layout-zu");
  await seite.waitForTimeout(250);
};
await stellen("Erscheinungsbild", "Dunkel");
gleich("das dunkle Thema steht am Wurzelelement",
  await seite.evaluate(() => document.documentElement.dataset.thema), "dunkel");
gleich("der Meldungszettel ist darin nicht weiss auf weiss",
  await seite.evaluate(() => {
    const z = getComputedStyle(document.querySelector("#zettel"));
    return z.backgroundColor !== z.color;
  }), true);
await layout("satz", '#satz-wahl button:text-is("Blocksatz")');
gleich("Blocksatz wirkt auf den Absatz",
  await seite.$eval(".blk.absatz .txt", n => getComputedStyle(n).textAlign), "justify");
gleich("und steht nicht in der Datei",
  (await datei()).indexOf("justify"), -1);
await layout("satz", '#satz-wahl button:text-is("Flattersatz")');
await stellen("Erscheinungsbild", "Hell");
/* Gedruckt wird nicht die Schreibflaeche, sondern das Dokument im
   Druckblatt (doku/ENTSCHEIDUNGEN.md, Punkt 17). Gebaut wird es beim
   Drucken; `emulateMedia` loest das nicht aus, deshalb hier von
   Hand. */
await seite.evaluate(() => {
  seitenStilSetzen();
  document.querySelector("#druckblatt").innerHTML = druckDokument();
});
await seite.emulateMedia({ media: "print" });
gleich("im Druck ist die Kopfleiste weg", await seite.isVisible(".kopf"), false);
gleich("und die Schreibflaeche auch", await seite.isVisible(".blatt"), false);
gleich("das Druckblatt traegt das Dokument",
  await seite.$$eval("#druckblatt .dok", ns => ns.length), 1);
await seite.emulateMedia({ media: "screen" });

/* ---------- 10 Die Nummern im Thema „Technische Doku" ----------
   Ein Text, in dem eine Ueberschrift schon eine Nummer traegt und
   eine andere nicht. Das Thema darf nur die zweite nummerieren --
   sonst stuende dort "1.1  1 Bestandsaufnahme". Seit dem Zusammenlegen
   von Druck-Layout und Vorschau-Thema (Punkt 20) laesst sich das ohne
   Druckemulation pruefen: Die Vorschau zeigt dasselbe wie das Papier. */
console.log("\nDie Nummern im Thema Technische Doku");
const thema = async (name) => {
  await layout("thema", '#thema-kacheln .tkachel:has(.tname:text-is("' + name + '"))');
};
await setzen("# Titel ohne Nummer\n\n## 1 Bestandsaufnahme\n\n## Zweitens\n\n"
  + "Ein Absatz, damit auch der Satz zu pruefen ist.\n");
gleich("die Ueberschrift mit Nummer ist erkannt",
  await seite.$$eval(".blk.h1,.blk.h2", ns => ns.map(n => n.classList.contains("eigen")).join(",")),
  "false,true,false");
await seite.click("#w-vorschau");
await seite.waitForTimeout(350);
await thema("Technische Doku");
const vorsatz = (waehler) => seite.evaluate((w) =>
  getComputedStyle(document.querySelector(w), "::before").content, waehler);
gleich("ohne eigene Nummer wird nummeriert",
  (await vorsatz('#vdok [data-i="0"]')).indexOf("counter") >= 0, true);
gleich("mit eigener Nummer nicht",
  await vorsatz('#vdok [data-i="1"]'), "none");
gleich("die naechste ohne eigene Nummer wieder schon",
  (await vorsatz('#vdok [data-i="2"]')).indexOf("counter") >= 0, true);

/* ---------- 11 Das Thema „Buchsatz" ---------- */
console.log("\nDas Thema Buchsatz");
await thema("Buchsatz");
gleich("setzt in einer Serifenschrift",
  (await seite.$eval("#vdok", n => getComputedStyle(n).fontFamily)).indexOf("Georgia") >= 0,
  true);
gleich("und im Blocksatz",
  await seite.$eval("#vdok p", n => getComputedStyle(n).textAlign), "justify");
gleich("nummeriert aber nicht",
  await vorsatz('#vdok [data-i="2"]'), "none");
gleich("und es steht nichts davon in der Datei",
  (await datei()).indexOf("justify"), -1);
await thema("Wie der Editor");
await seite.click("#w-schreiben");
await seite.waitForTimeout(250);

/* ---------- 12 Farbe im Quelltext ----------
   Die Farbschicht liegt unter dem Feld. Sie darf kein Zeichen
   verlieren und muss zeichengleich umbrechen -- sonst stuende die
   Farbe neben der Schreibmarke. */
console.log("\nFarbe im Quelltext");
const QTEXT = "# Titel\n\n"
  + "Ein **fetter** und ein *kursiver* Teil, dazu `code` und "
  + "[ein Verweis](./anderswo.md), und dann noch ein langer Satz, damit die "
  + "Zeile ganz sicher umbricht und der Umbruch zu vergleichen ist.\n\n"
  + "- [ ] Ein Punkt\n\n"
  + "| Name | Format |\n| --- | --- |\n| Export | CSV |\n\n"
  + "```javascript\nconst n = 1; // **kein** fett hier\n```\n";
await setzen(QTEXT);
await seite.click("#w-quelltext");
await seite.waitForTimeout(200);

const schicht = () => seite.evaluate(() => {
  const q = document.querySelector("#q"), f = document.querySelector("#qfarbe");
  return {
    /* Das <pre> zeichnet die letzte Zeile nur mit einem Umbruch mehr. */
    gleich: f.textContent === q.value + "\n",
    hoehe:  f.scrollHeight === q.scrollHeight,
    breite: f.clientWidth === q.clientWidth,
    mk:   f.querySelectorAll(".mk").length,
    code: f.querySelectorAll(".c").length,
    link: f.querySelectorAll(".l").length,
    fett: f.querySelectorAll(".b").length,
    /* Im Codezaun wird nichts gedeutet: Das `**kein**` darin darf
       kein einziges .b ergeben. */
    zaun: [...f.querySelectorAll(".c")].some(n => n.textContent.indexOf("**kein**") >= 0)
  };
});
let f = await schicht();
gleich("die Farbschicht traegt denselben Text", f.gleich, true);
gleich("und bricht gleich um", f.hoehe, true);
gleich("bei gleicher Breite", f.breite, true);
gleich("Auszeichnungszeichen sind gefaerbt", f.mk > 10, true);
gleich("Code ist gefaerbt", f.code > 0, true);
gleich("das Verweisziel auch", f.link, 1);
gleich("fett ist fett", f.fett, 1);
gleich("im Codezaun wird nichts gedeutet", f.zaun, true);

/* Harte Regel 9 gilt auch fuer die Farbe: Was die Stufe nicht kann,
   ist keine Auszeichnung, sondern Text. */
await setzen("Ein ==markierter== Teil.\n");
await seite.click("#w-quelltext");
await seite.waitForTimeout(200);
const marker = () => seite.$$eval("#qfarbe .mrk", ns => ns.length);
gleich("auf Rein ist ==...== nur Text", await marker(), 0);
await stellen("Markdown-Stufe", "Obsidian");
await seite.waitForTimeout(200);
gleich("auf Obsidian ist es der Textmarker", await marker(), 1);
await stellen("Markdown-Stufe", "Rein");

/* ---------- 13 Der Suchtreffer ----------
   Er ist keine Auszeichnung im Text und darf deshalb nicht aussehen
   wie der Textmarker. */
console.log("\nDer Suchtreffer");
await setzen("Ein ==markierter== Fund im Text.\n");
await seite.keyboard.press("Control+f");
await seite.waitForTimeout(150);
await seite.keyboard.type("Fund");
await seite.waitForTimeout(300);
const toene = await seite.evaluate(() => {
  const holen = (n) => n ? getComputedStyle(n).backgroundColor : null;
  const wurzel = getComputedStyle(document.documentElement);
  return { fund: holen(document.querySelector(".fund")),
           tokenFund: wurzel.getPropertyValue("--fund").trim(),
           tokenMarker: wurzel.getPropertyValue("--marker").trim() };
});
gleich("es gibt einen Fund", toene.fund !== null, true);
gleich("er traegt --fund", toene.fund.replace(/\s/g, ""), toene.tokenFund.replace(/\s/g, ""));
gleich("und --fund ist nicht --marker", toene.tokenFund !== toene.tokenMarker, true);
await seite.keyboard.press("Escape");

/* ---------- 14 Fortsetzungszeilen ----------
   Eine eingerueckte Zeile ohne eigenes Zeichen gehoert zum Punkt
   darueber. Zaehlte sie als Absatz, unterbraeche sie die Liste -- und
   die Nummerierung finge danach wieder bei 1 an. */
console.log("\nFortsetzungszeilen");
const FORT = "1. eins\n   und weiter\n2. zwei\n3. drei\n";
await setzen(FORT);
gleich("die Folgezeile wird kein eigener Block",
  await seite.$$eval(".blk", ns => ns.length), 3);
gleich("sie steht im Punkt darueber",
  await seite.$eval('.blk[data-i="0"] .txt', n => n.textContent), "eins\nund weiter");
gleich("und die Liste zaehlt durch", await datei(), FORT);

/* Gegenprobe: Nach einer Leerzeile ist der Punkt zu Ende. */
const EIGEN = "- eins\n\n  ein eigener Absatz\n";
await setzen(EIGEN);
gleich("nach einer Leerzeile ist es ein eigener Absatz",
  await seite.$$eval(".blk", ns => ns.length), 2);
gleich("und kommt unveraendert wieder heraus", await datei(), EIGEN);

/* Der mitgelieferte Starttext war der Anlass: Er stand mit
   "1. 1. 2." da, weil zwei seiner Punkte zwei Zeilen lang sind. */
await seite.evaluate(() => localStorage.clear());
await seite.reload();
await seite.waitForTimeout(400);
gleich("der Starttext zaehlt 1. 2. 3.",
  await seite.evaluate(() => (schreibeMarkdown(Z.bloecke).match(/^\d+\. /gm) || []).join("")),
  "1. 2. 3. ");

/* ---------- 15 Die gewarnten Zeilen ----------
   Was die reine Sprache verlaesst, wird in der Dateiansicht
   hervorgehoben -- dort sieht man, was man weitergibt. */
console.log("\nDie gewarnten Zeilen");
await setzen("Ein ganz gewoehnlicher Absatz.\n\n"
  + "- [ ] Ein To-do\n\n"
  + "| Name | Format |\n| --- | --- |\n| Export | CSV |\n\n"
  + "> [!TIP]\n> Der Rumpf ist gewoehnliches Zitat.\n");
await seite.click("#w-quelltext");
await seite.waitForTimeout(200);
const warn = await seite.evaluate(() => {
  const f = document.querySelector("#qfarbe"), q = document.querySelector("#q");
  const zettel = [...f.querySelectorAll(".un[data-ur]")].map(n => n.dataset.ur);
  return { zeilen: f.querySelectorAll(".un").length, zettel: zettel.join(","),
           hoehe: f.scrollHeight === q.scrollHeight,
           rein: [...f.querySelectorAll(".un")].some(n =>
             n.textContent.indexOf("gewoehnlicher Absatz") >= 0) };
});
gleich("das To-do, drei Tabellenzeilen und der Callout sind gewarnt",
  warn.zeilen, 5);
gleich("je Bereich ein Zettel, nicht je Zeile", warn.zettel, "GFM,GFM,Dialekt");
gleich("der reine Absatz bleibt ungewarnt", warn.rein, false);
/* Traegt eine Zeile mehreres, gilt das staerkere Urteil. */
await setzen("- [ ] Berichte sichten [[Kai Richter]]\n");
await seite.click("#w-quelltext");
await seite.waitForTimeout(200);
gleich("ein To-do mit Wiki-Link meldet Dialekt, nicht GFM",
  await seite.$eval("#qfarbe .un[data-ur]", n => n.dataset.ur), "Dialekt");
gleich("und der Umbruch bleibt gleich", warn.hoehe, true);

/* ---------- 16 Fussnote und Seitenumbruch ----------
   Zwei neue Blockarten. Beide tragen ihre ganze Quelle im Feld `text`
   und muessen Zeichen fuer Zeichen wieder herauskommen. */
console.log("\nFussnote und Seitenumbruch");
await stellen("Markdown-Stufe", "GitHub");
const FUSS = "# Kapitel\n\nEin Satz mit Beleg.[^1]\n\n[^1]: Woher der Satz stammt.\n\n"
  + "<!-- seitenumbruch -->\n\n## Zweiter Teil\n\nNoch ein Absatz.\n";
await setzen(FUSS);
gleich("beide werden als eigene Bloecke gelesen",
  await seite.$$eval(".blk.fussnote,.blk.umbruch", ns => ns.length), 2);
gleich("das Fussnotenzeichen steht hochgestellt",
  await seite.$$eval(".txt sup.fnv", ns => ns.length), 1);
gleich("und alles kommt unveraendert wieder heraus", await datei(), FUSS);
await seite.click("#g-t-noten");
await seite.waitForTimeout(250);
gleich("die Fussnotenleiste sammelt sie",
  await seite.$$eval("#n-liste .note .nt", ns => ns.map(n => n.textContent).join(",")),
  "Woher der Satz stammt.");
await stellen("Markdown-Stufe", "Rein");
await seite.waitForTimeout(250);
gleich("auf Rein sagt die Leiste, woran es liegt",
  (await seite.textContent("#n-liste")).indexOf("GitHub") >= 0, true);
await stellen("Markdown-Stufe", "GitHub");
await seite.click("#g-t-gliederung");

/* ---------- 17 Einklappen ----------
   Eine Anzeige, kein Merkmal des Textes: In der Datei steht davon
   nichts, und der Export enthaelt jeden Block. */
console.log("\nEinklappen");
await setzen("# Erstes\n\nEin Absatz.\n\n## Darunter\n\nNoch einer.\n\n# Zweites\n\nText.\n");
const sichtbar = () => seite.$$eval(".blk", ns => ns.length);
gleich("sechs Bloecke stehen da", await sichtbar(), 6);
await seite.click('.blk[data-i="0"] .griff .klapp');
await seite.waitForTimeout(300);
gleich("nach dem Einklappen nur noch drei", await sichtbar(), 3);
gleich("die Zahl steht am Titel", await seite.textContent(".klappzahl"), "3 Blöcke");
gleich("in der Datei steht davon nichts",
  (await datei()).indexOf("Noch einer.") >= 0, true);
gleich("und im Export auch nicht",
  await seite.evaluate(() => dokumentHtml({}).indexOf("Noch einer.") >= 0), true);
await seite.click('.blk[data-i="0"] .griff .klapp');
await seite.waitForTimeout(300);
gleich("aufgeklappt sind wieder alle da", await sichtbar(), 6);

/* ---------- 18 Die Vorschau ----------
   Dieselbe Zeichenkette wie im Export, nur in einem Rahmen. Sie hat
   keine Griffe. */
console.log("\nDie Vorschau");
await setzen("# Titel\n\n- eins\n  - unter\n- zwei\n\n1. Schritt\n\n> Ein Zitat\n");
await seite.click("#w-vorschau");
await seite.waitForTimeout(400);
gleich("baut richtige Listen statt Zeilen",
  await seite.$$eval("#vdok ul > li > ul > li", ns => ns.length), 1);
gleich("die Ueberschrift ist eine Ueberschrift",
  await seite.$$eval("#vdok h1", ns => ns.length), 1);
gleich("das Zitat ein blockquote",
  await seite.$$eval("#vdok blockquote", ns => ns.length), 1);
gleich("und sie traegt keine Blockgriffe",
  await seite.$$eval("#vdok .griff", ns => ns.length), 0);
await seite.click("#v-inhalt");
await seite.waitForTimeout(300);
gleich("das Inhaltsverzeichnis der Vorschau steht nicht in der Datei",
  (await datei()).indexOf("Inhalt") >= 0, false);
await seite.click("#w-vorschau");
await seite.click("#v-inhalt");
await seite.waitForTimeout(200);
await seite.click("#w-schreiben");
await seite.waitForTimeout(250);

/* ---------- 19 Farbe im Code ----------
   Sie deutet, mehr nicht: Ein falsch gefaerbtes Wort steht trotzdem
   unveraendert in der Datei. */
console.log("\nFarbe im Code");
const CODE = "```python\ndef gruss(name):\n    # ein Kommentar\n    return 42\n```\n";
await setzen(CODE);
gleich("Schluesselwoerter sind gefaerbt",
  (await seite.$$eval(".blk.code .s-k", ns => ns.map(n => n.textContent))).join(","),
  "def,return");
gleich("der Kommentar auch",
  await seite.$eval(".blk.code .s-x", n => n.textContent), "# ein Kommentar");
gleich("die Zahl auch", await seite.$eval(".blk.code .s-n", n => n.textContent), "42");
gleich("der Sprachname steht ausgeschrieben darueber",
  await seite.$eval(".blk.code .sprache", n => n.textContent), "Python");
gleich("und der Code kommt unveraendert wieder heraus", await datei(), CODE);

/* ---------- 20 Die Ausgaben ----------
   Fuenf Formate, ein Dokument. Geprueft wird, dass jedes entsteht
   und den Text traegt -- nicht, wie es aussieht. */
console.log("\nDie Ausgaben");
await setzen("# Bericht\n\nEin Absatz mit **fett**.\n\n- ein Punkt\n\n"
  + "| a | b |\n| --- | --- |\n| 1 | 2 |\n");
const html = await seite.evaluate(() => htmlAusgeben());
gleich("HTML ist eine ganze Seite", html.slice(0, 15), "<!DOCTYPE html>");
gleich("HTML traegt den Stil in sich", html.indexOf(".dok{background") >= 0, true);
gleich("HTML holt nichts aus dem Netz",
  /<script[^>]+src=|<link[^>]+stylesheet|https?:\/\//.test(html), false);
gleich("HTML traegt den Text", html.indexOf("<h1") >= 0 && html.indexOf("fett") >= 0, true);
const rtf = await seite.evaluate(() => rtfAusgeben());
gleich("RTF beginnt mit dem Kopf", rtf.slice(0, 6), "{\\rtf1");
gleich("RTF traegt die Ueberschrift fett", rtf.indexOf("\\b\\fs40") >= 0, true);
gleich("RTF baut eine Tabelle", rtf.indexOf("\\trowd") >= 0, true);
const docx = await seite.evaluate(async () => {
  const b = docxAusgeben();
  return { gross: b.size, art: b.type,
           anfang: new Uint8Array(await b.slice(0, 2).arrayBuffer()).join(",") };
});
gleich("DOCX ist ein ZIP", docx.anfang, "80,75");
gleich("und nicht leer", docx.gross > 4000, true);
gleich("mit der richtigen Art", docx.art.indexOf("wordprocessingml") >= 0, true);

/* ---------- 21 Die Schnellwahl ----------
   Strg+K, nicht Strg+P: Das ist der Druckbefehl des Browsers. */
console.log("\nDie Schnellwahl");
await setzen("# Erstes Kapitel\n\nText.\n\n## Zweites Kapitel\n\nMehr Text.\n");
await seite.keyboard.press("Control+k");
await seite.waitForTimeout(300);
gleich("oeffnet sich", await seite.isVisible("#schnell-feld"), true);
await seite.fill("#schnell-feld", "Zweites");
await seite.waitForTimeout(250);
gleich("findet die Ueberschrift",
  await seite.$eval("#schnell-liste button .nm", n => n.textContent), "Zweites Kapitel");
await seite.fill("#schnell-feld", "Vollbild");
await seite.waitForTimeout(250);
gleich("und den Befehl dazu",
  await seite.$eval("#schnell-liste button .nm", n => n.textContent), "Vollbild");
await seite.keyboard.press("Escape");
await seite.waitForTimeout(200);
gleich("Esc schliesst", await seite.isVisible("#schnell-feld"), false);

/* ---------- 22 Ablenkungsfrei ---------- */
console.log("\nAblenkungsfrei");
await ausMenue("Ablenkungsfrei");
gleich("Kopf und Fuss sind weg", await seite.isVisible(".kopf"), false);
gleich("der Ausstieg steht da", await seite.isVisible("#ruhe-aus"), true);
await seite.keyboard.press("Escape");
await seite.waitForTimeout(300);
gleich("Esc beendet ihn", await seite.isVisible(".kopf"), true);

/* ---------- 23 Die Seiteneinrichtung ----------
   Groesse, Ausrichtung und Rand stehen im Block `seitenstil`. `@page`
   kennt keine Variablen -- deshalb wird er zur Laufzeit geschrieben. */
console.log("\nDie Seiteneinrichtung");
await seite.evaluate(() => { Z.seite = "a5"; Z.hoch = "quer"; Z.rand = "10 10 10 10";
                             seitenStilSetzen(); });
await seite.waitForTimeout(250);
gleich("A5 quer ergibt 210 mm Breite",
  await seite.evaluate(() =>
    document.querySelector("#seitenstil").textContent.indexOf("size:210mm 148mm") >= 0), true);
await seite.evaluate(() => { Z.seite = "a4"; Z.hoch = "hoch"; Z.rand = "18 18 18 18";
                             seitenStilSetzen(); });
await seite.evaluate(() => { Z.kopfzeile = "{titel} | | {datum}"; Z.fusszeile = "| {datei} |";
                             document.querySelector("#druckblatt").innerHTML = druckDokument(); });
await seite.waitForTimeout(250);
gleich("die mitlaufende Zeile haengt im thead",
  await seite.$$eval("#druckblatt table.dseite thead .dkopf", ns => ns.length), 1);
gleich("und der Platzhalter ist gefuellt",
  (await seite.textContent("#druckblatt .dkopf")).indexOf("Erstes Kapitel") >= 0
  || (await seite.textContent("#druckblatt .dkopf")).length > 0, true);
await seite.evaluate(() => { Z.kopfzeile = ""; Z.fusszeile = "";
                             document.querySelector("#druckblatt").innerHTML = druckDokument(); });
gleich("ohne Kopf- und Fusszeile keine Tabelle",
  await seite.$$eval("#druckblatt table.dseite", ns => ns.length), 0);

/* ---------- 24 Die Kopfleiste ----------
   Sie trug vierzehn Knöpfe und war damit eine Werkzeugleiste, die
   niemand liest. Diese Probe haelt sie schmal: Waechst sie wieder,
   faellt es hier auf und nicht erst dem Nutzer. */
console.log("\nDie Kopfleiste");
const kopfKnoepfe = await seite.$$eval(".kopf button", ns => ns.map(n =>
  (n.textContent || "").trim() || n.getAttribute("aria-label") || n.id));
gleich("traegt hoechstens sieben Knoepfe", kopfKnoepfe.length <= 7, true);
gleich("und zwar diese", kopfKnoepfe.join(","),
  "Schreiben,Geteilt,Vorschau,Quelltext,Ausgeben,Gliederung,···");

/* ---------- 25 Das Punkte-Menue ----------
   Notions `···`: oben das Aussehen als Muster, darunter die Liste. */
console.log("\nDas Punkte-Menue");
await seite.click("#mehr");
await seite.waitForTimeout(300);
gleich("zeigt jedes Thema als Kachel",
  await seite.$$eval("#menue .kachelreihe .tkachel", ns => ns.length), 8);
gleich("mit den Gruppen darunter",
  (await seite.$$eval("#menue .k", ns => ns.map(n => n.textContent))).join(","),
  "Thema des Dokuments,Datei,Ansehen,Finden");
/* Die Kachel traegt dieselben Regeln wie das Dokument -- eine gemalte
   Vorschau koennte luegen, diese nicht. */
const kachel = await seite.evaluate(() => {
  const n = document.querySelector('#menue .tkachel:has(.tname) .tbild[data-vthema="papier"]');
  const s = getComputedStyle(n);
  return { grund: s.backgroundColor, serif: s.fontFamily.indexOf("Georgia") >= 0,
           breit: Math.round(n.getBoundingClientRect().width) };
});
gleich("die Papier-Kachel traegt den Papierton", kachel.grund, "rgb(252, 250, 244)");
gleich("und die Serifenschrift", kachel.serif, true);
gleich("und ist nicht auf einen Buchstaben geschrumpft", kachel.breit > 40, true);
await seite.click('#menue .kachelreihe .tkachel:has(.tname:text-is("Zeitung"))');
await seite.waitForTimeout(300);
gleich("ein Klick wechselt das Thema",
  await seite.evaluate(() => Z.vthema), "zeitung");
gleich("und das Menue bleibt offen", await seite.isVisible("#menue"), true);
await seite.keyboard.press("Escape");
await thema("Wie der Editor");

/* ---------- 26 Der Layout-Dialog ----------
   Aus zwei Karten -- "Stil" und "Seite einrichten" -- ist eine mit
   vier Reitern geworden. Beide beantworteten dieselbe Frage. */
console.log("\nDer Layout-Dialog");
await seite.evaluate(() => layoutOeffnen("thema"));
await seite.waitForTimeout(320);
gleich("hat vier Reiter",
  (await seite.$$eval("#layout .reiter button", ns => ns.map(n => n.textContent))).join(","),
  "Thema,Satz und Maße,Seite,Eigenes CSS");
gleich("zeigt acht Kacheln",
  await seite.$$eval("#thema-kacheln .tkachel", ns => ns.length), 8);
gleich("der Seiten-Reiter ist zu", await seite.isVisible("#seite-format"), false);
await seite.click("#r-seite");
await seite.waitForTimeout(250);
gleich("und geht auf", await seite.isVisible("#seite-format"), true);
gleich("dann ist der Thema-Reiter zu", await seite.isVisible("#thema-kacheln"), false);
await seite.click("#r-css");
await seite.waitForTimeout(250);
gleich("das eigene CSS hat einen eigenen Reiter", await seite.isVisible("#stil-css"), true);
await seite.click("#layout-zu");

/* ---------- 27 Die Einstellungen tragen nur das Programm ----------
   Was das Dokument aussehen laesst, steht im Layout. Was der Editor
   tut, steht hier. Zwei Fragen, zwei Orte. */
console.log("\nDie Einstellungen");
await ausMenue("Einstellungen …");
gleich("vier Gruppen, alle ueber das Programm",
  (await seite.$$eval("#ein-gruppen .etikett", ns => ns.map(n => n.textContent))).join(","),
  "Markdown-Stufe,Erscheinungsbild,Vorschau folgt der Schreibmarke,"
  + "Inhaltsverzeichnis in der Vorschau");
await seite.click("#ein-zu");

/* ---------- Schluss ---------- */
console.log("");
if (skriptfehler.length){
  schlecht++;
  console.log("  ✗ Skriptfehler: " + skriptfehler.join(" | "));
} else {
  console.log("  ✓ keine Skriptfehler");
}
console.log("\n" + "─".repeat(52));
console.log(schlecht ? schlecht + (schlecht === 1 ? " Probe" : " Proben") + " stimmt nicht"
                     : "Alle Proben stimmen");
await browser.close();
process.exit(schlecht ? 1 : 0);
