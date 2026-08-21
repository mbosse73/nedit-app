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
/* Ein Thema ist ein Block mit Tokens. Gesucht wird **im Block**, nicht
   in der ganzen Datei -- sonst faende das dunkle Thema die hellen
   Werte, die weiter oben stehen. */
function themaBlock(waehler){
  const i = css.indexOf(waehler);
  if (i < 0) return null;
  const auf = css.indexOf("{", i);
  const zu = css.indexOf("}", auf);
  return auf < 0 || zu < 0 ? null : css.slice(auf, zu);
}
function tokenAus(block, name){
  const m = block.match(new RegExp("--" + name + "\\s*:\\s*([^;]+);"));
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
  /* [vorn, mindestens, hinten]. Fehlt das dritte Feld, wird gegen den
     Blattgrund gerechnet. Der Quelltext und die Codeflaeche haben
     einen eigenen Grund — dagegen gerechnet zu haben ist der ganze
     Sinn der Angabe. */
  const paare = [["tinte", 4.5], ["tinte2", 4.5], ["tinte3", 3.0], ["blau", 3.0],
                 ["rot", 4.5],
                 ["code-t", 4.5, "code-g"],   /* Code auf seiner Flaeche */
                 /* Die sechs Farben der Syntax-Hervorhebung. Sie stehen
                    auf der Codeflaeche, nicht auf dem Blattgrund. Eine
                    Hervorhebung, die den Kontrast unterlaeuft, ist
                    keine Hilfe, sondern ein Hindernis. */
                 ["s-schl", 4.5, "code-g"], ["s-name", 4.5, "code-g"],
                 ["s-text", 4.5, "code-g"], ["s-zahl", 4.5, "code-g"],
                 ["s-komm", 4.5, "code-g"], ["s-fkt",  4.5, "code-g"],
                 ["blau", 3.0, "rand"],       /* Auszeichnungszeichen im Quelltext */
                 ["q-l", 4.5, "rand"],        /* Verweisziel im Quelltext */
                 ["tinte", 4.5, "fund"],      /* Text auf dem Suchtreffer */
                 ["tinte", 4.5, "marker"],    /* Text unter dem Textmarker */
                 ["tinte", 4.5, "warn-g"],    /* Text auf der gewarnten Zeile */
                 ["warn-t", 4.5, "warn-g"]];  /* der Zettel am rechten Rand */
  /* Beide Themen. Ein zweites Thema, das die Kontrastregel
     unterlaeuft, ist kein zweites Thema, sondern ein Fehler. */
  const THEMEN = [[":root{", "hell"], ['[data-thema="dunkel"]', "dunkel"]];
  const schwach = [];
  let geprueft = 0;
  THEMEN.forEach(([waehler, name]) => {
    const block = themaBlock(waehler);
    if (!block){ warn("Thema " + name + " nicht gefunden"); return; }
    const grund = farbe(tokenAus(block, "grund"));
    if (!grund){ warn("Thema " + name + ": --grund fehlt"); return; }
    paare.forEach(([tok, soll, hintenTok]) => {
      const c = farbe(tokenAus(block, tok));
      if (!c){ warn("Thema " + name + ": --" + tok + " fehlt"); return; }
      let hinten = grund;
      if (hintenTok){
        const h = farbe(tokenAus(block, hintenTok));
        if (!h){ warn("Thema " + name + ": --" + hintenTok + " fehlt"); return; }
        hinten = ueber(h, grund);
      }
      geprueft++;
      const v = verhaeltnis(ueber(c, hinten), hinten);
      if (v < soll)
        schwach.push(name + " --" + tok + (hintenTok ? " auf --" + hintenTok : "")
          + " " + v.toFixed(2) + " : 1 (mindestens " + soll + ")");
    });
  });
  if (schwach.length) bad("Kontrast zu schwach — " + schwach.join(", "));
  else ok("Kontrast — " + geprueft + " Paare über der Schwelle, beide Themen");
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
      /* Fortsetzungszeilen. Eine eingerueckte Zeile ohne eigenes
         Zeichen gehoert zum Punkt darueber; die Einrueckung ist genau
         so breit wie das Listenzeichen. Zaehlte der Leser sie als
         Absatz, unterbraeche sie die Liste -- die dritte Probe wuerde
         dann "1. 1. 2." schreiben statt "1. 2. 3.". */
      "- eins\n  und weiter\n- zwei\n",
      "1. eins\n   und weiter\n2. zwei\n",
      "1. eins\n   und weiter\n2. zwei\n3. drei\n   auch hier\n",
      "- [ ] offen\n      und weiter\n- [x] fertig\n",
      "- eins\n  und weiter\n  und noch eine Zeile\n- zwei\n",
      /* Gegenprobe: Nach einer Leerzeile ist der Punkt zu Ende. Die
         eingerueckte Zeile darunter ist ein eigener Absatz und muss
         mit ihren Leerzeichen unveraendert wiederkommen. */
      "- eins\n\n  ein eigener Absatz\n",
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
      "> Ein Zitat\n\n> [!TIP]\n> Ein Callout\n",
      /* Fussnoten. Die Erklaerung traegt ihre ganze Quelle im Feld
         `text`; zwei davon stehen ohne Leerzeile untereinander, und
         eine eingerueckte Folgezeile gehoert zur Erklaerung darueber. */
      "Ein Satz mit Beleg.[^1]\n\n[^1]: Woher der Satz stammt.\n",
      "[^1]: Erste Quelle\n[^2]: Zweite Quelle\n",
      "[^lang]: Erste Zeile\n    und weiter\n\nEin Absatz danach.\n",
      /* Gegenprobe: Ein gewoehnlicher Verweis ist keine Fussnote. */
      "Ein [Verweis](./datei.md) und ein ^Dach.\n",
      /* Der Seitenumbruch. Ein HTML-Kommentar, der unveraendert
         wieder herauskommen muss — sonst waere er beim naechsten
         Speichern weg. */
      "Erste Seite\n\n<!-- seitenumbruch -->\n\nZweite Seite\n",
      "# Kapitel\n\n<!-- seitenumbruch -->\n\n# Naechstes Kapitel\n"
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

/* ---------- 12 Die Vorschau-Themen ----------
   Sie färben das Dokument in Vorschau, Druck und Export. Zwei Dinge
   müssen stimmen: Jedes angebotene Thema braucht auch einen Stil,
   und der Text darauf muss lesbar bleiben. Ein Thema in der Liste
   ohne Regel im Stil ist ein Knopf, der nichts tut. */
{
  const liste = js.match(/const VTHEMEN = \[([\s\S]*?)\n\];/);
  const stil  = js.match(/const VTHEMA_CSS = `([\s\S]*?)`;/);
  if (!liste || !stil) warn("VTHEMEN oder VTHEMA_CSS nicht gefunden");
  else {
    const namen = [...liste[1].matchAll(/\["([a-z]+)",/g)].map(m => m[1]);
    /* „editor" ist die Vorgabe: dieselben Werte wie die Fläche, und
       deshalb ohne eigene Regel. */
    const ohne = namen.filter(n => n !== "editor"
      && stil[1].indexOf('data-vthema="' + n + '"') < 0);
    if (!namen.length) bad("keine Vorschau-Themen gefunden");
    else if (ohne.length) bad("Vorschau-Thema ohne Stil — " + ohne.join(", "));
    else ok("Vorschau-Themen — " + namen.length + " Themen, jedes mit Stil");

    /* Die eigenen Gründe der Themen. Papier bleibt hell, auch im
       dunklen Thema — deshalb werden sie nur gegen sich selbst und
       nur im hellen Block gerechnet. */
    const block = themaBlock(":root{");
    const paare = [["pap-t", "pap-g"], ["kon-t", "kon-g"], ["masch-t", "masch-g"]];
    const schwach = [];
    if (!block) warn("Thema hell nicht gefunden");
    else paare.forEach(([vorn, hinten]) => {
      const c = farbe(tokenAus(block, vorn)), h = farbe(tokenAus(block, hinten));
      if (!c || !h){ warn("Token --" + vorn + " oder --" + hinten + " fehlt"); return; }
      const v = verhaeltnis(ueber(c, h), h);
      if (v < 4.5) schwach.push("--" + vorn + " auf --" + hinten
        + " " + v.toFixed(2) + " : 1 (mindestens 4.5)");
    });
    if (schwach.length) bad("Kontrast im Vorschau-Thema — " + schwach.join(", "));
    else ok("Kontrast der Vorschau-Themen — " + paare.length + " Paare über der Schwelle");
  }
}

/* ---------- 13 Jede Blockart kennt jeden Ausgang ----------
   Der Editor gibt in fünf Formaten aus. Kommt eine Blockart dazu und
   weiß eine der Ausgaben nichts von ihr, verschwindet sie dort
   stillschweigend — und niemand merkt es, bis jemand das Dokument
   aufmacht. Deshalb: Was in `ARTEN` steht, muss in jedem Ausgang
   vorkommen. */
{
  const ausschnitt = (name) => {
    const von = js.indexOf("function " + name);
    if (von < 0) return "";
    const bis = js.indexOf("\nfunction ", von + 10);
    return js.slice(von, bis < 0 ? js.length : bis);
  };
  const liste = js.match(/const ARTEN = \[([\s\S]*?)\n\];/);
  if (!liste) warn("ARTEN nicht gefunden");
  else {
    const arten = [...liste[1].matchAll(/\{art:"([a-z0-9]+)"/g)].map(m => m[1]);
    /* Zwei stehen mit Absicht nicht als eigener Fall da: Der Absatz
       ist der Vorgabefall, das Bild ist keine Blockart, sondern ein
       Handgriff im Slash-Menü. */
    const vorgabe = ["absatz", "bild"];
    /* Das Dokument behandelt die Listen und die Fussnote schon in
       `dokumentHtml`, bevor `blockDokument` an die Reihe kommt —
       deshalb zaehlen beide Koerper zusammen. */
    const ausgaenge = [[["dokumentHtml","blockDokument"], "HTML"],
                       [["rtfAusgeben"],  "RTF"],
                       [["docxAusgeben"], "DOCX"]];
    const LISTENART = ["punkt", "nummer", "todo"];
    const fehlt = [];
    ausgaenge.forEach(([fns, wie]) => {
      const koerper = fns.map(ausschnitt).join("\n");
      if (!koerper.trim()){ warn(fns.join("/") + " nicht gefunden"); return; }
      arten.forEach(a => {
        if (vorgabe.indexOf(a) >= 0) return;
        const da = koerper.indexOf('case "' + a + '"') >= 0
                || koerper.indexOf('=== "' + a + '"') >= 0
                || (LISTENART.indexOf(a) >= 0 && koerper.indexOf("LISTE.indexOf") >= 0);
        if (!da) fehlt.push(wie + ": " + a);
      });
    });
    if (!arten.length) bad("keine Blockarten in ARTEN gefunden");
    else if (fehlt.length) bad("Blockart ohne Ausgang — " + fehlt.join(", "));
    else ok("Ausgänge vollständig — " + arten.length + " Blockarten in HTML, RTF und DOCX");
  }
}

/* ---------- 14 Die Kopfleiste bleibt schmal ----------
   Sie trug im August 2026 vierzehn Knoepfe. Jeder fuer sich war
   verstaendlich, zusammen waren sie eine Werkzeugleiste, die niemand
   liest. Alles, was nicht in jeder Minute gebraucht wird, steht seit
   der Umstellung im Punkte-Menue (doku/ENTSCHEIDUNGEN.md, Punkt 25).

   Diese Pruefung ist eine Bremse, keine Wahrheit: Sie sagt nicht,
   dass die Leiste gut ist -- sie sagt, dass sie nicht wieder
   zuwaechst, ohne dass es jemand merkt. */
{
  const m = html.match(/<div class="kopf">([\s\S]*?)\n  <\/div>/);
  if (!m) warn("Kopfleiste nicht gefunden");
  else {
    const knoepfe = (m[1].match(/<button/g) || []).length;
    const GRENZE = 8;
    if (knoepfe > GRENZE)
      bad("Kopfleiste mit " + knoepfe + " Knoepfen (hoechstens " + GRENZE
        + ") — was selten gebraucht wird, gehoert ins Punkte-Menue");
    else ok("Kopfleiste — " + knoepfe + " Knoepfe, hoechstens " + GRENZE);
  }
}

console.log("\n" + "─".repeat(52));
if (fehler) console.log(fehler + " Fehler" + (warnungen ? ", " + warnungen + " Hinweis(e)" : ""));
else console.log("Keine Fehler" + (warnungen ? ", " + warnungen + " Hinweis(e)" : ""));
console.log("\nAchtung: Das ersetzt nicht das Hinsehen. Ein bestandener");
console.log("Prüflauf sagt nichts über die Darstellung. " + DATEI + " im Browser");
console.log("öffnen — oder node werkzeug/schau.mjs laufen lassen.\n");
process.exit(fehler ? 1 : 0);
