/* Erzeugt mockups/*.html — ein Markdown-Editor, der den
   Notion-Editor in Oberfläche und Funktionen kopiert.
   Aufruf: node werkzeug/bau-mockups.mjs

   Die Frage war: Wie sähe ein Markdown-Editor aus, wenn er sich den
   Notion-Editor zum Vorbild nimmt — nicht nur die Farben, sondern die
   Bedienung: Blöcke statt Zeilen, das Slash-Menü, den Blockgriff, die
   Auswahlleiste, „Umwandeln in".

   Der Reiz liegt in der zweiten Hälfte der Frage. Notion kennt Blöcke,
   die es in Markdown nicht gibt — Spalten, Kommentare, farbigen Text,
   synchronisierte Blöcke. Ein Editor, der Notion kopiert, muss für
   jeden davon entscheiden: weglassen, in HTML ausweichen, einen
   Dialekt sprechen oder eine zweite Datei führen. Genau diese
   Entscheidung ist der Entwurf.

   **Die Entwürfe sind der Sollzustand, nicht der Iststand.**
   `editor.html` holt sie Schritt für Schritt ein; wo es steht, sagt
   `STAND.md`. Sieben statische Dateien ohne Skript.

   Vergleichspunkt ist der Markdown-Umwandler mit fester
   Formatierungsleiste, aus dem dieser Entwurf hervorging: sechs
   Knöpfe — fett, kursiv, Überschrift, Aufzählung, Trennlinie — und ein
   Umschalter „Vorschau". Unter jeder Fläche steht, was der Notion-Weg
   beisteuert und was er kostet.

   Sieben Dateien, ein gemeinsamer Stilblock — deshalb ein Skript. */

import { writeFileSync, mkdirSync } from "node:fs";

const esc = s => String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));

const SEITEN = [
  ["index",     "Übersicht"],
  ["schreiben", "Schreiben"],
  ["slash",     "Slash-Menü"],
  ["auswahl",   "Auswahl & Menüs"],
  ["bloecke",   "Blockkatalog"],
  ["quelltext", "Quelltext"],
  ["grenzen",   "Grenzen"]
];

/* ---------- Symbole ----------
   Gezeichnet, mit stroke und fill:none — so verlangt es Regel 6.
   Emoji
   stehen nur dort, wo Notion selbst ein Seitenzeichen setzt. */
const S = (d, w=16) => '<svg width="'+w+'" height="'+w+'" viewBox="0 0 20 20" fill="none" '
  +'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
  +'stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
const IK = {
  lupe:   S('<circle cx="9" cy="9" r="5.8"/><path d="m16.2 16.2-3-3"/>'),
  chev:   S('<path d="M7.6 4.6 13 10l-5.4 5.4"/>'),
  chevU:  S('<path d="M4.6 7.6 10 13l5.4-5.4"/>'),
  plus:   S('<path d="M10 4.2v11.6M4.2 10h11.6"/>'),
  punkte: S('<circle cx="4.6" cy="10" r=".95"/><circle cx="10" cy="10" r=".95"/>'
           +'<circle cx="15.4" cy="10" r=".95"/>'),
  griff:  S('<circle cx="7.6" cy="5" r="1.05"/><circle cx="12.4" cy="5" r="1.05"/>'
           +'<circle cx="7.6" cy="10" r="1.05"/><circle cx="12.4" cy="10" r="1.05"/>'
           +'<circle cx="7.6" cy="15" r="1.05"/><circle cx="12.4" cy="15" r="1.05"/>'),
  ordner: S('<path d="M2.8 6.2a1.4 1.4 0 0 1 1.4-1.4h3l1.6 2h6.4a1.4 1.4 0 0 1 1.4 1.4v6.6'
           +'a1.4 1.4 0 0 1-1.4 1.4H4.2a1.4 1.4 0 0 1-1.4-1.4z"/>'),
  datei:  S('<path d="M5.4 2.8h6l3.6 3.6v10.8H5.4z"/><path d="M11.4 2.8v3.6h3.6"/>'),
  haken:  S('<path d="M4.4 10.4 8 14l7.6-8"/>'),
  code:   S('<path d="M7.6 6.4 3.8 10l3.8 3.6M12.4 6.4 16.2 10l-3.8 3.6"/>'),
  kette:  S('<path d="M8.4 11.6a3.4 3.4 0 0 0 5 .4l2-2a3.4 3.4 0 0 0-4.8-4.8l-1.1 1.1"/>'
           +'<path d="M11.6 8.4a3.4 3.4 0 0 0-5-.4l-2 2a3.4 3.4 0 0 0 4.8 4.8l1.1-1.1"/>'),
  sprech: S('<path d="M16.8 11.4a1.8 1.8 0 0 1-1.8 1.8H6.6L3.2 16V5.4a1.8 1.8 0 0 1 1.8-1.8h10'
           +'a1.8 1.8 0 0 1 1.8 1.8z"/>'),
  stern:  S('<path d="m10 3.4 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z"/>'),
  auge:   S('<path d="M1.8 10S4.8 4.8 10 4.8 18.2 10 18.2 10 15.2 15.2 10 15.2 1.8 10 1.8 10z"/>'
           +'<circle cx="10" cy="10" r="2.2"/>'),
  spalte: S('<rect x="3" y="4" width="5.6" height="12" rx="1.4"/>'
           +'<rect x="11.4" y="4" width="5.6" height="12" rx="1.4"/>'),
  pfeilR: S('<path d="M4.2 10h11.6M11 5.2 15.8 10 11 14.8"/>'),
  zurueck:S('<path d="M12 5.2 7.2 10 12 14.8"/>'),
  text:   S('<path d="M4.4 5.4h11.2M4.4 10h11.2M4.4 14.6h6.4"/>'),
  liste:  S('<circle cx="4.4" cy="5.6" r="1"/><path d="M8 5.6h9M8 10h9M8 14.4h9"/>'
           +'<circle cx="4.4" cy="10" r="1"/><circle cx="4.4" cy="14.4" r="1"/>'),
  kasten: S('<rect x="3.2" y="3.2" width="13.6" height="13.6" rx="2.4"/>'),
  warn:   S('<path d="M10 3.4 18 16.6H2z"/><path d="M10 8.4v3.4M10 14.2v.1"/>'),
  x:      S('<path d="M5.4 5.4 14.6 14.6M14.6 5.4 5.4 14.6"/>')
};

/* ---------- Der gemeinsame Stilblock ----------
   Notions Werte, nach Augenmaß: Tinte rgb(55,53,47), Blau
   rgb(35,131,226), Rot rgb(235,87,87), Seitenleiste rgb(247,247,245).
   Die Schreibspalte liegt auf 708 px — Notions eigene Breite. */
const STIL = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{color-scheme:light}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  background:#f2f1ee;color:#111}

/* ---------- Rahmen: nicht Teil des Entwurfs ---------- */
.meta{background:#1a1a18;color:#e7e5e0;padding:10px 22px;font-size:13px;
  display:flex;align-items:baseline;gap:16px;flex-wrap:wrap}
.meta b{color:#fff}
.meta nav{display:flex;gap:12px;margin-left:auto;flex-wrap:wrap}
.meta a{color:#b9b6ad;text-decoration:none;font-size:12.5px}
.meta a.hier{color:#fff;font-weight:600}
.meta a:hover{color:#fff}
.rahmenhinweis{max-width:1480px;margin:14px auto 0;padding:0 22px;font-size:13.5px;
  color:#57544c;line-height:1.55}
.rahmenhinweis b{color:#1a1a18}
.bilanz{max-width:1480px;margin:18px auto 60px;padding:0 22px;display:grid;
  grid-template-columns:1fr 1fr;gap:16px}
.bilanz section{background:#fff;border:1px solid #e2e0db;border-radius:10px;padding:14px 17px}
.bilanz h3{font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;
  color:#8a857a}
.bilanz section.gewinn h3{color:#2f7d4f}
.bilanz section.verlust h3{color:#a63d2f}
.bilanz li{font-size:13.5px;line-height:1.55;color:#4a473f;margin-left:17px;margin-bottom:5px}
.bilanz b{color:#1a1a18}
.bilanz code{background:#e9e7e2;border-radius:3px;padding:1px 5px;font-size:12.5px;
  font-family:ui-monospace,Consolas,monospace}
@media(max-width:900px){.bilanz{grid-template-columns:1fr}}
.blocktext{max-width:1480px;margin:22px auto;padding:0 22px;font-size:14px;line-height:1.65;
  color:#3d3a34}
.blocktext h2{font-size:19px;margin:26px 0 8px;color:#1a1a18}
.blocktext p{margin-bottom:10px;max-width:74ch}
.blocktext li{margin-left:20px;margin-bottom:6px;max-width:72ch}
.blocktext b{color:#1a1a18}
.blocktext code{background:#e9e7e2;border-radius:3px;padding:1px 5px;font-size:13px;
  font-family:ui-monospace,Consolas,monospace}
.uebersicht{max-width:1480px;margin:16px auto 60px;padding:0 22px;
  display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.uebersicht a{display:block;background:#fff;border:1px solid #e2e0db;border-radius:10px;
  padding:16px 18px;text-decoration:none;color:#1a1a18}
.uebersicht a:hover{border-color:#c9c5bc;box-shadow:0 3px 12px rgba(15,15,15,.07)}
.uebersicht .em{font-size:26px;display:block;margin-bottom:8px}
.uebersicht h3{font-size:16px;margin-bottom:5px}
.uebersicht p{font-size:13.5px;line-height:1.55;color:#57544c}

/* ============================================================
   AB HIER: der Editor. Eigener Geltungsbereich, eigene Typografie.
   ============================================================ */
.ed{max-width:1480px;margin:16px auto 0;background:#fff;border:1px solid #e7e6e3;
  border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(15,15,15,.06);
  display:flex;flex-direction:column;height:920px;position:relative;
  font-family:ui-sans-serif,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;
  color:rgb(55,53,47);font-size:14px;line-height:1.5}
.ed.hoch{height:auto;min-height:620px}
.ed *{box-sizing:border-box}
.ed-rumpf{flex:1;min-height:0;display:flex}
.ed.hoch .ed-rumpf{min-height:0}

/* ---------- Dateibaum links ---------- */
.ed-baum{width:250px;flex-shrink:0;background:rgb(247,247,245);
  border-right:1px solid rgba(55,53,47,.09);display:flex;flex-direction:column;
  padding:8px 8px;overflow-y:auto}
.ed.hoch .ed-baum{overflow:visible}
.ed-wurzel{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:6px;
  font-size:14px;font-weight:600}
.ed-wurzel svg{color:rgba(55,53,47,.5)}
.ed-wurzel .ch{margin-left:auto;color:rgba(55,53,47,.4);display:flex}
.ed-such{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;
  font-size:14px;color:rgba(55,53,47,.55);margin:2px 0 8px}
.ed-such svg{color:rgba(55,53,47,.45)}
.ed-such kbd{margin-left:auto;font-size:11px;background:rgba(55,53,47,.06);border-radius:4px;
  padding:1px 5px;font-family:inherit;color:rgba(55,53,47,.45)}
.ed-z{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:6px;
  font-size:14px;color:rgba(55,53,47,.78)}
.ed-z:hover{background:rgba(55,53,47,.06)}
.ed-z .dre{width:14px;flex-shrink:0;color:rgba(55,53,47,.32);display:flex;
  align-items:center;justify-content:center}
.ed-z .em{font-size:14px;width:18px;text-align:center;flex-shrink:0;line-height:1}
.ed-z .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ed-z.an{background:rgba(55,53,47,.08);font-weight:500;color:rgb(55,53,47)}
.ed-z.k1{padding-left:22px}
.ed-z.k2{padding-left:38px}
.ed-z .kb{margin-left:auto;font-size:11px;color:rgba(55,53,47,.3)}
.ed-sek{font-size:11.5px;font-weight:600;color:rgba(55,53,47,.45);padding:12px 8px 4px;
  display:flex;align-items:center}
.ed-sek .sp{flex:1}
.ed-fuss{margin-top:auto;padding-top:8px}

/* ---------- Kopfzeile ---------- */
.ed-kopf{display:flex;align-items:center;gap:8px;padding:9px 16px;font-size:13.5px;
  color:rgba(55,53,47,.6);border-bottom:1px solid rgba(55,53,47,.07);flex-shrink:0}
.ed-krume{display:flex;align-items:center;gap:6px;padding:3px 6px;border-radius:5px}
.ed-krume:hover{background:rgba(55,53,47,.06)}
.ed-kopf .tr{color:rgba(55,53,47,.25)}
.ed-kopf .re{margin-left:auto;display:flex;gap:3px;align-items:center}
.ed-kopf .re .kn{padding:4px 9px;border-radius:5px;display:flex;align-items:center;gap:6px;
  color:rgba(55,53,47,.62)}
.ed-kopf .re .kn:hover{background:rgba(55,53,47,.06)}
.ed-kopf .re .kn.an{background:rgba(55,53,47,.08);color:rgb(55,53,47);font-weight:500}
.ed-schalt{display:flex;background:rgba(55,53,47,.06);border-radius:6px;padding:2px}
.ed-schalt span{padding:3px 10px;border-radius:4px;font-size:12.5px;
  color:rgba(55,53,47,.6)}
.ed-schalt span.an{background:#fff;color:rgb(55,53,47);font-weight:500;
  box-shadow:0 1px 2px rgba(15,15,15,.12)}

/* ---------- Schreibfläche ---------- */
.ed-blatt{flex:1;min-width:0;overflow-y:auto;background:#fff;position:relative}
.ed.hoch .ed-blatt{overflow:visible}
.ed-deck{height:140px;background:linear-gradient(115deg,#e6e1d6,#f2ece1 55%,#e3ebeb)}
.ed-seite{max-width:900px;margin:0 auto;padding:0 96px 90px}
.ed-icon{font-size:64px;line-height:1;display:block;margin:-34px 0 6px}
.ed-titel{font-size:40px;font-weight:700;letter-spacing:-.02em;line-height:1.2;
  margin-bottom:6px}

/* ---------- Frontmatter als Eigenschaften ---------- */
.ed-eig{margin:4px 0 14px}
.ed-eig .r{display:flex;align-items:flex-start;gap:8px;font-size:14px}
.ed-eig .l{width:172px;flex-shrink:0;display:flex;align-items:center;gap:7px;
  color:rgba(55,53,47,.5);padding:4px 6px;border-radius:5px}
.ed-eig .l svg{flex-shrink:0}
.ed-eig .w{flex:1;padding:4px 8px;border-radius:5px;min-height:26px}
.ed-eig .w:hover{background:rgba(55,53,47,.06)}
.ed-eig .w.leer{color:rgba(55,53,47,.33)}
.ed-eig-fuss{display:flex;align-items:center;gap:8px;font-size:12px;
  color:rgba(55,53,47,.4);padding:6px 6px 0;border-top:1px solid rgba(55,53,47,.07);
  margin-top:6px}

/* ---------- Blöcke ---------- */
.b{position:relative;padding:3px 2px;font-size:16px;line-height:1.6}
.b:hover{background:rgba(55,53,47,.02)}
.b .gr{position:absolute;left:-46px;top:2px;display:flex;gap:2px;opacity:0;
  color:rgba(55,53,47,.3)}
.b.zeig .gr,.b:hover .gr{opacity:1}
.b .gr span{padding:2px;border-radius:4px}
.b .gr span:hover{background:rgba(55,53,47,.08)}
.h1{font-size:30px;font-weight:600;letter-spacing:-.01em;margin:28px 0 2px}
.h2{font-size:24px;font-weight:600;margin:22px 0 1px}
.h3{font-size:19px;font-weight:600;margin:18px 0 0}
.grau{color:rgba(55,53,47,.5)}
.b-leer{color:rgba(55,53,47,.28);font-size:16px;padding:4px 2px;display:flex;
  align-items:center;gap:10px}
.b-leer .pl{color:rgba(55,53,47,.3);display:flex}
.b-todo{display:flex;align-items:flex-start;gap:10px;padding:3px 2px;font-size:16px}
.b-todo .ka{width:16px;height:16px;border-radius:3px;border:1.5px solid rgba(55,53,47,.35);
  margin-top:5px;flex-shrink:0;display:grid;place-items:center}
.b-todo.fertig .ka{background:rgb(35,131,226);border-color:rgb(35,131,226);color:#fff}
.b-todo.fertig .tt{color:rgba(55,53,47,.4);text-decoration:line-through}
.b-pkt{display:flex;align-items:flex-start;gap:11px;padding:3px 2px;font-size:16px}
.b-pkt .m{color:rgba(55,53,47,.75);line-height:1.6;flex-shrink:0}
.b-tog{display:flex;align-items:flex-start;gap:9px;padding:3px 2px;font-size:16px}
.b-tog .dre{color:rgba(55,53,47,.5);margin-top:6px;flex-shrink:0;display:flex}
.b-tog .dre.zu{transform:rotate(-90deg)}
.kind{margin-left:27px}
.b-zit{border-left:3px solid rgb(55,53,47);padding-left:14px;font-size:16px;margin:8px 0}
.b-ruf{display:flex;gap:11px;background:rgb(241,241,239);border-radius:4px;padding:16px;
  margin:8px 0;font-size:15.5px;line-height:1.5}
.b-ruf.blau{background:rgb(231,242,248)}
.b-ruf.gelb{background:rgb(253,236,200)}
.b-ruf.rot{background:rgb(255,226,221)}
.b-ruf .em{font-size:17px;line-height:1.35;flex-shrink:0}
.b-lin{height:1px;background:rgba(55,53,47,.11);margin:15px 0}
.b-code{background:rgb(247,246,243);border-radius:4px;padding:28px 16px 16px;margin:8px 0;
  font-family:ui-monospace,Consolas,"Courier New",monospace;font-size:13.5px;line-height:1.55;
  position:relative;white-space:pre;overflow-x:auto}
.b-code .spr{position:absolute;top:6px;left:12px;font-size:11.5px;
  color:rgba(55,53,47,.4);font-family:ui-sans-serif,sans-serif}
.b-code .kop{position:absolute;top:5px;right:8px;font-size:11.5px;
  color:rgba(55,53,47,.45);font-family:ui-sans-serif,sans-serif;
  border:1px solid rgba(55,53,47,.14);border-radius:4px;padding:1px 7px}
.b-tab{width:100%;border-collapse:collapse;font-size:15px;margin:8px 0}
.b-tab th,.b-tab td{border:1px solid rgba(55,53,47,.14);padding:7px 10px;text-align:left}
.b-tab th{background:rgb(247,246,243);font-weight:600;font-size:14px}
.b-bild{margin:10px 0;border-radius:4px;overflow:hidden}
.b-bild .fl{height:190px;background:linear-gradient(120deg,#dfe6ea,#eef1ec 60%,#e8e0d8);
  display:grid;place-items:center;color:rgba(55,53,47,.35);font-size:13px}
.b-bild .un{font-size:12.5px;color:rgba(55,53,47,.45);padding:6px 2px}
.b-marke{border:1px solid rgba(55,53,47,.14);border-radius:4px;display:flex;margin:8px 0;
  overflow:hidden}
.b-marke .l{flex:1;padding:12px 14px;min-width:0}
.b-marke .t{font-size:14px;margin-bottom:3px}
.b-marke .u{font-size:12px;color:rgba(55,53,47,.5);line-height:1.45}
.b-marke .a{font-size:12px;color:rgba(55,53,47,.5);margin-top:7px;display:flex;
  align-items:center;gap:6px}
.b-marke .r{width:130px;background:rgb(241,241,239);flex-shrink:0}
.b-spalten{display:grid;grid-template-columns:1fr 1fr;gap:26px;margin:8px 0}
.b-marker{background:rgb(251,243,196);border-radius:3px;padding:1px 2px}
.b-farbe{color:rgb(186,67,63)}
.b-inline{background:rgba(135,131,120,.15);color:rgb(212,76,71);border-radius:3px;
  padding:1px 5px;font-family:ui-monospace,Consolas,monospace;font-size:.86em}
.b-verweis{border-bottom:1px solid rgba(55,53,47,.25);padding:0 1px;border-radius:2px}
.b-verweis:hover{background:rgba(55,53,47,.07)}
.b-erw{background:rgba(35,131,226,.09);color:rgb(35,131,226);border-radius:3px;padding:1px 5px}
.b-komm{background:rgb(253,236,200);border-bottom:2px solid rgb(222,178,64);
  border-radius:2px;padding:0 1px}

/* ---------- Gliederung rechts ---------- */
.ed-gl{width:236px;flex-shrink:0;border-left:1px solid rgba(55,53,47,.09);padding:20px 14px;
  overflow-y:auto}
.ed.hoch .ed-gl{overflow:visible}
.ed-gl h4{font-size:11.5px;font-weight:600;color:rgba(55,53,47,.45);margin-bottom:9px}
.ed-gl a{display:block;font-size:13px;color:rgba(55,53,47,.65);padding:4px 7px;
  border-radius:5px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.ed-gl a:hover{background:rgba(55,53,47,.06)}
.ed-gl a.t2{padding-left:18px;font-size:12.5px}
.ed-gl a.t3{padding-left:30px;font-size:12.5px;color:rgba(55,53,47,.5)}
.ed-gl a.an{color:rgb(35,131,226);background:rgba(35,131,226,.08)}

/* ---------- Fußleiste ---------- */
.ed-stat{flex-shrink:0;display:flex;align-items:center;gap:16px;padding:6px 16px;
  border-top:1px solid rgba(55,53,47,.09);background:rgb(251,251,250);font-size:11.5px;
  color:rgba(55,53,47,.45)}
.ed-stat .sp{flex:1}
.ed-stat b{font-weight:600;color:rgba(55,53,47,.6)}
.ed-stat .neu{color:rgb(35,131,226)}
`;

/* ---------- Zweiter Stilblock ----------
   Was nur einzelne Flächen brauchen: die Menüs, die Quelltextansicht,
   der Blockkatalog. Getrennt, damit der Grundstil lesbar bleibt. */
const STIL2 = `
/* ---------- Schwebende Menüs ---------- */
.mn{background:#fff;border-radius:6px;padding:6px;position:absolute;z-index:30;
  box-shadow:0 14px 38px rgba(15,15,15,.22),0 0 0 1px rgba(15,15,15,.07);
  font-size:14px}
.mn .k{font-size:11.5px;font-weight:600;color:rgba(55,53,47,.45);padding:9px 9px 4px}
.mn .z{display:flex;align-items:center;gap:10px;padding:5px 8px;border-radius:5px;
  color:rgba(55,53,47,.85)}
.mn .z:hover,.mn .z.an{background:rgba(55,53,47,.06)}
.mn .z .ic{width:26px;height:26px;border-radius:4px;border:1px solid rgba(55,53,47,.13);
  display:grid;place-items:center;flex-shrink:0;background:rgb(251,251,250);
  color:rgba(55,53,47,.7);font-size:13px}
.mn .z .t{flex:1;min-width:0}
.mn .z .u{font-size:11.5px;color:rgba(55,53,47,.45)}
.mn .z .ta{font-size:11px;color:rgba(55,53,47,.4);font-family:ui-monospace,Consolas,monospace;
  background:rgba(55,53,47,.05);border-radius:3px;padding:1px 5px;flex-shrink:0}
.mn .tr{height:1px;background:rgba(55,53,47,.09);margin:5px 4px}

/* Das Slash-Menü: Liste links, Vorschau rechts */
.slash{width:640px;display:flex;padding:0;overflow:hidden}
.slash .li{width:334px;flex-shrink:0;padding:6px;overflow-y:auto;
  border-right:1px solid rgba(55,53,47,.09)}
.slash .vs{flex:1;padding:14px;background:rgb(251,251,250);display:flex;
  flex-direction:column;gap:10px;min-width:0}
.slash .vs .h{font-size:11.5px;font-weight:600;color:rgba(55,53,47,.45)}
.slash .vs .bild{background:#fff;border:1px solid rgba(55,53,47,.11);border-radius:5px;
  padding:12px 14px}
.slash .vs .md{background:rgb(46,44,40);color:#e9e6df;border-radius:5px;padding:11px 13px;
  font-family:ui-monospace,Consolas,monospace;font-size:12.5px;line-height:1.6;
  white-space:pre-wrap;word-break:break-word}
.slash .vs .md em{color:#9fd4a0;font-style:normal}
.slash .vs .t{font-size:12.5px;color:rgba(55,53,47,.55);line-height:1.5}
.slash-feld{display:flex;align-items:center;gap:8px;padding:8px 10px 6px;
  border-bottom:1px solid rgba(55,53,47,.07);font-size:13px;color:rgba(55,53,47,.5)}
.slash-feld b{color:rgb(55,53,47);font-family:ui-monospace,Consolas,monospace;font-weight:400}

/* Auswahlleiste */
.aus{display:inline-flex;align-items:center;background:rgb(37,36,33);color:#f1efe9;
  border-radius:5px;padding:3px;gap:1px;position:absolute;z-index:30;
  box-shadow:0 8px 26px rgba(15,15,15,.3);font-size:13.5px}
.aus .kn{padding:5px 8px;border-radius:4px;display:flex;align-items:center;gap:5px;
  white-space:nowrap}
.aus .kn:hover{background:rgba(255,255,255,.12)}
.aus .kn.aus1{opacity:.35}
.aus .kn b{font-weight:700}
.aus .kn i{font-style:italic}
.aus .kn s{text-decoration:line-through}
.aus .kn u{text-decoration:underline}
.aus .tr{width:1px;align-self:stretch;background:rgba(255,255,255,.16);margin:3px 4px}
.markiert{background:rgba(35,131,226,.22);border-radius:2px}

/* Farbmenü */
.farben .pr{width:22px;height:22px;border-radius:4px;border:1px solid rgba(55,53,47,.13);
  display:grid;place-items:center;font-size:13px;flex-shrink:0}

/* ---------- Quelltext ---------- */
.q{font-family:ui-monospace,Consolas,"Courier New",monospace;font-size:13.5px;
  line-height:24px;white-space:pre-wrap;word-break:break-word;color:rgb(55,53,47)}
.q-mk{color:rgb(35,131,226)}
.q-h{color:rgb(55,53,47);font-weight:700}
.q-b{font-weight:700}
.q-i{font-style:italic}
.q-c{color:rgb(186,67,63)}
.q-l{color:rgb(45,111,149)}
.q-fm{color:rgba(55,53,47,.45)}
.q-w{color:rgb(190,101,12)}
.qspalte{flex:1;min-width:0;overflow-y:auto;background:rgb(251,251,250);
  border-left:1px solid rgba(55,53,47,.09)}
.ed.hoch .qspalte{overflow:visible}
.qkopf{position:sticky;top:0;background:rgb(251,251,250);padding:9px 18px;font-size:11.5px;
  color:rgba(55,53,47,.45);border-bottom:1px solid rgba(55,53,47,.07);display:flex;
  align-items:center;gap:10px}
.qkopf .sp{flex:1}
.qrumpf{padding:18px 18px 60px;display:flex;gap:14px}
.qnr{flex-shrink:0;width:26px;text-align:right;color:rgba(55,53,47,.25);font-size:12.5px;
  font-family:ui-monospace,Consolas,monospace;line-height:24px;user-select:none;
  white-space:pre}
.qrumpf .q{flex:1;min-width:0}
.qzeile-an{background:rgb(253,236,200);border-radius:3px}

/* ---------- Blockkatalog ---------- */
.kat{width:100%;border-collapse:collapse;font-size:14px}
.kat th{text-align:left;font-size:11.5px;font-weight:600;color:rgba(55,53,47,.45);
  padding:8px 12px;border-bottom:1px solid rgba(55,53,47,.11);text-transform:uppercase;
  letter-spacing:.05em}
.kat td{padding:12px;border-bottom:1px solid rgba(55,53,47,.08);vertical-align:top}
.kat tr:hover td{background:rgba(55,53,47,.02)}
.kat .b-tab th{text-transform:none;letter-spacing:0;font-size:14px;
  color:rgb(55,53,47);padding:7px 10px;border:1px solid rgba(55,53,47,.14)}
.kat .nm{width:180px;font-weight:500;font-size:14px}
.kat .nm .ta{display:block;font-size:11.5px;color:rgba(55,53,47,.42);font-weight:400;
  font-family:ui-monospace,Consolas,monospace;margin-top:3px}
.kat .zeig{width:38%}
.kat .md{width:34%;font-family:ui-monospace,Consolas,monospace;font-size:12.5px;
  line-height:1.65;white-space:pre-wrap;color:rgba(55,53,47,.8);
  background:rgb(247,246,243);border-radius:4px;padding:9px 11px}
.kat .ur{width:104px;text-align:center}
.ur-p{display:inline-flex;align-items:center;gap:5px;border-radius:3px;padding:2px 8px;
  font-size:11.5px;white-space:nowrap}
.ur-ok{background:rgb(219,237,219);color:rgb(51,105,74)}
.ur-warn{background:rgb(253,236,200);color:rgb(160,113,32)}
.ur-nein{background:rgb(255,226,221);color:rgb(178,60,56)}
.legende{display:flex;gap:18px;font-size:12.5px;color:rgba(55,53,47,.6);
  align-items:center;flex-wrap:wrap;padding:12px 2px 0}

/* ---------- Grenzen: vier Karten ---------- */
.wege{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;
  margin:14px 0}
.weg{border:1px solid rgba(55,53,47,.12);border-radius:8px;padding:16px 18px;
  display:flex;flex-direction:column;gap:9px}
.weg .nr{width:24px;height:24px;border-radius:50%;background:rgb(241,241,239);
  display:grid;place-items:center;font-size:12.5px;font-weight:600;
  color:rgba(55,53,47,.6)}
.weg h4{font-size:16px;font-weight:600}
.weg p{font-size:13.5px;line-height:1.55;color:rgba(55,53,47,.7)}
.weg .bsp{background:rgb(247,246,243);border-radius:5px;padding:10px 12px;
  font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:1.6;
  white-space:pre-wrap;color:rgba(55,53,47,.8);margin-top:auto}
.weg .ur-p{align-self:flex-start}
`;

/* ============================================================
   Rahmen und wiederkehrende Bausteine
   ============================================================ */
function rahmen({datei, titel, hinweis, inhalt, gewinn, verlust, zusatz, unten}){
  const nav = SEITEN.map(([id,nm])=>
    '<a'+(id===datei?' class="hier"':"")+' href="'+id+'.html">'+esc(nm)+'</a>').join("");
  const liste = a => a.map(t=>'<li>'+t+'</li>').join("");
  return '<meta charset="UTF-8">\n'
  +'<meta name="viewport" content="width=device-width,initial-scale=1.0">\n'
  +'<title>Markdown im Notion-Stil — '+esc(titel)+'</title>\n'
  +'<style>'+STIL+STIL2+'</style>\n\n'
  +'<div class="meta"><b>Markdown-Editor im Notion-Stil</b>'
  +'<span>Entwurf, nicht umgesetzt</span><nav>'+nav+'</nav></div>\n'
  +'<p class="rahmenhinweis">'+hinweis+'</p>\n'
  +inhalt
  +(zusatz||"")
  +(gewinn ? '<div class="bilanz">'
    +'<section class="gewinn"><h3>Was der Notion-Weg bringt</h3><ul>'+liste(gewinn)+'</ul></section>'
    +'<section class="verlust"><h3>Was er kostet</h3><ul>'+liste(verlust)+'</ul></section>'
    +'</div>\n' : "")
  +(unten||"");
}

/* ---------- Der Dateibaum ----------
   Notions Seitenbaum wird hier zu dem, was ein Markdown-Editor
   wirklich hat: einem Ordner voller Dateien. Das ist die ehrlichste
   Entsprechung — eine Seite ist eine Datei, eine Unterseite eine
   Datei im Unterordner. */
function baum(aktiv){
  const z=(kl,em,nm,extra="")=>'<div class="ed-z '+kl+(nm===aktiv?" an":"")+'">'
    +'<span class="dre">'+(kl.includes("ord")?IK.chev:"")+'</span>'
    +'<span class="em">'+em+'</span><span class="nm">'+esc(nm)+'</span>'+extra+'</div>';
  return '<div class="ed-baum">'
  +'<div class="ed-wurzel">'+IK.ordner+'Notizbuch<span class="ch">'+IK.chevU+'</span></div>'
  +'<div class="ed-such">'+IK.lupe+'Suchen<kbd>Strg K</kbd></div>'
  +'<div class="ed-sek">Ordner<span class="sp"></span>'+IK.plus+'</div>'
  +z("ord","📁","Projekte")
  +z("k1","📄","Ablösung Altsystem.md")
  +z("k1","📄","Schnittstellen.md")
  +z("k1 ord","📁","Anhänge")
  +z("ord","📁","Notizen")
  +z("k1","📄","Preismodell Staffeln.md")
  +z("k1","📄","Wettbewerbs-Research.md")
  +z("ord","📁","Vorlagen")
  +z("k1","📄","Telefonnotiz.md")
  +z("k1","📄","Protokoll.md")
  +'<div class="ed-sek">Zuletzt<span class="sp"></span></div>'
  +'<div class="ed-z"><span class="dre"></span><span class="em">📄</span>'
    +'<span class="nm">Ablösung Altsystem.md</span><span class="kb">vor 4 Min.</span></div>'
  +'<div class="ed-fuss">'
  +'<div class="ed-z"><span class="dre"></span>'+IK.plus+'<span class="nm">Neue Datei</span></div>'
  +'<div class="ed-z"><span class="dre"></span>'+IK.punkte
    +'<span class="nm">Einstellungen</span></div>'
  +'</div></div>';
}

function kopfzeile(rechtsExtra, ansicht){
  const s = a => '<span'+(a===ansicht?' class="an"':"")+'>'+esc(a)+'</span>';
  return '<div class="ed-kopf">'
  +'<span class="ed-krume">📁 Projekte</span><span class="tr">/</span>'
  +'<span class="ed-krume">📄 Ablösung Altsystem.md</span>'
  +'<div class="re">'
  +(rechtsExtra||"")
  +'<div class="ed-schalt">'+s("Schreiben")+s("Geteilt")+s("Quelltext")+'</div>'
  +'<span class="kn">'+IK.sprech+'</span>'
  +'<span class="kn">'+IK.stern+'</span>'
  +'<span class="kn">'+IK.punkte+'</span>'
  +'</div></div>';
}

const gliederung = an => '<div class="ed-gl"><h4>Gliederung</h4>'
  +[["Ablösung Altsystem","t1"],["1 Bestandsaufnahme","t2"],["Schnittstellen","t3"],
    ["2 Zielbild","t2"],["Entscheidungen","t3"],["Offene Fragen","t3"],
    ["3 Umstellung","t2"],["4 Nachlauf","t2"]]
   .map(([t,k])=>'<a href="#" class="'+k+(t===an?" an":"")+'">'+esc(t)+'</a>').join("")
  +'</div>';

const fussleiste = (extra) => '<div class="ed-stat">'
  +'<span><b>412</b> Wörter</span><span><b>2 418</b> Zeichen</span>'
  +'<span>Zeile <b>34</b> · Spalte <b>18</b></span>'
  +'<span class="sp"></span>'
  +(extra||"")
  +'<span>Markdown · UTF-8 · LF</span>'
  +'<span class="neu">gespeichert vor 3 Sekunden</span></div>';

const griff = '<span class="gr"><span>'+IK.plus+'</span><span>'+IK.griff+'</span></span>';

/* ============================================================
   Das Beispieldokument
   Einmal geschrieben, viermal gebraucht: als Fläche, hinter dem
   Slash-Menü, hinter der Auswahlleiste und neben dem Quelltext.
   Der Text ist derselbe wie im Outliner-Entwurf der V2-Linie.
   ============================================================ */
const eig = (nm, ik, wert, leer) =>
  '<div class="r"><div class="l">'+IK[ik]+esc(nm)+'</div>'
  +'<div class="w'+(leer?" leer":"")+'">'+wert+'</div></div>';

function frontmatter(){
  return '<div class="ed-eig">'
  +eig("titel","text","Ablösung Altsystem")
  +eig("datum","text","2026-08-19")
  +eig("status","liste",'<span class="b-inline">laeuft</span>')
  +eig("schlagworte","liste",
      '<span class="b-inline">projekt</span> <span class="b-inline">altsystem</span> '
      +'<span class="b-inline">2026</span>')
  +eig("verantwortlich","text","Marco Bosse")
  +'<div class="ed-eig-fuss">'+IK.code
  +'YAML-Frontmatter · 5 Schlüssel · als Text zeigen'
  +'<span style="flex:1"></span>'+IK.plus+'Schlüssel hinzufügen</div>'
  +'</div>';
}

/* `zeig` markiert den Block, dessen Griff sichtbar sein soll —
   ein Bild kennt keinen Zeiger, also wird er gesetzt. */
function dokument({zeig, ende, markiert}={}){
  const g = n => (zeig===n ? " zeig" : "");
  const t1 = markiert
    ? 'Das Altsystem läuft seit <span class="markiert">elf Jahren</span> und trägt '
      +'noch immer die Auftragsbearbeitung.'
    : 'Das Altsystem läuft seit elf Jahren und trägt noch immer die Auftragsbearbeitung.';
  return frontmatter()
  +'<div class="b'+g(1)+'">'+griff+t1
    +' Abgelöst wird es <b>bis zum 18. Dezember</b>; bis dahin laufen beide '
    +'Systeme <i>parallel</i>. Der Stand steht in '
    +'<span class="b-verweis">📄 Schnittstellen.md</span>, die Zahlen kommen aus '
    +'<span class="b-inline">auftrag_export.csv</span>.</div>'

  +'<div class="b h2'+g(2)+'">'+griff+'1 Bestandsaufnahme</div>'
  +'<div class="b-todo fertig"><span class="ka">'+IK.haken+'</span>'
    +'<span class="tt">Schnittstellen erfassen — 12 gefunden</span></div>'
  +'<div class="b-todo fertig"><span class="ka">'+IK.haken+'</span>'
    +'<span class="tt">Datenmengen messen</span></div>'
  +'<div class="b-todo"><span class="ka"></span>'
    +'<span class="tt">Berichte sichten <span class="b-erw">@Kai Richter</span></span></div>'

  +'<div class="b-ruf blau"><span class="em">💡</span><div>Die zwölf Schnittstellen sind '
    +'nicht zwölf Programme. Vier davon sind derselbe Export mit anderem Dateinamen.</div></div>'

  +'<div class="b h3'+g(3)+'">'+griff+'Schnittstellen</div>'
  +'<table class="b-tab"><tr><th>Name</th><th>Richtung</th><th>Format</th></tr>'
  +'<tr><td>Auftragsexport</td><td>hinaus</td><td>CSV</td></tr>'
  +'<tr><td>Stammdaten</td><td>herein</td><td>XML</td></tr>'
  +'<tr><td>Rechnungslauf</td><td>hinaus</td><td>PDF</td></tr></table>'

  +'<div class="b h2'+g(4)+'">'+griff+'2 Zielbild</div>'
  +'<div class="b-pkt"><span class="m">•</span><span>Fachliche Anforderungen aus dem '
    +'Papier vom 18. August</span></div>'
  +'<div class="b-pkt"><span class="m">•</span><span>Technische Randbedingungen: '
    +'<b>eine Datei, offline, ohne Server</b></span></div>'

  +'<div class="b-tog"><span class="dre">'+IK.chevU+'</span>'
    +'<span><b>Entscheidungen</b></span></div>'
  +'<div class="kind">'
  +'<div class="b-pkt"><span class="m">•</span><span>Keine externen Abhängigkeiten</span></div>'
  +'<div class="b-pkt"><span class="m">•</span><span>Speicherung über '
    +'<span class="b-inline">localStorage</span></span></div>'
  +'</div>'

  +'<div class="b-zit">„Zwei Bedienkonzepte in einer Datei wären ein Umschalter, den '
    +'niemand pflegen will."</div>'

  +'<div class="b-code"><span class="spr">javascript</span><span class="kop">Kopieren</span>'
    +esc('const [d1, d2] = planTage();\nreturn DATEN.termine\n'
        +'  .filter(t => t.d === iso(d1) || t.d === iso(d2))\n'
        +'  .sort((a, b) => toMin(a.zeit) - toMin(b.zeit));')+'</div>'

  +'<div class="b-lin"></div>'
  +'<div class="b h3'+g(5)+'">'+griff+'Offene Fragen</div>'
  +'<div class="b-pkt"><span class="m grau">1.</span><span>Wer pflegt die Stammdaten '
    +'während der Parallelphase?</span></div>'
  +'<div class="b-pkt"><span class="m grau">2.</span><span>Bleibt der Rechnungslauf '
    +'im Altsystem? <span class="b-komm">— Rückfrage an Eva</span></span></div>'
  +(ende===false ? "" :
    '<div class="b-leer"><span class="pl">'+IK.plus+'</span>'
    +'Beginne zu schreiben, tippe „/" für Befehle</div>');
}

/* Der Quelltext desselben Dokuments. Er steht bewusst als eigener
   Text da und wird nicht gerechnet: Ein Entwurf soll zeigen, was
   herauskommen **soll**, nicht was ein halber Umwandler kann. */
const QUELLE = [
 ['<span class="q-fm">---</span>'],
 ['<span class="q-fm">titel: Ablösung Altsystem</span>'],
 ['<span class="q-fm">datum: 2026-08-19</span>'],
 ['<span class="q-fm">status: laeuft</span>'],
 ['<span class="q-fm">schlagworte: [projekt, altsystem, 2026]</span>'],
 ['<span class="q-fm">verantwortlich: Marco Bosse</span>'],
 ['<span class="q-fm">---</span>'],
 [''],
 ['<span class="q-mk"># </span><span class="q-h">Ablösung Altsystem</span>'],
 [''],
 ['Das Altsystem läuft seit elf Jahren und trägt noch immer die'],
 ['Auftragsbearbeitung. Abgelöst wird es <span class="q-mk">**</span>'
  +'<span class="q-b">bis zum 18. Dezember</span><span class="q-mk">**</span>; bis dahin'],
 ['laufen beide Systeme <span class="q-mk">*</span><span class="q-i">parallel</span>'
  +'<span class="q-mk">*</span>. Der Stand steht in'],
 ['<span class="q-mk">[</span><span class="q-l">Schnittstellen</span>'
  +'<span class="q-mk">](</span><span class="q-l">./Schnittstellen.md</span>'
  +'<span class="q-mk">)</span>, die Zahlen kommen aus '
  +'<span class="q-mk">`</span><span class="q-c">auftrag_export.csv</span>'
  +'<span class="q-mk">`</span>.'],
 [''],
 ['<span class="q-mk">## </span><span class="q-h">1 Bestandsaufnahme</span>'],
 [''],
 ['<span class="q-mk">- [x]</span> Schnittstellen erfassen — 12 gefunden'],
 ['<span class="q-mk">- [x]</span> Datenmengen messen'],
 ['<span class="q-mk">- [ ]</span> Berichte sichten '
  +'<span class="q-mk">[[</span><span class="q-l">Kai Richter</span>'
  +'<span class="q-mk">]]</span>'],
 [''],
 ['<span class="q-mk">> [!TIP]</span>   <span class="q-w">← Dialekt, siehe Grenzen</span>'],
 ['<span class="q-mk">> </span>Die zwölf Schnittstellen sind nicht zwölf Programme.'],
 ['<span class="q-mk">> </span>Vier davon sind derselbe Export mit anderem Dateinamen.'],
 [''],
 ['<span class="q-mk">### </span><span class="q-h">Schnittstellen</span>'],
 [''],
 ['<span class="q-mk">| </span>Name<span class="q-mk"> | </span>Richtung'
  +'<span class="q-mk"> | </span>Format<span class="q-mk"> |</span>'],
 ['<span class="q-mk">| --- | --- | --- |</span>'],
 ['<span class="q-mk">| </span>Auftragsexport<span class="q-mk"> | </span>hinaus'
  +'<span class="q-mk"> | </span>CSV<span class="q-mk"> |</span>'],
 ['<span class="q-mk">| </span>Stammdaten<span class="q-mk"> | </span>herein'
  +'<span class="q-mk"> | </span>XML<span class="q-mk"> |</span>'],
 ['<span class="q-mk">| </span>Rechnungslauf<span class="q-mk"> | </span>hinaus'
  +'<span class="q-mk"> | </span>PDF<span class="q-mk"> |</span>'],
 [''],
 ['<span class="q-mk">## </span><span class="q-h">2 Zielbild</span>'],
 [''],
 ['<span class="q-mk">- </span>Fachliche Anforderungen aus dem Papier vom 18. August'],
 ['<span class="q-mk">- </span>Technische Randbedingungen: '
  +'<span class="q-mk">**</span><span class="q-b">eine Datei, offline, ohne Server</span>'
  +'<span class="q-mk">**</span>'],
 [''],
 ['<span class="q-mk">&lt;details&gt;</span>   '
  +'<span class="q-w">← HTML, siehe Grenzen</span>'],
 ['<span class="q-mk">&lt;summary&gt;</span>Entscheidungen'
  +'<span class="q-mk">&lt;/summary&gt;</span>'],
 [''],
 ['<span class="q-mk">- </span>Keine externen Abhängigkeiten'],
 ['<span class="q-mk">- </span>Speicherung über <span class="q-mk">`</span>'
  +'<span class="q-c">localStorage</span><span class="q-mk">`</span>'],
 [''],
 ['<span class="q-mk">&lt;/details&gt;</span>'],
 [''],
 ['<span class="q-mk">> </span>„Zwei Bedienkonzepte in einer Datei wären ein'],
 ['<span class="q-mk">> </span>Umschalter, den niemand pflegen will."'],
 [''],
 ['<span class="q-mk">```javascript</span>'],
 ['<span class="q-c">const [d1, d2] = planTage();</span>'],
 ['<span class="q-c">return DATEN.termine</span>'],
 ['<span class="q-c">  .filter(t =&gt; t.d === iso(d1) || t.d === iso(d2))</span>'],
 ['<span class="q-c">  .sort((a, b) =&gt; toMin(a.zeit) - toMin(b.zeit));</span>'],
 ['<span class="q-mk">```</span>'],
 [''],
 ['<span class="q-mk">---</span>'],
 [''],
 ['<span class="q-mk">### </span><span class="q-h">Offene Fragen</span>'],
 [''],
 ['<span class="q-mk">1. </span>Wer pflegt die Stammdaten während der Parallelphase?'],
 ['<span class="q-mk">2. </span>Bleibt der Rechnungslauf im Altsystem?'],
 ['']
];

/* ============================================================
   1 — SCHREIBEN
   Der Editor in Ruhe. Alles, was Notion an einer Seite zeigt, auf
   eine Markdown-Datei übertragen: Dateibaum statt Seitenbaum,
   Frontmatter statt Eigenschaften, Blöcke statt Zeilen.
   ============================================================ */
function seiteSchreiben(){
  const inhalt =
   '<div class="ed hoch">'
  +kopfzeile(null,"Schreiben")
  +'<div class="ed-rumpf">'+baum("Ablösung Altsystem.md")
  +'<div class="ed-blatt"><div class="ed-deck"></div><div class="ed-seite">'
  +'<span class="ed-icon">🗂️</span>'
  +'<div class="ed-titel">Ablösung Altsystem</div>'
  +dokument({zeig:2})
  +'</div></div>'
  +gliederung("1 Bestandsaufnahme")
  +'</div>'
  +fussleiste()
  +'</div>';

  return rahmen({
    datei:"schreiben", titel:"Schreiben", inhalt,
    hinweis:'<b>Der Editor in Ruhe.</b> Links der Ordner statt Notions Seitenbaum — eine '
     +'Seite ist eine Datei, eine Unterseite eine Datei im Unterordner. Oben das '
     +'YAML-Frontmatter, gezeigt als Notions Eigenschaftenzeilen. In der Mitte die '
     +'708 Pixel breite Schreibspalte mit dem Blockgriff links am Zeiger. Rechts die '
     +'Gliederung, unten eine Fußleiste — die hat Notion nicht, eine Datei braucht sie.',
    gewinn:[
      '<b>Der Blockgriff.</b> <code>+</code> legt darüber etwas Neues an, <code>⠿</code> '
      +'zieht den ganzen Absatz an eine andere Stelle. Das ersetzt Ausschneiden und '
      +'Einfügen — der häufigste Handgriff beim Umsortieren.',
      '<b>Frontmatter wird lesbar.</b> Fünf YAML-Schlüssel sehen aus wie Felder, nicht wie '
      +'Text zwischen zwei Strichreihen. Ein Klick auf die Fußzeile zeigt wieder den '
      +'Rohtext.',
      '<b>Die Gliederung rechts</b> baut sich aus den Überschriften und springt. In einem '
      +'Textfeld muss man scrollen.',
      '<b>Alles ist eine Fläche, nichts ein Modus.</b> Kein Umschalten zwischen Schreiben '
      +'und Vorschau: Das Geschriebene sieht immer schon so aus, wie es wird.',
      '<b>Die Schreibspalte hat eine feste Breite.</b> 708 Pixel, egal wie breit das '
      +'Fenster ist — der wichtigste einzelne Griff für die Lesbarkeit.'
    ],
    verlust:[
      '<b>Der Rohtext ist weg.</b> Wer <code>**fett**</code> tippen will, sieht die '
      +'Sternchen nicht mehr. Für alle, die Markdown <i>können</i>, ist das ein Verlust — '
      +'deshalb braucht dieser Editor die geteilte Ansicht (siehe Quelltext).',
      '<b>Zeilennummern.</b> Blöcke haben keine. Die Fußleiste behauptet „Zeile 34", aber '
      +'die Zeile ist eine Eigenschaft der Datei, nicht der Fläche — bei weichem Umbruch '
      +'stimmt sie nur ungefähr.',
      '<b>Das Kopfbild und das Symbol</b> haben in Markdown keinen Ort. Sie müssten ins '
      +'Frontmatter (<code>cover:</code>, <code>icon:</code>) und wären damit ein Dialekt, '
      +'den nur dieser Editor versteht.',
      '<b>Die Kommentarmarkierung</b> in „Offene Fragen" ist gelb unterlegt. In der Datei '
      +'steht davon nichts — siehe Grenzen.'
    ]});
}

/* ============================================================
   2 — DAS SLASH-MENÜ
   Notions bekanntester Griff. Für einen Markdown-Editor lässt er
   sich um etwas erweitern, das Notion nicht braucht: Die Vorschau
   rechts zeigt nicht nur, wie der Block aussieht, sondern welchen
   Markdown-Text er erzeugt.
   ============================================================ */
function slashZeile(ic, nm, unter, taste, an){
  return '<div class="z'+(an?" an":"")+'"><span class="ic">'+ic+'</span>'
    +'<span class="t">'+esc(nm)+'<div class="u">'+esc(unter)+'</div></span>'
    +(taste?'<span class="ta">'+esc(taste)+'</span>':"")+'</div>';
}

function seiteSlash(){
  const menue =
   '<div class="mn slash" style="position:relative;margin:4px 0 0 -2px;width:640px">'
  +'<div class="li">'
  +'<div class="slash-feld">Filter: <b>tab</b></div>'
  +'<div class="k">Grundlegend</div>'
  +slashZeile("¶","Text","Ein einfacher Absatz.","")
  +slashZeile("H1","Überschrift 1","Große Abschnittsüberschrift.","# ")
  +slashZeile("H2","Überschrift 2","Mittlere Abschnittsüberschrift.","## ")
  +slashZeile("☑","To-do-Liste","Aufgaben mit Kästchen.","- [ ] ")
  +slashZeile("•","Aufzählung","Eine einfache Liste.","- ")
  +'<div class="k">Erweitert</div>'
  +slashZeile("⊞","Tabelle","Zeilen und Spalten mit Kopfzeile.","| ",true)
  +slashZeile("❝","Zitat","Abgesetzter Text mit Kante.","> ")
  +slashZeile("⌘","Codeblock","Text in fester Schrift, mit Sprache.","```")
  +slashZeile("—","Trennlinie","Waagerechter Strich.","---")
  +'</div>'
  +'<div class="vs">'
  +'<div class="h">Vorschau</div>'
  +'<div class="bild"><table class="b-tab" style="margin:0;font-size:13px">'
    +'<tr><th>Kopf</th><th>Kopf</th></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr>'
    +'<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table></div>'
  /* Das ist die Erweiterung gegenüber Notion: nicht nur wie es
     aussieht, sondern was in der Datei landet. */
  +'<div class="h">Was in die Datei kommt</div>'
  +'<div class="md">| <em>Kopf</em> | <em>Kopf</em> |\n| --- | --- |\n|  |  |\n|  |  |</div>'
  +'<div class="t">GFM-Tabelle. Läuft in GitHub, Obsidian, Pandoc und den meisten '
    +'anderen Werkzeugen.</div>'
  +'</div></div>';

  const inhalt =
   '<div class="ed" style="height:880px">'
  +kopfzeile(null,"Schreiben")
  +'<div class="ed-rumpf">'+baum("Ablösung Altsystem.md")
  +'<div class="ed-blatt"><div class="ed-seite" style="padding-top:26px">'
  +'<div class="ed-titel" style="font-size:32px">Ablösung Altsystem</div>'
  +'<div class="b">'+griff+'Das Altsystem läuft seit elf Jahren und trägt noch immer '
    +'die Auftragsbearbeitung.</div>'
  +'<div class="b h2">'+griff+'1 Bestandsaufnahme</div>'
  +'<div class="b-todo fertig"><span class="ka">'+IK.haken+'</span>'
    +'<span class="tt">Schnittstellen erfassen — 12 gefunden</span></div>'
  +'<div class="b zeig" style="font-size:16px">'+griff
    +'<span style="font-family:ui-monospace,Consolas,monospace">/tab</span>'
    +'<span style="border-left:1.6px solid rgb(35,131,226);margin-left:1px"></span></div>'
  +menue
  +'</div></div>'
  +gliederung()
  +'</div>'
  +fussleiste('<span>Slash-Menü offen · 9 von 34 Blöcken</span>')
  +'</div>';

  return rahmen({
    datei:"slash", titel:"Slash-Menü", inhalt,
    hinweis:'<b>„/" mitten im Text, und das Menü geht auf.</b> Getippt ist <code>/tab</code>, '
     +'die Liste ist schon gefiltert. Links die Blöcke mit ihrem Markdown-Kürzel rechts in '
     +'der Zeile — wer es zweimal gesehen hat, tippt beim dritten Mal gleich '
     +'<code>| </code>. Rechts die Vorschau, und die ist der eigentliche Einfall: '
     +'<b>Sie zeigt nicht nur, wie der Block aussieht, sondern was in der Datei landet.</b> '
     +'Das braucht Notion nicht — ein Markdown-Editor schon.',
    gewinn:[
      '<b>Ein Einstieg für alle Blöcke.</b> Wer die Syntax nicht kennt, tippt „/" und '
      +'sucht. Wer sie kennt, tippt sie direkt. Beide Wege führen zum selben Ergebnis.',
      '<b>Das Kürzel steht in der Zeile.</b> Das Menü ist damit nebenbei ein Lehrmittel: '
      +'Nach zwei Wochen braucht man es für die häufigen Blöcke nicht mehr.',
      '<b>Die Markdown-Vorschau rechts</b> nimmt dem Editor das Geheimnis. Man sieht vor '
      +'dem Einfügen, ob der Block echtes Markdown ist oder HTML — das entscheidet, ob '
      +'die Datei anderswo noch lesbar ist.',
      '<b>Filtern statt blättern.</b> Neun von vierunddreißig Blöcken, nach drei '
      +'Buchstaben.'
    ],
    verlust:[
      '<b>„/" ist ein Schriftzeichen.</b> Wer einen Pfad schreibt — <code>src/werkzeug</code> '
      +'— löst das Menü aus. Notion hat dasselbe Problem und löst es damit, dass das Menü '
      +'nur am Blockanfang aufgeht und beim Weitertippen ohne Treffer verschwindet. Das '
      +'muss ein Markdown-Editor nachbauen, sonst wird er lästig.',
      '<b>Vierunddreißig Blöcke sind zu viele</b> für ein Format, das etwa fünfzehn davon '
      +'wirklich kennt. Der Rest kommt aus HTML oder aus einem Dialekt und gehört '
      +'gekennzeichnet — hier tut das die Vorschau, aber nur, wenn man hinsieht.',
      '<b>Notions Menü kann Datenbanken einfügen.</b> Dieses hier kann es nicht, und die '
      +'Lücke fällt auf, sobald jemand Notion gewohnt ist.'
    ]});
}

/* ============================================================
   3 — AUSWAHL UND MENÜS
   Notions zweiter Griff: Text markieren, und über der Auswahl steht
   eine Leiste. Dazu der Musterbogen der drei Menüs, die daran und am
   Blockgriff hängen.
   ============================================================ */
function seiteAuswahl(){
  const leiste =
   '<div class="aus" style="top:-46px;left:10px">'
  +'<span class="kn">Text'+IK.chevU+'</span>'
  +'<span class="tr"></span>'
  +'<span class="kn">'+IK.kette+'Link</span>'
  +'<span class="kn">'+IK.sprech+'Kommentar</span>'
  +'<span class="tr"></span>'
  +'<span class="kn"><b>B</b></span>'
  +'<span class="kn"><i>I</i></span>'
  /* Unterstreichen steht hier blass: Markdown kennt es nicht. Genau
     dieselbe Entscheidung stand schon in der Formatierungsleiste,
     aus der dieser Entwurf hervorging. */
  +'<span class="kn aus1"><u>U</u></span>'
  +'<span class="kn"><s>S</s></span>'
  +'<span class="kn">'+IK.code+'</span>'
  +'<span class="tr"></span>'
  +'<span class="kn">A'+IK.chevU+'</span>'
  +'<span class="kn">'+IK.punkte+'</span>'
  +'</div>';

  const inhalt =
   '<div class="ed" style="height:560px">'
  +kopfzeile(null,"Schreiben")
  +'<div class="ed-rumpf">'+baum("Ablösung Altsystem.md")
  +'<div class="ed-blatt"><div class="ed-seite" style="padding-top:56px">'
  +'<div class="ed-titel" style="font-size:32px">Ablösung Altsystem</div>'
  +'<div class="ankr" style="position:relative;margin-top:74px">'+leiste
  +'<div class="b zeig">'+griff+'Das Altsystem läuft seit '
    +'<span class="markiert">elf Jahren</span> und trägt noch immer die '
    +'Auftragsbearbeitung. Abgelöst wird es <b>bis zum 18. Dezember</b>.</div>'
  +'</div>'
  +'<div class="b h2">'+griff+'1 Bestandsaufnahme</div>'
  +'<div class="b-todo fertig"><span class="ka">'+IK.haken+'</span>'
    +'<span class="tt">Schnittstellen erfassen — 12 gefunden</span></div>'
  +'<div class="b-leer"><span class="pl">'+IK.plus+'</span>'
    +'Beginne zu schreiben, tippe „/" für Befehle</div>'
  +'</div></div>'
  +'</div>'
  +fussleiste('<span>Auswahl: 9 Zeichen</span>')
  +'</div>';

  /* Der Musterbogen: die drei Menüs, die an der Leiste und am
     Blockgriff hängen, nebeneinander statt übereinander. */
  const mz = (ic, nm, unter, taste) =>
    '<div class="z"><span class="ic">'+ic+'</span>'
    +'<span class="t">'+esc(nm)+(unter?'<div class="u">'+esc(unter)+'</div>':"")+'</span>'
    +(taste?'<span class="ta">'+esc(taste)+'</span>':"")+'</div>';

  const umwandeln = '<div class="mn" style="position:relative;width:280px">'
    +'<div class="k">Umwandeln in</div>'
    +mz("¶","Text","","")
    +mz("H1","Überschrift 1","","# ")
    +mz("H2","Überschrift 2","","## ")
    +mz("H3","Überschrift 3","","### ")
    +mz("☑","To-do-Liste","","- [ ] ")
    +mz("•","Aufzählung","","- ")
    +mz("1.","Nummerierte Liste","","1. ")
    +mz("›","Toggle-Liste","","<details>")
    +mz("❝","Zitat","","> ")
    +mz("💡","Callout","","> [!NOTE]")
    +mz("⌘","Codeblock","","```")
    +'</div>';

  const farben = '<div class="mn farben" style="position:relative;width:250px">'
    +'<div class="k">Schriftfarbe</div>'
    +'<div class="z"><span class="pr" style="color:rgb(55,53,47)">A</span>'
      +'<span class="t">Standard</span></div>'
    +'<div class="z"><span class="pr" style="color:rgb(120,119,116)">A</span>'
      +'<span class="t">Grau</span></div>'
    +'<div class="z"><span class="pr" style="color:rgb(212,76,71)">A</span>'
      +'<span class="t">Rot</span></div>'
    +'<div class="tr"></div>'
    +'<div class="k">Hintergrund</div>'
    +'<div class="z"><span class="pr" style="background:rgb(251,243,196)">A</span>'
      +'<span class="t">Gelb markiert</span></div>'
    +'<div class="z"><span class="pr" style="background:rgb(211,229,239)">A</span>'
      +'<span class="t">Blau markiert</span></div>'
    +'<div class="z"><span class="pr" style="background:rgb(219,237,219)">A</span>'
      +'<span class="t">Grün markiert</span></div>'
    +'</div>';

  const blockmenue = '<div class="mn" style="position:relative;width:270px">'
    +mz("🗑","Löschen","","Entf")
    +mz("⧉","Duplizieren","","Strg D")
    +mz("↻","Umwandeln in","","")
    +mz("🔗","Link kopieren","","")
    +'<div class="tr"></div>'
    +mz("💬","Kommentar","","Strg ⇧ M")
    +mz("🎨","Farbe","","")
    +mz("↕","Verschieben nach","","")
    +'<div class="tr"></div>'
    +'<div style="padding:7px 9px;font-size:11.5px;color:rgba(55,53,47,.42);line-height:1.5">'
    +'Zuletzt bearbeitet: heute, 11:20<br>Block 12 von 34 · Absatz</div>'
    +'</div>';

  const unten =
   '<p class="rahmenhinweis" style="margin-top:26px"><b>Der Musterbogen.</b> Drei Menüs '
  +'hängen an der Leiste und am Blockgriff. Sie stehen hier nebeneinander statt '
  +'übereinander, damit man sie vergleichen kann. Im <b>Umwandeln</b>-Menü steht rechts '
  +'wieder das Markdown-Kürzel — dieselbe stille Lehre wie im Slash-Menü.</p>'
  +'<div style="max-width:1480px;margin:12px auto 60px;padding:0 22px;display:flex;gap:26px;'
  +'flex-wrap:wrap;align-items:flex-start;font-family:ui-sans-serif,-apple-system,'
  +'\'Segoe UI\',sans-serif;color:rgb(55,53,47)">'
  +'<div><div style="font-size:12px;color:#8a857a;margin-bottom:8px;'
    +'text-transform:uppercase;letter-spacing:.05em">Umwandeln in</div>'+umwandeln+'</div>'
  +'<div><div style="font-size:12px;color:#8a857a;margin-bottom:8px;'
    +'text-transform:uppercase;letter-spacing:.05em">Farbe</div>'+farben+'</div>'
  +'<div><div style="font-size:12px;color:#8a857a;margin-bottom:8px;'
    +'text-transform:uppercase;letter-spacing:.05em">Blockgriff ⠿</div>'+blockmenue+'</div>'
  +'</div>';

  return rahmen({
    datei:"auswahl", titel:"Auswahl & Menüs", inhalt, unten,
    hinweis:'<b>Text markieren, und die Leiste steht darüber.</b> Kein Menüband am '
     +'Fensterrand, keine Werkzeugleiste über dem Feld — die Bedienung kommt zum Text. '
     +'Ein Knopf ist blass: <b>U für Unterstreichen.</b> Markdown kennt es nicht, und '
     +'genau so stand es schon in der Formatierungsleiste, aus der dieser Entwurf '
     +'hervorging. Er bleibt sichtbar und abgeschaltet, statt zu fehlen — sonst sucht '
     +'man ihn.',
    gewinn:[
      '<b>Die Leiste kommt zum Text.</b> Eine feste Werkzeugleiste über dem Feld zwingt '
      +'bei jedem Wort denselben Weg hin und zurück.',
      '<b>„Umwandeln in" statt neu tippen.</b> Ein Absatz wird eine Überschrift, eine '
      +'Aufzählung wird eine To-do-Liste — ohne die Zeile anzufassen. Das ist der Griff, '
      +'den ein reines Textfeld grundsätzlich nicht hat.',
      '<b>Das Blockmenü sammelt alles an einer Stelle</b>: löschen, duplizieren, '
      +'verschieben, umwandeln, färben. Sieben Einträge statt sieben Tastenkombinationen.',
      '<b>Abgeschaltete Knöpfe lehren mit.</b> Das blasse <code>U</code> sagt „gibt es '
      +'nicht", ohne dass jemand danach sucht.'
    ],
    verlust:[
      '<b>Farbe ist kein Markdown.</b> Rot und Gelb-markiert brauchen <code>&lt;span '
      +'style&gt;</code> oder <code>==markiert==</code>. Das eine ist HTML, das andere ein '
      +'Dialekt. Beide stehen im Farbmenü, ohne dass es dort steht — der einzige Ort, an '
      +'dem dieser Entwurf schummelt.',
      '<b>Kommentare gibt es in einer .md-Datei nicht.</b> Der Knopf steht da und '
      +'verspricht etwas, das ohne zweite Datei nicht zu halten ist.',
      '<b>Durchgestrichen</b> (<code>~~so~~</code>) ist GFM, nicht Markdown. In Pandoc '
      +'ohne Erweiterung kommt es als Text an.',
      '<b>Die Leiste verdeckt die Zeile darüber.</b> Bei Auswahl in der ersten Zeile '
      +'muss sie nach unten springen — Notion tut das, und es ist mehr Aufwand, als es '
      +'aussieht.'
    ]});
}

/* ============================================================
   4 — DER BLOCKKATALOG
   Die eigentliche Antwort auf die Frage. Links, was Notion zeigt;
   rechts, was in der Datei steht; ganz rechts das Urteil: echtes
   Markdown, HTML/Dialekt, oder geht nicht.
   ============================================================ */
const URTEIL = {
  ok:   '<span class="ur-p ur-ok">echtes Markdown</span>',
  gfm:  '<span class="ur-p ur-ok">GFM</span>',
  html: '<span class="ur-p ur-warn">HTML</span>',
  dial: '<span class="ur-p ur-warn">Dialekt</span>',
  nein: '<span class="ur-p ur-nein">geht nicht</span>'
};

const KATALOG = [
  ["Text","",'<span style="font-size:15px">Ein einfacher Absatz.</span>',
   "Ein einfacher Absatz.","ok"],
  ["Überschrift 1–3","# ## ###",'<div class="h2" style="margin:0;font-size:20px">2 Zielbild</div>',
   "## 2 Zielbild","ok"],
  ["Aufzählung","- ",
   '<div class="b-pkt" style="font-size:15px"><span class="m">•</span><span>Erster Punkt</span></div>',
   "- Erster Punkt","ok"],
  ["Nummerierte Liste","1. ",
   '<div class="b-pkt" style="font-size:15px"><span class="m grau">1.</span><span>Erster Punkt</span></div>',
   "1. Erster Punkt","ok"],
  ["To-do-Liste","- [ ] ",
   '<div class="b-todo" style="font-size:15px"><span class="ka"></span><span class="tt">Berichte sichten</span></div>',
   "- [ ] Berichte sichten\n- [x] Erledigtes","gfm"],
  ["Zitat","> ",
   '<div class="b-zit" style="font-size:15px;margin:0">Ein abgesetzter Satz.</div>',
   "> Ein abgesetzter Satz.","ok"],
  ["Trennlinie","---",'<div class="b-lin" style="margin:14px 0"></div>',"---","ok"],
  ["Codeblock","```",
   '<div class="b-code" style="margin:0;font-size:12px;padding:24px 12px 12px">'
   +'<span class="spr">javascript</span>const n = 1;</div>',
   "```javascript\nconst n = 1;\n```","ok"],
  ["Text in Code","`…`",
   '<span style="font-size:15px">Der Wert <span class="b-inline">localStorage</span></span>',
   "Der Wert `localStorage`","ok"],
  ["Fett, kursiv","** *",
   '<span style="font-size:15px"><b>fett</b> und <i>kursiv</i></span>',
   "**fett** und *kursiv*","ok"],
  ["Durchgestrichen","~~",'<span style="font-size:15px"><s>verworfen</s></span>',
   "~~verworfen~~","gfm"],
  ["Unterstrichen","—",
   '<span style="font-size:15px;color:rgba(55,53,47,.4)"><u>unterstrichen</u></span>',
   "&lt;u&gt;unterstrichen&lt;/u&gt;","html"],
  ["Link","[ ]( )",
   '<span style="font-size:15px"><span class="b-verweis">Schnittstellen</span></span>',
   "[Schnittstellen](./Schnittstellen.md)","ok"],
  ["Bild","![ ]( )",
   '<div class="b-bild" style="margin:0"><div class="fl" style="height:64px;font-size:11px">'
   +'raster.png</div></div>',
   "![Das Raster](./bilder/raster.png)","ok"],
  ["Tabelle","| ",
   '<table class="b-tab" style="margin:0;font-size:13px"><tr><th>Name</th><th>Format</th></tr>'
   +'<tr><td>Export</td><td>CSV</td></tr></table>',
   "| Name | Format |\n| --- | --- |\n| Export | CSV |","gfm"],
  ["Callout","💡",
   '<div class="b-ruf blau" style="margin:0;padding:11px;font-size:14px">'
   +'<span class="em">💡</span><div>Vier davon sind derselbe Export.</div></div>',
   "> [!TIP]\n> Vier davon sind derselbe Export.","dial"],
  ["Toggle-Liste","›",
   '<div class="b-tog" style="font-size:15px"><span class="dre zu">'+IK.chevU+'</span>'
   +'<span>Entscheidungen</span></div>',
   "&lt;details&gt;\n&lt;summary&gt;Entscheidungen&lt;/summary&gt;\n\n…\n\n&lt;/details&gt;","html"],
  ["Markierter Text","==",
   '<span style="font-size:15px"><span class="b-marker">elf Jahre</span></span>',
   "==elf Jahre==","dial"],
  ["Farbiger Text","—",
   '<span style="font-size:15px" class="b-farbe">dringend</span>',
   "&lt;span style=\"color:#c0392b\"&gt;dringend&lt;/span&gt;","html"],
  ["Erwähnung","@ [[ ]]",
   '<span style="font-size:15px"><span class="b-erw">@Kai Richter</span></span>',
   "[[Kai Richter]]","dial"],
  ["Lesezeichen","",
   '<div class="b-marke" style="margin:0"><div class="l" style="padding:8px 10px">'
   +'<div class="t" style="font-size:13px">Handbuch</div>'
   +'<div class="u">conf.firma.de/hb</div></div><div class="r" style="width:54px"></div></div>',
   "[Handbuch](https://conf.firma.de/hb)","ok"],
  ["Inhaltsverzeichnis","",
   '<div style="font-size:13px;color:rgba(55,53,47,.6);line-height:1.7">1 Bestandsaufnahme'
   +'<br>&nbsp;&nbsp;Schnittstellen<br>2 Zielbild</div>',
   "&lt;!-- inhalt --&gt;   ← oder beim Speichern erzeugt","dial"],
  ["Eigenschaften","---",
   '<div style="font-size:13px;color:rgba(55,53,47,.6);line-height:1.7">'
   +'<span style="color:rgba(55,53,47,.45)">status</span>&nbsp;&nbsp;laeuft<br>'
   +'<span style="color:rgba(55,53,47,.45)">datum</span>&nbsp;&nbsp;2026-08-19</div>',
   "---\nstatus: laeuft\ndatum: 2026-08-19\n---","dial"],
  ["Spalten","",
   '<div class="b-spalten" style="margin:0;gap:10px;font-size:13px">'
   +'<div style="background:rgb(247,246,243);border-radius:4px;padding:8px">links</div>'
   +'<div style="background:rgb(247,246,243);border-radius:4px;padding:8px">rechts</div></div>',
   "—","nein"],
  ["Kommentar am Text","",
   '<span style="font-size:15px"><span class="b-komm">Rückfrage an Eva</span></span>',
   "—","nein"],
  ["Synchronisierter Block","",
   '<div style="font-size:13px;color:rgba(55,53,47,.5);border:1px dashed rgba(55,53,47,.2);'
   +'border-radius:4px;padding:8px">derselbe Inhalt an zwei Stellen</div>',
   "—","nein"],
  ["Datenbank","",
   '<div style="font-size:13px;color:rgba(55,53,47,.5)">Tabelle · Brett · Kalender</div>',
   "—","nein"]
];

function seiteBloecke(){
  const zeilen = KATALOG.map(([nm,taste,zeig,md,ur])=>
    '<tr><td class="nm">'+esc(nm)
      +(taste?'<span class="ta">'+esc(taste)+'</span>':"")+'</td>'
    +'<td class="zeig">'+zeig+'</td>'
    +'<td><div class="md">'+md+'</div></td>'
    +'<td class="ur">'+URTEIL[ur]+'</td></tr>').join("");

  const zaehl = k => KATALOG.filter(z=>z[4]===k).length;

  const inhalt =
   '<div style="max-width:1480px;margin:16px auto 0;padding:20px 26px 26px;background:#fff;'
  +'border:1px solid #e7e6e3;border-radius:10px;'
  +'font-family:ui-sans-serif,-apple-system,\'Segoe UI\',sans-serif;color:rgb(55,53,47)">'
  +'<table class="kat"><tr><th>Block</th><th>Wie er aussieht</th>'
  +'<th>Was in der Datei steht</th><th>Urteil</th></tr>'
  +zeilen+'</table>'
  +'<div class="legende">'
  +URTEIL.ok+'<span>läuft überall — '+(zaehl("ok"))+' Blöcke</span>'
  +URTEIL.gfm+'<span>GitHub-Markdown, sehr verbreitet — '+(zaehl("gfm"))+'</span>'
  +URTEIL.html+'<span>HTML im Markdown, gültig aber roh — '+(zaehl("html"))+'</span>'
  +URTEIL.dial+'<span>Dialekt eines Werkzeugs — '+(zaehl("dial"))+'</span>'
  +URTEIL.nein+'<span>ohne zweite Datei nicht zu haben — '+(zaehl("nein"))+'</span>'
  +'</div></div>';

  return rahmen({
    datei:"bloecke", titel:"Blockkatalog", inhalt,
    hinweis:'<b>'+KATALOG.length+' Blöcke, dreimal dieselbe Frage:</b> Wie sieht er aus, was '
     +'steht in der Datei, und was ist das für ein Markdown? Das ist die eigentliche '
     +'Antwort auf „Editor im Notion-Stil": Für jeden Block, den Notion kann, muss ein '
     +'Markdown-Editor entscheiden, ob er ihn wegläßt, in HTML ausweicht oder einen '
     +'Dialekt spricht. <b>'+zaehl("ok")+' Blöcke sind reines Markdown, '+zaehl("gfm")
     +' sind GitHub-Markdown, '+zaehl("html")+' brauchen HTML, '+zaehl("dial")
     +' einen Dialekt, '+zaehl("nein")+' gibt es ohne zweite Datei nicht.</b>',
    gewinn:[
      '<b>Zwei Drittel gehen ohne Trick.</b> Alles, was ein Text braucht — Überschriften, '
      +'Listen, Code, Zitate, Links, Bilder, Tabellen —, ist echtes oder verbreitetes '
      +'Markdown. Der Notion-Editor über Markdown ist keine Verrenkung, sondern liegt nahe.',
      '<b>Das Urteil steht in der Oberfläche.</b> Wenn das Slash-Menü und dieses Blatt '
      +'dieselbe Kennzeichnung tragen, weiß man vor dem Einfügen, was man sich einhandelt.',
      '<b>Der Dialekt ist eine Einstellung, keine Eigenschaft.</b> Callouts als '
      +'<code>&gt; [!TIP]</code> (GitHub, Obsidian) oder als <code>::: tip</code> '
      +'(Docusaurus, VitePress) — dieselbe Fläche, andere Ausgabe.'
    ],
    verlust:[
      '<b>Vier Blöcke sind nicht zu retten.</b> Spalten, Kommentare, synchronisierte '
      +'Blöcke und Datenbanken haben in einer .md-Datei keinen Ort. Wer sie will, braucht '
      +'eine zweite Datei — und damit ist es kein Markdown-Editor mehr, sondern ein '
      +'Editor, der Markdown exportiert.',
      '<b>HTML im Markdown ist gültig und trotzdem ein Bruch.</b> <code>&lt;details&gt;</code> '
      +'läuft auf GitHub, aber in Pandoc-PDF nicht, und im nächsten Editor sieht man '
      +'rohes HTML statt eines Toggles.',
      '<b>Dialekte sind Wetten.</b> <code>==markiert==</code> versteht Obsidian, GitHub '
      +'nicht. <code>[[Wiki-Link]]</code> versteht Obsidian, Pandoc nicht. Jede Wette '
      +'bindet die Datei an ein Werkzeug — das Gegenteil dessen, wofür man Markdown nimmt.',
      '<b>Das Kopfbild und das Seitensymbol</b> stehen nicht einmal in dieser Liste. Sie '
      +'sind reine Oberfläche und müssten ins Frontmatter.'
    ]});
}

/* ============================================================
   5 — QUELLTEXT
   Die geteilte Ansicht. Ohne sie wäre der Entwurf unehrlich: Ein
   Markdown-Editor, der den Rohtext versteckt, nimmt genau denen
   etwas weg, die Markdown gewählt haben, weil es lesbarer Text ist.
   ============================================================ */
function seiteQuelltext(){
  const nummern = QUELLE.map((_,i)=>String(i+1)).join("\n");
  /* Die zwei Zeilen, an denen der Editor die reine Sprache verlässt.
     Gesucht statt gezählt — sonst wandert die Markierung, sobald oben
     eine Zeile dazukommt. */
  const unrein = QUELLE.map(([z],i)=>
    (z.includes("[!TIP]") || z.includes("&lt;details&gt;")) ? i : -1).filter(i=>i>=0);
  const text = QUELLE.map(([z],i)=>
    (unrein.includes(i) ? '<span class="qzeile-an">'+(z||"&nbsp;")+'</span>' : (z||"&nbsp;"))
  ).join("\n");

  const inhalt =
   '<div class="ed hoch">'
  +kopfzeile(null,"Geteilt")
  +'<div class="ed-rumpf">'+baum("Ablösung Altsystem.md")
  +'<div class="ed-blatt"><div class="ed-seite" style="padding:26px 40px 60px;max-width:none">'
  +'<div class="ed-titel" style="font-size:30px">Ablösung Altsystem</div>'
  +dokument({ende:false})
  +'</div></div>'
  +'<div class="qspalte"><div class="qkopf">Ablösung Altsystem.md'
    +'<span class="sp"></span><span>Zeilenumbruch an</span>'
    +'<span>2 Stellen gelb: kein reines Markdown</span></div>'
  +'<div class="qrumpf"><div class="qnr">'+nummern+'</div>'
  +'<div class="q">'+text+'</div></div></div>'
  +'</div>'
  +fussleiste('<span>geteilt · 60 Zeilen</span>')
  +'</div>';

  return rahmen({
    datei:"quelltext", titel:"Quelltext", inhalt,
    hinweis:'<b>Links die Fläche, rechts die Datei.</b> Ohne diese Ansicht wäre der ganze '
     +'Entwurf unehrlich — wer Markdown wählt, wählt es, weil die Datei lesbarer Text ist. '
     +'Zwei Zeilen stehen gelb: <code>&gt; [!TIP]</code> und '
     +'<code>&lt;details&gt;</code>. Das sind die beiden Stellen in diesem Dokument, an '
     +'denen der Editor die reine Sprache verlässt — <b>sie werden markiert, nicht '
     +'versteckt.</b>',
    gewinn:[
      '<b>Nichts ist geheim.</b> Jeder Block ist an seiner Zeile nachzusehen. Wer die '
      +'Fläche nicht traut, arbeitet rechts weiter — dieselbe Datei, derselbe Stand.',
      '<b>Die gelbe Markierung ist die wichtigste Zeile des Entwurfs.</b> Sie beantwortet '
      +'im Vorbeigehen, was der Blockkatalog auf einem ganzen Blatt erklärt.',
      '<b>Drei Ansichten, ein Umschalter</b> oben rechts: Schreiben, Geteilt, Quelltext. '
      +'Notion hat nur die erste.',
      '<b>Wer Markdown tippt, wird nicht bestraft.</b> <code>## </code> am Zeilenanfang '
      +'wird sofort eine Überschrift — links wie rechts.'
    ],
    verlust:[
      '<b>Zwei Ansichten sind zwei Stände.</b> Die Schreibmarke muss in beiden dieselbe '
      +'Stelle meinen; das ist der teuerste Teil einer solchen Anwendung und der '
      +'häufigste Ort für Fehler.',
      '<b>Die Fläche ist breiter als 708 Pixel geworden.</b> Geteilt geht die feste '
      +'Schreibbreite verloren — der Gewinn aus „Schreiben" fällt hier weg.',
      '<b>Zeilennummern lügen ein bisschen.</b> Ein Absatz ist links ein Block und rechts '
      +'vier Zeilen. Was „Zeile 34" bedeutet, hängt davon ab, wo man steht.'
    ]});
}

/* ============================================================
   6 — GRENZEN
   Vier Blöcke lassen sich nicht übersetzen. Es gibt vier Wege damit
   umzugehen, und der Entwurf muss sich für einen entscheiden.
   ============================================================ */
function seiteGrenzen(){
  const weg = (nr, nm, txt, bsp, urteil) =>
   '<div class="weg"><span class="nr">'+nr+'</span><h4>'+esc(nm)+'</h4>'
   +'<p>'+txt+'</p>'+URTEIL[urteil]
   +'<div class="bsp">'+bsp+'</div></div>';

  const inhalt =
   '<div style="max-width:1480px;margin:16px auto 0;padding:22px 26px 26px;background:#fff;'
  +'border:1px solid #e7e6e3;border-radius:10px;'
  +'font-family:ui-sans-serif,-apple-system,\'Segoe UI\',sans-serif;color:rgb(55,53,47)">'

  +'<div style="font-size:19px;font-weight:600;margin-bottom:6px">'
  +'Was Notion kann und Markdown nicht</div>'
  +'<div style="font-size:14px;color:rgba(55,53,47,.6);line-height:1.6;max-width:74ch;'
  +'margin-bottom:18px">Vier Blöcke aus dem Katalog haben in einer .md-Datei keinen Ort: '
  +'<b>Spalten</b>, <b>Kommentare am Text</b>, <b>synchronisierte Blöcke</b> und '
  +'<b>Datenbanken</b>. Dazu kommen die Blöcke, die nur über HTML oder einen Dialekt '
  +'gehen. Für all das gibt es genau vier Antworten — und ein Editor muss sich für eine '
  +'entscheiden, bevor die erste Zeile Code entsteht.</div>'

  +'<div class="wege">'
  +weg(1,"Weglassen",
    "Was nicht in Markdown steht, gibt es nicht. Das Slash-Menü hat fünfzehn Einträge "
    +"statt vierunddreißig, und die Datei läuft in jedem Werkzeug der Welt.",
    "Kein Callout, kein Toggle,\nkeine Spalten, keine Farbe.\n\nDafür: eine Datei, die\nin zehn Jahren noch geht.",
    "ok")
  +weg(2,"HTML einbetten",
    "Markdown erlaubt HTML. <span class=\"b-inline\">&lt;details&gt;</span> wird ein "
    +"Toggle, <span class=\"b-inline\">&lt;span style&gt;</span> färbt Text. Gültig — "
    +"aber im nächsten Editor sieht man rohes HTML statt eines Blocks.",
    "&lt;details&gt;\n&lt;summary&gt;Entscheidungen&lt;/summary&gt;\n\n- Keine Abhängigkeiten\n\n&lt;/details&gt;",
    "html")
  +weg(3,"Einen Dialekt sprechen",
    "GitHub-Alerts für Callouts, <span class=\"b-inline\">==markiert==</span> für "
    +"Marker, <span class=\"b-inline\">[[Wiki-Links]]</span> für Erwähnungen. Sieht "
    +"gut aus — bindet die Datei aber an das Werkzeug, das den Dialekt kennt.",
    "&gt; [!TIP]\n&gt; Vier davon sind derselbe Export.\n\nDas Altsystem läuft seit ==elf Jahren==.",
    "dial")
  +weg(4,"Eine zweite Datei führen",
    "<span class=\"b-inline\">.md</span> bleibt sauber, alles Übrige steht daneben in "
    +"<span class=\"b-inline\">.md.json</span> — Kommentare, Spaltenbreiten, Farben. "
    +"Zwei Dateien, die zusammengehören und einzeln nichts wert sind.",
    "Ablösung Altsystem.md\nAblösung Altsystem.md.json\n\n{ \"kommentare\": [\n    {\"zeile\": 58,\n     \"text\": \"Rückfrage an Eva\"} ] }",
    "nein")
  +'</div>'

  +'<div style="font-size:19px;font-weight:600;margin:30px 0 6px">Mein Vorschlag</div>'
  +'<div style="font-size:14px;line-height:1.65;max-width:74ch;color:rgba(55,53,47,.78)">'
  +'<p style="margin-bottom:10px"><b>Weg 1 als Vorgabe, Weg 3 als Schalter, Weg 2 nur da, '
  +'wo Weg 3 nichts anbietet — und Weg 4 gar nicht.</b></p>'
  +'<p style="margin-bottom:10px">Der Grund steht in der Frage selbst: Wer einen '
  +'Markdown-Editor will und nicht Notion, will die Datei. Sobald der Inhalt in zwei '
  +'Dateien liegt, hat man Notions Nachteil (ein Werkzeug versteht es) ohne Notions '
  +'Vorteil (es kann dafür alles).</p>'
  +'<p style="margin-bottom:10px">Der Dialekt gehört in die Einstellungen, nicht in den '
  +'Code: <b>Rein · GitHub · Obsidian · Pandoc.</b> Dieselbe Fläche, andere Ausgabe. Und '
  +'das Slash-Menü blendet aus, was die gewählte Stufe nicht kann — statt es anzubieten '
  +'und hinterher zu enttäuschen.</p>'
  +'<p><b>Kommentare bleiben draußen.</b> Das ist der schwerste Verzicht, und er ist '
  +'trotzdem richtig: Ein Kommentar, der beim Kopieren der Datei verschwindet, ist '
  +'schlimmer als keiner.</p>'
  +'</div></div>';

  return rahmen({
    datei:"grenzen", titel:"Grenzen", inhalt,
    hinweis:'<b>Vier Blöcke lassen sich nicht übersetzen — und es gibt genau vier Wege, '
     +'damit umzugehen.</b> Diese Entscheidung steht vor der ersten Zeile Code, denn sie '
     +'bestimmt, wie viele Einträge das Slash-Menü hat und ob die Datei in zehn Jahren '
     +'noch etwas wert ist. Unten steht, wofür ich mich entscheiden würde und warum.'
    });
}

/* ============================================================
   7 — DIE ÜBERSICHT
   ============================================================ */
const KARTEN = [
  ["schreiben","🗂️","Schreiben","Der Editor in Ruhe: Ordner statt Seitenbaum, Frontmatter "
   +"als Eigenschaften, Blockgriff am Zeiger, Gliederung rechts, Fußleiste unten."],
  ["slash","⌨️","Slash-Menü",'„/" mitten im Text. Links die Blöcke mit ihrem '
   +'Markdown-Kürzel, rechts die Vorschau — und die zeigt, was in die Datei kommt.'],
  ["auswahl","🖍️","Auswahl & Menüs",'Die schwebende Leiste über der Auswahl, dazu der '
   +'Musterbogen von „Umwandeln in", Farbe und Blockgriff.'],
  ["bloecke","📋","Blockkatalog","Siebenundzwanzig Blöcke, dreimal dieselbe Frage: wie er "
   +"aussieht, was in der Datei steht, was für ein Markdown das ist."],
  ["quelltext","⌗","Quelltext","Links die Fläche, rechts die Datei. Zwei Zeilen gelb — "
   +"dort verlässt der Editor die reine Sprache."],
  ["grenzen","🚧","Grenzen","Vier Blöcke gehen nicht. Vier Wege, damit umzugehen, und ein "
   +"Vorschlag, welchen man nehmen sollte."]
];

function seiteIndex(){
  const nav = SEITEN.map(([id,nm])=>
    '<a'+(id==="index"?' class="hier"':"")+' href="'+id+'.html">'+esc(nm)+'</a>').join("");
  const karten = KARTEN.map(([id,em,nm,txt])=>
    '<a href="'+id+'.html"><span class="em">'+em+'</span><h3>'+esc(nm)+'</h3>'
    +'<p>'+esc(txt)+'</p></a>').join("");

  return '<meta charset="UTF-8">\n'
  +'<meta name="viewport" content="width=device-width,initial-scale=1.0">\n'
  +'<title>Markdown im Notion-Stil — Übersicht</title>\n'
  +'<style>'+STIL+STIL2+'</style>\n\n'
  +'<div class="meta"><b>Markdown-Editor im Notion-Stil</b>'
  +'<span>Sechs Flächen · Entwurf, nicht umgesetzt</span><nav>'+nav+'</nav></div>\n'

  +'<div class="blocktext">'
  +'<h2>Was hier liegt</h2>'
  +'<p>Sechs statische Entwürfe für einen <b>Markdown-Editor, der den Notion-Editor in '
  +'Oberfläche und Funktionen kopiert</b>: Blöcke statt Zeilen, Slash-Menü, Blockgriff, '
  +'schwebende Auswahlleiste, „Umwandeln in", Frontmatter als Eigenschaften.</p>'
  +'<p><b>Die Entwürfe sind der Sollzustand.</b> Kein Skript in diesen Dateien; die '
  +'Anwendung selbst steht in <code>editor.html</code> und holt sie Schritt für Schritt '
  +'ein. Wie weit sie ist, sagt <code>STAND.md</code>. Unter jeder Fläche stehen zwei '
  +'Spalten: was der Notion-Weg bringt und was er kostet.</p>'
  +'<p>Der Vergleichspunkt ist das, woraus dieser Entwurf hervorging: ein eigener '
  +'Markdown-Umwandler und eine feste Formatierungsleiste mit sechs Knöpfen — fett, '
  +'kursiv, Überschrift, Aufzählung, Trennlinie —, dazu ein Vorschau-Umschalter. Der '
  +'Notion-Weg ersetzt <b>Leiste und Vorschau zugleich</b>: Es gibt keine zwei Zustände '
  +'mehr, sondern eine Fläche.</p>'
  +'</div>'

  +'<div class="uebersicht">'+karten+'</div>'

  +'<div class="blocktext">'
  +'<h2>Der kurze Befund</h2>'
  +'<p><b>Der Notion-Editor passt auf Markdown besser, als man denkt.</b> Beide sind '
  +'zeilenweise gebaut: Ein Markdown-Absatz ist bereits ein Block, eine Überschrift ist '
  +'bereits ein Blocktyp. Von '+KATALOG.length+' Blöcken sind '
  +(KATALOG.filter(z=>z[4]==="ok"||z[4]==="gfm").length)+' reines oder '
  +'verbreitetes Markdown. Der Blockgriff, das Slash-Menü und „Umwandeln in" brauchen '
  +'überhaupt kein neues Dateiformat — sie bedienen nur, was ohnehin schon da ist.</p>'
  +'<p><b>Der Bruch liegt woanders, und er ist scharf.</b> Vier Blöcke — Spalten, '
  +'Kommentare, synchronisierte Blöcke, Datenbanken — haben in einer .md-Datei keinen '
  +'Ort. Weitere '+(KATALOG.filter(z=>z[4]==="html"||z[4]==="dial").length)
  +' gehen nur über HTML oder einen Dialekt. Ein Editor, der Notion '
  +'kopiert, muss <b>vor der ersten Zeile Code</b> entscheiden, wie weit er dabei '
  +'mitgeht.</p>'
  +'<p><b>Mein Vorschlag</b> steht auf der Seite <a href="grenzen.html">Grenzen</a>: '
  +'reines Markdown als Vorgabe, der Dialekt als Schalter in den Einstellungen '
  +'(Rein · GitHub · Obsidian · Pandoc), HTML nur dort, wo der Dialekt nichts anbietet — '
  +'und eine zweite Datei gar nicht. Wer einen Markdown-Editor will und nicht Notion, '
  +'will die Datei.</p>'
  +'<h2>Der eine Griff, der Notion fehlt</h2>'
  +'<p>Das Slash-Menü zeigt rechts nicht nur, <i>wie</i> der Block aussieht, sondern '
  +'<i>was in die Datei kommt</i> — und ob das reines Markdown ist. In der geteilten '
  +'Ansicht sind dieselben Stellen im Quelltext gelb markiert. Notion braucht das nicht, '
  +'weil es keine Datei gibt. Für einen Markdown-Editor ist es der Unterschied zwischen '
  +'einem Werkzeug, dem man traut, und einem, das hinter dem Rücken HTML schreibt.</p>'
  +'</div>\n';
}

/* ============================================================
   Schreiben
   ============================================================ */
mkdirSync("mockups",{recursive:true});
const DATEIEN = [
  ["index.html",     seiteIndex()],
  ["schreiben.html", seiteSchreiben()],
  ["slash.html",     seiteSlash()],
  ["auswahl.html",   seiteAuswahl()],
  ["bloecke.html",   seiteBloecke()],
  ["quelltext.html", seiteQuelltext()],
  ["grenzen.html",   seiteGrenzen()]
];
for(const [nm,inh] of DATEIEN){
  writeFileSync("mockups/"+nm, inh, "utf8");
  console.log("  geschrieben  mockups/"+nm+"  "
    +String(inh.length).padStart(6)+" Zeichen");
}

/* ============================================================
   Der Blockkatalog als Dokument

   `mockups/bloecke.html` und `doku/BLOCKKATALOG.md` sind dasselbe in
   zwei Formen. Damit sie nicht auseinanderlaufen, kommen beide aus
   dieser einen Liste — ändert sich ein Urteil, ändert es sich in
   beiden. `werkzeug/pruefen.mjs` verlangt, dass jede Zeile eines
   trägt.
   ============================================================ */
const URTEIL_TEXT = { ok:"rein", gfm:"GFM", html:"HTML", dial:"Dialekt", nein:"geht nicht" };

/* Was `editor.html` heute kann. Wird beim Abarbeiten der Roadmap
   fortgeschrieben — die Spalte ist der ehrlichste Fortschrittsbalken,
   den dieses Projekt hat. */
const GEBAUT = ["Text","Überschrift 1–3","Aufzählung","Nummerierte Liste","To-do-Liste",
  "Zitat","Trennlinie","Codeblock","Text in Code","Fett, kursiv","Durchgestrichen",
  "Markierter Text","Link"];

function blockkatalog(){
  /* Ein Codespan braucht mehr Rueckstriche als der laengste Lauf
     darin — sonst zerfaellt genau die Zeile, die einen Codeblock
     erklaeren soll. Und ein Balken im Text braende die Tabelle. */
  const mono = (t) => {
    if (!t || t === "—") return "—";
    const lang = (t.match(/`+/g) || [""]).reduce((a,b) => b.length > a.length ? b : a, "");
    const zaun = "`".repeat(lang.length + 1);
    return zaun + " " + t.replace(/\|/g, "\\|") + " " + zaun;
  };
  const roh = (t) => t.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');

  const zeile = ([nm, taste, , md, ur]) => "| " + [
    nm,
    mono(taste.trim()),
    /* Leerzeilen bleiben leer — ein Strich hiesse "nichts", und
       genau das steht dort nicht. */
    roh(md).split("\n").map((z) => z ? mono(z) : "").join("<br>"),
    URTEIL_TEXT[ur],
    GEBAUT.indexOf(nm) >= 0 ? "gebaut" : "offen"
  ].join(" | ") + " |";

  const zahl = (k) => KATALOG.filter(z => z[4] === k).length;

  return "# Blockkatalog\n\n"
  + "Für jeden Block, den Notion kann, muss dieser Editor entscheiden: "
  + "weglassen, in HTML ausweichen, einen Dialekt sprechen — oder er geht gar nicht.\n\n"
  + "**Diese Datei wird erzeugt.** Sie kommt aus `KATALOG` in "
  + "`werkzeug/bau-mockups.mjs`, genau wie `mockups/bloecke.html`. "
  + "Ändern heißt: dort ändern und `node werkzeug/bau-mockups.mjs` laufen lassen.\n\n"
  + "| Block | Kürzel | In der Datei | Urteil | Stand |\n"
  + "|---|---|---|---|---|\n"
  + KATALOG.map(zeile).join("\n") + "\n\n"
  + "## Was die Urteile bedeuten\n\n"
  + "* **rein** — läuft in jedem Werkzeug der Welt. " + zahl("ok") + " Blöcke.\n"
  + "* **GFM** — GitHub-Markdown, sehr verbreitet, aber eine Erweiterung. "
  + zahl("gfm") + " Blöcke.\n"
  + "* **HTML** — gültiges Markdown, im nächsten Editor aber rohes HTML statt eines "
  + "Blocks. " + zahl("html") + " Blöcke.\n"
  + "* **Dialekt** — bindet die Datei an das Werkzeug, das ihn kennt. "
  + zahl("dial") + " Blöcke.\n"
  + "* **geht nicht** — ohne eine zweite Datei nicht zu haben. "
  + zahl("nein") + " Blöcke. Siehe `doku/ENTSCHEIDUNGEN.md`, Punkt 1.\n\n"
  + "## Stand\n\n"
  + "**" + GEBAUT.length + " von " + KATALOG.length + " Blöcken sind gebaut.** "
  + "Welcher Schritt welchen bringt, steht in `doku/ROADMAP.md`.\n";
}

mkdirSync("doku", { recursive: true });
writeFileSync("doku/BLOCKKATALOG.md", blockkatalog(), "utf8");
console.log("  geschrieben  doku/BLOCKKATALOG.md");

console.log("\n  "+DATEIEN.length
  +" Dateien. Zum Ansehen: mockups/index.html öffnen.");
