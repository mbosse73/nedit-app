/* ============================================================
   Lage in zwanzig Zeilen

   Laeuft beim Sitzungsbeginn (Haken in .claude/settings.json) und sagt
   Claude Code in einem Absatz, wo es steht: Branch, letzte Commits,
   was offen ist. Das ersetzt kein Lesen von STAND.md, spart aber den
   ersten Rateversuch.

   Aufruf: node werkzeug/lage.mjs
   ============================================================ */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

/* Ohne Git soll hier nichts rot herausfallen — die Meldung von git
   geht deshalb ins Leere, nicht auf die Fehlerausgabe. */
const still = (b) => {
  try { return execSync(b, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return ""; }
};

const branch = still("git rev-parse --abbrev-ref HEAD") || "kein Git";
const letzte = still("git log --oneline -3");
const dreck  = still("git status --short");

let zeilen = 0;
if (existsSync("editor.html")) zeilen = readFileSync("editor.html", "utf8").split("\n").length;

console.log("Markdown-Editor im Notion-Stil · Branch " + branch
  + (zeilen ? "  · editor.html " + zeilen + " Zeilen" : ""));

if (letzte) {
  console.log("");
  console.log("Zuletzt:");
  letzte.split("\n").forEach(z => console.log("  " + z));
}
if (dreck) {
  console.log("");
  console.log("Nicht eingecheckt:");
  dreck.split("\n").slice(0, 8).forEach(z => console.log("  " + z));
}

/* Der offene Teil von STAND.md, nicht die ganze Vorgeschichte. */
if (existsSync("STAND.md")) {
  const t = readFileSync("STAND.md", "utf8");
  const ab = t.indexOf("## Offen");
  if (ab >= 0) {
    const punkte = [...t.slice(ab).matchAll(/^###\s+(.+)$/gm)].map(m => m[1]).slice(0, 5);
    if (punkte.length) {
      console.log("");
      console.log("Offen laut STAND.md:");
      punkte.forEach(p => console.log("  " + p));
    }
  }
}
console.log("");
console.log("Regeln: CLAUDE.md · Ablauf: doku/ARBEITSWEISE.md · Naechstes: doku/ROADMAP.md");
