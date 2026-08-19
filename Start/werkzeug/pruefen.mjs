/* ============================================================
   Prüfung der Regeln aus CLAUDE.md

   Aufruf:  node werkzeug/pruefen.mjs
   Läuft unter Windows, Linux und in Claude Code on the web.
   Keine Abhängigkeiten, kein npm install.

   Rückgabewert 0 = alles in Ordnung, 1 = mindestens ein Fehler.

   Der Prüflauf sagt nichts über die Darstellung. Danach die Datei im
   Browser öffnen und die geänderte Stelle ansehen — oder
   `node werkzeug/schau.mjs` laufen lassen.
   ============================================================ */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import vm from "node:vm";

const DATEI = "editor.html";

let fehler = 0, warnungen = 0;
const ok   = (t) => console.log("  ✓ " + t);
const bad  = (t) => { console.log("  ✗ " + t); fehler++; };
const warn = (t) => { console.log("  ! " + t); warnungen++; };

/* Der Skriptteil wird von hinten aufgetrennt: Steht das öffnende Tag
   irgendwo vorher wörtlich im Text — in einem Kommentar etwa —, begänne
   der Ausschnitt sonst dort, und der Syntaxcheck läse Prosa als Code. */
function teile(html){
  const c  = html.match(/<style>([\s\S]*?)<\/style>/);
  const zu = html.lastIndexOf("</scr" + "ipt>");
  const auf = zu < 0 ? -1 : html.lastIndexOf("<scr" + "ipt>", zu);
  return { js: auf < 0 ? "" : html.slice(auf + 8, zu), css: c ? c[1] : "" };
}

if (!existsSync(DATEI)){
  console.log("\n  ✗ " + DATEI + " fehlt. Ein Prüflauf, der nichts geprüft hat,");
  console.log("    ist schlimmer als keiner.\n");
  process.exit(1);
}
const html = readFileSync(DATEI, "utf8");
const { js, css } = teile(html);

console.log("\n" + DATEI + " — " + html.split("\n").length + " Zeilen\n");

/* ---------- 1 Syntax ---------- */
if (!js.trim()) bad("kein Skript gefunden");
else {
  try { new vm.Script(js, { filename: DATEI }); ok("Syntax"); }
  catch (e){ bad("Syntaxfehler — " + e.message); }
}

/* ---------- 2 Keine externen Abhängigkeiten ----------
   Die Datei muss per Doppelklick laufen, ohne Netz und ohne Server. */
const MUSTER = [
  [/<script[^>]+\ssrc=/i,               "<script src>"],
  [/<link[^>]+rel=["']?stylesheet/i,    "<link stylesheet>"],
  [/@import\s/i,                        "@import"],
  [/https?:\/\/cdn\./i,                 "CDN-Adresse"],
  [/\bfetch\s*\(/,                      "fetch()"],
  [/new\s+XMLHttpRequest/,              "XMLHttpRequest"],
  [/@font-face/i,                       "@font-face"],
  [/\bimport\s+.*\bfrom\s+["']/,        "import aus einem Modul"]
];
const extern = MUSTER.filter(([re]) => re.test(html)).map(([, was]) => was);
if (extern.length) bad("externe Abhängigkeit — " + extern.join(", "));
else ok("keine externen Abhängigkeiten");

/* ---------- 3 Keine gefüllten Zeichen als Symbol ----------
   U+2580–U+259F Blockelemente, U+25A0–U+25FF geometrische Formen.
   Keines davon eignet sich als Symbol; sie rendern als dunkle Flächen.
   U+2022 BULLET ist ausgenommen: Er ist ein Satzzeichen und steht als
   Listenpunkt genau dafür, wofür er gedacht ist. */
const EXTRA = "⚑⚐⬛⬜⚫⚪★☆";
const schlecht = new Set();
for (const c of html){
  const p = c.codePointAt(0);
  if ((p >= 0x2580 && p <= 0x25ff) || EXTRA.includes(c)) schlecht.add(c);
}
if (schlecht.size)
  bad("gefüllte Zeichen als Symbol — " + [...schlecht].join(" ") + "  (Inline-SVG verwenden)");
else ok("keine gefüllten Zeichen");

/* ---------- 4 Farbschema ---------- */
if (/color-scheme\s*:\s*light/.test(css)) ok("color-scheme gesetzt");
else bad("color-scheme: light fehlt — der Dunkelmodus färbt sonst selbst ein");

/* ---------- 5 Klammern im Stilblock ----------
   Eine fehlende schließende Klammer fällt nirgends auf: Der Browser
   verwirft still den Rest des Stilblocks, und die Seite steht ohne
   Gestaltung da. */
{
  const ohne = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let tiefe = 0, schief = false;
  for (const c of ohne){
    if (c === "{") tiefe++;
    else if (c === "}"){ tiefe--; if (tiefe < 0){ schief = true; break; } }
  }
  if (schief) bad("eine } zu viel im Stilblock");
  else if (tiefe !== 0) bad(tiefe + " Klammer(n) im Stilblock nicht geschlossen");
  else ok("Klammern im Stilblock paarig");
}

/* ---------- 6 display gehört nicht in eine ID-Regel ----------
   #x{display:flex} schlägt .x.aktiv{display:block} und bricht jedes
   Umschalten. */
{
  const treffer = [...css.matchAll(/#[\w-]+\s*\{[^}]*\bdisplay\s*:/g)].map(m => m[0].slice(0, 34));
  if (treffer.length) bad("display in ID-Regel — " + treffer.join(" | "));
  else ok("kein display in ID-Regeln");
}

/* ---------- 7 Jede Fläche bemalt sich selbst ----------
   Sich auf `body` zu verlassen genügt nicht: Im Dunkelmodus bleibt
   sonst eine Fläche schwarz, und der Prüflauf sieht nichts davon. */
{
  const fehlend = [];
  if (!/html\s*,\s*body\s*\{[^}]*background[^}]*!important/.test(css))
    fehlend.push("html,body ohne !important-Hintergrund");
  [".app", ".blatt", ".kopf", ".fuss", ".quelle"].forEach(k => {
    const re = new RegExp("\\" + k + "\\s*\\{[^}]*background");
    if (!re.test(css)) fehlend.push(k);
  });
  if (fehlend.length) bad("Fläche ohne eigenen Hintergrund — " + fehlend.join(", "));
  else ok("Flächen bemalt");
}

/* ---------- 8 Kontrast ----------
   Tragender Text mindestens 4,5 : 1, große Schrift mindestens 3 : 1.
   Gerechnet wird gegen den Blattgrund, mit Alpha aufgelöst. */
function tokenWert(name){
  const m = css.match(new RegExp("--" + name + "\\s*:\\s*([^;]+);"));
  return m ? m[1].trim() : null;
}
function farbe(s){
  if (!s) return null;
  let m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) return [parseInt(m[1].slice(0,2),16), parseInt(m[1].slice(2,4),16),
                 parseInt(m[1].slice(4,6),16), 1];
  m = s.match(/rgba?\(([^)]+)\)/i);
  if (!m) return null;
  const t = m[1].split(",").map(x => parseFloat(x.trim()));
  return [t[0], t[1], t[2], t.length > 3 ? t[3] : 1];
}
function ueber(vorn, hinten){
  const a = vorn[3];
  return [0,1,2].map(i => vorn[i] * a + hinten[i] * (1 - a)).concat(1);
}
function helligkeit(c){
  const f = c.slice(0,3).map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
  return 0.2126*f[0] + 0.7152*f[1] + 0.0722*f[2];
}
function verhaeltnis(a, b){
  const l1 = helligkeit(a), l2 = helligkeit(b);
  return (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
}
{
  const grund = farbe(tokenWert("grund"));
  const paare = [["tinte", 4.5], ["tinte2", 4.5], ["tinte3", 3.0], ["blau", 3.0],
                 ["rot", 4.5]];
  const schwach = [];
  if (!grund) warn("Token --grund nicht gefunden, Kontrast nicht geprüft");
  else paare.forEach(([name, soll]) => {
    const c = farbe(tokenWert(name));
    if (!c){ warn("Token --" + name + " nicht gefunden"); return; }
    const v = verhaeltnis(ueber(c, grund), grund);
    if (v < soll) schwach.push("--" + name + " " + v.toFixed(2) + " : 1 (mindestens " + soll + ")");
  });
  if (schwach.length) bad("Kontrast zu schwach — " + schwach.join(", "));
  else ok("Kontrast — " + paare.length + " Tokens über der Schwelle");
}

/* ---------- 9 Markdown: hin und zurück ----------
   Die tragende Regel dieser Anwendung: `lesen(schreiben(x))` muss `x`
   ergeben. Sie wird hier ohne Browser geprüft — die beiden Funktionen
   werden aus dem Abschnitt 4 herausgeschnitten und in einer Sandbox
   ausgeführt. Bricht das, ist der Umwandler kaputt, egal wie gut die
   Fläche aussieht. */
{
  const von = js.indexOf("const GRUPPIERT");
  const bis = js.indexOf("/* Auszeichnung im Text");
  if (von < 0 || bis < 0 || bis < von){
    warn("Abschnitt 4 nicht gefunden — Markdown-Prüfung übersprungen");
  } else {
    const PROBEN = [
      "# Titel\n\nEin Absatz mit **fett** und `code`.\n",
      "- eins\n- zwei\n- drei\n",
      "1. eins\n2. zwei\n",
      "- [x] erledigt\n- [ ] offen\n",
      "> Ein Zitat\n> über zwei Zeilen\n",
      "```javascript\nconst a = 1;\n```\n",
      "---\n",
      "Ein Absatz\nüber zwei Zeilen\n",
      "# A\n\n## B\n\n### C\n\nText\n\n- x\n\n> y\n\n---\n\nEnde\n",
      /* Eingerueckte Listen. Zwei Leerzeichen sind eine Stufe, vier
         sind zwei -- beide Schreibweisen muessen unveraendert
         zurueckkommen. Die Nummern einer Unterliste fangen bei 1 an,
         der Zaehler der flacheren Stufe laeuft danach weiter. */
      "- eins\n  - unter\n  - noch eins\n- zwei\n",
      "1. eins\n  1. unter\n  2. noch eins\n2. zwei\n",
      "- [ ] offen\n  - [x] unterpunkt erledigt\n- [ ] noch offen\n",
      "- eins\n    - vier Leerzeichen sind zwei Stufen\n- zwei\n",
      "1. eins\n  - gemischte Unterliste\n2. zwei\n",
      /* Die drei Bloecke jenseits von reinem Markdown. Sie tragen
         ihre ganze Quelle im Feld `text` und muessen deshalb Zeichen
         fuer Zeichen unveraendert zurueckkommen. */
      "| Name | Format |\n| --- | --- |\n| Export | CSV |\n",
      "> [!TIP]\n> Vier davon sind derselbe Export.\n",
      "> [!WARNING]\n> Erste Zeile\n> Zweite Zeile\n",
      "<details>\n<summary>Entscheidungen</summary>\n\nDer Rumpf.\n\n</details>\n",
      "Ein Absatz.\n\n| a | b |\n| --- | --- |\n| 1 | 2 |\n\n> [!NOTE]\n> Hinweis\n\nSchluss.\n",
      /* Ein Absatz mit Balken darin ist keine Tabelle -- ohne
         Trennzeile bleibt er ein Absatz. */
      "Erst a | dann b und sonst nichts\n",
      /* Ein gewoehnliches Zitat darf der Callout nicht verschlucken. */
      "> Ein Zitat\n\n> [!TIP]\n> Ein Callout\n"
    ];
    try {
      const kasten = { ergebnis: null };
      vm.createContext(kasten);
      new vm.Script(js.slice(von, bis) + "\nergebnis = { leseMarkdown, schreibeMarkdown };")
        .runInContext(kasten);
      const { leseMarkdown, schreibeMarkdown } = kasten.ergebnis;
      const kaputt = [];
      PROBEN.forEach((p) => {
        const einmal  = schreibeMarkdown(leseMarkdown(p));
        const zweimal = schreibeMarkdown(leseMarkdown(einmal));
        if (einmal !== zweimal) kaputt.push("nicht stabil: " + JSON.stringify(p));
        else if (einmal.replace(/\n+$/, "") !== p.replace(/\n+$/, ""))
          kaputt.push(JSON.stringify(p) + " wird " + JSON.stringify(einmal));
      });
      if (kaputt.length) bad("Markdown hin und zurück — " + kaputt.join(" | "));
      else ok("Markdown hin und zurück — " + PROBEN.length + " Proben verlustfrei");
    } catch (e){
      bad("Markdown-Prüfung brach ab — " + e.message);
    }
  }
}

/* ---------- 10 Die Entwürfe sind vollständig ----------
   Sie sind der Sollzustand. Fehlt einer, verliert die Roadmap ihren
   Bezugspunkt. */
{
  const SOLL = ["index","schreiben","slash","auswahl","bloecke","quelltext","grenzen"];
  if (!existsSync("mockups")) bad("Ordner mockups/ fehlt");
  else {
    const da = readdirSync("mockups").filter(n => n.endsWith(".html")).map(n => n.replace(/\.html$/, ""));
    const fehlt = SOLL.filter(n => da.indexOf(n) < 0);
    if (fehlt.length) bad("Entwurf fehlt — " + fehlt.join(", ") + "  (node werkzeug/bau-mockups.mjs)");
    else ok("Entwürfe vollständig — " + SOLL.length + " Flächen");
  }
}

/* ---------- 11 Der Blockkatalog trägt überall ein Urteil ----------
   Jede Zeile sagt, ob der Block reines Markdown ist, HTML braucht,
   einen Dialekt spricht oder gar nicht geht. Eine Zeile ohne Urteil
   ist eine offene Entscheidung, die niemand mehr sieht. */
{
  const pfad = "doku/BLOCKKATALOG.md";
  if (!existsSync(pfad)) warn(pfad + " fehlt");
  else {
    const zeilen = readFileSync(pfad, "utf8").split("\n")
      .filter(z => z.startsWith("|") && !/^\|\s*-{2,}/.test(z));
    const kopf = zeilen.shift();
    const ohne = zeilen.filter(z => !/(rein|GFM|HTML|Dialekt|geht nicht)/.test(z));
    if (!kopf) warn(pfad + ": keine Tabelle gefunden");
    else if (ohne.length) bad(pfad + ": " + ohne.length + " Zeile(n) ohne Urteil");
    else ok(pfad + " — " + zeilen.length + " Blöcke, jeder mit Urteil");
  }
}

console.log("\n" + "─".repeat(52));
if (fehler) console.log(fehler + " Fehler" + (warnungen ? ", " + warnungen + " Hinweis(e)" : ""));
else console.log("Keine Fehler" + (warnungen ? ", " + warnungen + " Hinweis(e)" : ""));
console.log("\nAchtung: Das ersetzt nicht das Hinsehen. Ein bestandener");
console.log("Prüflauf sagt nichts über die Darstellung. " + DATEI + " im Browser");
console.log("öffnen — oder node werkzeug/schau.mjs laufen lassen.\n");
process.exit(fehler ? 1 : 0);
