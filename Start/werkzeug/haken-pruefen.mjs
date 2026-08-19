/* ============================================================
   Haken nach jeder Aenderung

   Haengt in .claude/settings.json unter PostToolUse und laeuft, sobald
   Claude Code eine Datei geschrieben hat. Betrifft die Aenderung
   editor.html, laeuft die Regelpruefung sofort — nicht erst am Ende
   der Sitzung, wenn zwanzig Aenderungen uebereinanderliegen und keiner
   mehr weiss, welche den Fehler brachte.

   Rueckgabewert 2 meldet den Fehlertext an Claude Code zurueck.
   ============================================================ */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

let roh = "";
try { roh = readFileSync(0, "utf8"); } catch { /* ohne Eingabe vorsichtshalber pruefen */ }

let pfad = "";
try { pfad = (JSON.parse(roh).tool_input || {}).file_path || ""; } catch { /* egal */ }

const GEPRUEFT = ["editor.html", "BLOCKKATALOG.md"];
if (pfad && !GEPRUEFT.some(n => pfad.endsWith(n))) process.exit(0);

try {
  execFileSync("node", ["werkzeug/pruefen.mjs"], { encoding: "utf8" });
  process.exit(0);
} catch (e) {
  const text = (e.stdout || "") + (e.stderr || "");
  const schlimm = text.split("\n").filter(z => z.includes("✗"));
  console.error("werkzeug/pruefen.mjs meldet Fehler:\n" + (schlimm.join("\n") || text.slice(-1200)));
  console.error("\nErst beheben, dann weiterarbeiten. Regeln: CLAUDE.md");
  process.exit(2);
}
