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
const stufe = async (name) => {
  await seite.click("#ein-auf");
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
  await seite.click("#ein-auf");
  await seite.click('#ein-gruppen .gruppe:has(.etikett:text-is("' + gruppe + '")) '
                    + 'button:text-is("' + name + '")');
  await seite.click("#ein-zu");
  await seite.waitForTimeout(250);
};
await stellen("Thema", "Dunkel");
gleich("das dunkle Thema steht am Wurzelelement",
  await seite.evaluate(() => document.documentElement.dataset.thema), "dunkel");
gleich("der Meldungszettel ist darin nicht weiss auf weiss",
  await seite.evaluate(() => {
    const z = getComputedStyle(document.querySelector("#zettel"));
    return z.backgroundColor !== z.color;
  }), true);
await stellen("Textausrichtung", "Blocksatz");
gleich("Blocksatz wirkt auf den Absatz",
  await seite.$eval(".blk.absatz .txt", n => getComputedStyle(n).textAlign), "justify");
gleich("und steht nicht in der Datei",
  (await datei()).indexOf("justify"), -1);
await stellen("Thema", "Hell");
await seite.emulateMedia({ media: "print" });
gleich("im Druck ist die Kopfleiste weg", await seite.isVisible(".kopf"), false);
gleich("und das Blatt noch da", await seite.isVisible(".blatt"), true);
await seite.emulateMedia({ media: "screen" });

/* ---------- 10 Die Nummern im Technik-Layout ----------
   Ein Text, in dem eine Ueberschrift schon eine Nummer traegt und
   eine andere nicht. Das Layout darf nur die zweite nummerieren --
   sonst stuende dort "1.1  1 Bestandsaufnahme". */
console.log("\nDie Nummern im Technik-Layout");
await setzen("# Titel ohne Nummer\n\n## 1 Bestandsaufnahme\n\n## Zweitens\n\n"
  + "Ein Absatz, damit auch der Satz zu pruefen ist.\n");
gleich("die Ueberschrift mit Nummer ist erkannt",
  await seite.$$eval(".blk.h1,.blk.h2", ns => ns.map(n => n.classList.contains("eigen")).join(",")),
  "false,true,false");
await stellen("Druck-Layout", "Technische Doku");
await seite.emulateMedia({ media: "print" });
const vorsatz = (waehler) => seite.evaluate((w) =>
  getComputedStyle(document.querySelector(w + " .txt"), "::before").content, waehler);
gleich("ohne eigene Nummer wird nummeriert",
  (await vorsatz('.blk[data-i="0"]')).indexOf("counter") >= 0, true);
gleich("mit eigener Nummer nicht",
  await vorsatz('.blk[data-i="1"]'), "none");
gleich("die naechste ohne eigene Nummer wieder schon",
  (await vorsatz('.blk[data-i="2"]')).indexOf("counter") >= 0, true);
await seite.emulateMedia({ media: "screen" });

/* ---------- 11 Das Magazin-Layout ---------- */
console.log("\nDas Magazin-Layout");
await stellen("Druck-Layout", "Magazin");
await seite.emulateMedia({ media: "print" });
gleich("setzt in einer Serifenschrift",
  (await seite.$eval(".blatt", n => getComputedStyle(n).fontFamily)).indexOf("Georgia") >= 0,
  true);
gleich("und im Blocksatz",
  await seite.$eval(".blk.absatz .txt", n => getComputedStyle(n).textAlign), "justify");
gleich("nummeriert aber nicht",
  await vorsatz('.blk[data-i="2"]'), "none");
await seite.emulateMedia({ media: "screen" });
await stellen("Druck-Layout", "Schlicht");

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
