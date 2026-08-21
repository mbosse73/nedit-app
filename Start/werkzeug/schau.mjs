/* ============================================================
   Hinsehen, automatisch

   Der Pruefzhlauf sagt nichts ueber die Darstellung. Dieses Werkzeug
   oeffnet editor.html in einem echten Browser, klappert die drei
   Ansichten ab, tippt ein wenig, legt Bilder ab und meldet jeden
   Skriptfehler.

   Es ist ein Hilfsmittel fuer die Werkbank, kein Teil der Anwendung.
   Die Regel "keine Abhaengigkeiten" gilt fuer editor.html; hier wird
   Playwright benutzt, wenn es da ist, und sonst sauber abgebrochen.

   Aufruf:
     node werkzeug/schau.mjs
     node werkzeug/schau.mjs --bilder /tmp/schau
     node werkzeug/schau.mjs --breit 1280

   Rueckgabewert 1, sobald etwas nicht stimmt.
   ============================================================ */
import { createRequire } from "node:module";
import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function hole(name){
  for (const wo of ["/opt/node22/lib/node_modules/", process.cwd() + "/"]) {
    try { return createRequire(wo)(name); } catch { /* weitersuchen */ }
  }
  return null;
}
const pw = hole("playwright");
if (!pw) {
  console.error("Playwright ist hier nicht vorhanden.");
  console.error("Dann von Hand ansehen: editor.html im Browser oeffnen.");
  process.exit(2);
}

const arg = (n, vor) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i+1] : vor; };
const datei  = resolve(arg("-d", "editor.html"));
const ablage = resolve(arg("--bilder", "/tmp/schau-editor"));
const breit  = Number(arg("--breit", "1400"));
if (!existsSync(datei)) { console.error("Nicht gefunden: " + datei); process.exit(1); }
mkdirSync(ablage, { recursive: true });

const ANSICHTEN = ["schreiben", "geteilt", "vorschau", "quelltext"];
let fehler = 0;

const browser = await pw.chromium.launch();
const seite = await browser.newPage({ viewport: { width: breit, height: 900 } });
const meldungen = [];
seite.on("pageerror", (e) => meldungen.push("SKRIPT: " + e.message));
seite.on("console", (m) => { if (m.type() === "error") meldungen.push("KONSOLE: " + m.text()); });

await seite.goto("file://" + datei);
await seite.waitForTimeout(250);

for (const a of ANSICHTEN) {
  await seite.evaluate((n) => document.querySelector("#w-" + n).click(), a);
  await seite.waitForTimeout(160);

  const mass = await seite.evaluate(() => ({
    quer: document.documentElement.scrollWidth > window.innerWidth + 1,
    /* Eine Flaeche, die im Dunkelmodus schwarz bliebe, faellt hier auf. */
    dunkel: [...document.querySelectorAll(".app,.kopf,.blatt,.quelle,.fuss,.vorschau,.vblatt")]
      .filter((n) => {
        const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
        if (!m) return false;
        return (+m[0] + +m[1] + +m[2]) / 3 < 90 && (m[3] === undefined || +m[3] > 0.5);
      }).map((n) => n.className),
    /* Nichts darf ausserhalb des Fensters und ohne rollbaren Vorfahren
       liegen — das ist die schaerfere Frage als "gibt es Querlauf". */
    unerreichbar: [...document.querySelectorAll(".blk,.kopf button,.fuss span")]
      .filter((n) => {
        const r = n.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        if (r.right <= window.innerWidth + 1 && r.left >= -1) return false;
        let p = n.parentElement;
        while (p) { if (getComputedStyle(p).overflowX !== "visible") return false; p = p.parentElement; }
        return true;
      }).length,
    text: document.body.innerText.trim().length
  }));

  const schlimm = mass.quer || mass.dunkel.length || mass.unerreichbar || mass.text < 60;
  if (schlimm) fehler++;
  console.log((schlimm ? "  x " : "  + ") + a.padEnd(12)
    + (mass.quer ? " QUERLAUF" : "")
    + (mass.dunkel.length ? " DUNKEL: " + mass.dunkel.join(", ") : "")
    + (mass.unerreichbar ? " " + mass.unerreichbar + " UNERREICHBAR" : "")
    + (mass.text < 60 ? " FAST LEER" : "")
    + (schlimm ? "" : " in Ordnung"));

  await seite.screenshot({ path: ablage + "/" + a + ".png", fullPage: false });
}

/* Die Druckvorschau ist keine Ansicht, sondern ein eigener Rahmen —
   und sie muss dasselbe zeigen wie das Papier. */
await seite.evaluate(() => { druckvorschau(true); });
await seite.waitForTimeout(220);
const seitenmass = await seite.evaluate(() => {
  const n = document.querySelector("#druckblatt");
  return { breite: Math.round(n.getBoundingClientRect().width),
           dok: n.querySelectorAll(".dok").length };
});
if (seitenmass.dok !== 1 || seitenmass.breite < 700 || seitenmass.breite > 800){
  console.log("  x druckvorschau  " + JSON.stringify(seitenmass)); fehler++;
} else console.log("  + druckvorschau in Ordnung ("
  + seitenmass.breite + " px = A4-Breite)");
await seite.screenshot({ path: ablage + "/druckvorschau.png", fullPage: false });
await seite.evaluate(() => { druckvorschau(false); });
await seite.waitForTimeout(150);

/* Tippen: Was sich nicht bedienen laesst, nuetzt kein schoenes Bild. */
await seite.evaluate(() => document.querySelector("#w-schreiben").click());
await seite.waitForTimeout(120);
await seite.locator(".blk .txt").first().click();
await seite.keyboard.press("End");
await seite.keyboard.press("Enter");
await seite.keyboard.type("## Probe");
await seite.waitForTimeout(140);
const arten = await seite.evaluate(() => Z.bloecke.map((b) => b.art));
if (arten.indexOf("h2") < 0) { console.log("  x tippen        Eingabehilfe blieb aus"); fehler++; }
else console.log("  + tippen       Eingabehilfe greift");

if (meldungen.length) {
  console.log("\n  Skriptfehler:");
  meldungen.forEach((m) => console.log("   " + m));
  fehler += meldungen.length;
}

await browser.close();
console.log("\n  Bilder: " + ablage);
console.log(fehler ? "  " + fehler + " Punkt(e) offen\n" : "  alles in Ordnung\n");
process.exit(fehler ? 1 : 0);
